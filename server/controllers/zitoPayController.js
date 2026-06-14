const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

// Initialiser une transaction (Appelé par le Frontend avant d'ouvrir ZitoPay)
exports.initTransaction = async (req, res) => {
  const userId = req.user.id;
  const { prepaId, amount } = req.body;

  try {
    // 1. Vérifier si l'utilisateur a déjà une inscription active
    const [existingInscription] = await db.query(
      'SELECT * FROM inscriptions WHERE user_id = ? AND prepa_id = ? AND statut = "active" AND date_expiration > NOW()',
      [userId, prepaId]
    );

    if (existingInscription.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Vous avez déjà une inscription active pour cette préparation'
      });
    }

    // 2. Générer une référence unique pour ZitoPay
    const timestamp = Date.now();
    const shortUserId = userId.substring(0, 8);
    // Format: ZITO_{userId}_{timestamp} -> max 84 chars
    const transactionReference = `ZITO_${shortUserId}_${timestamp}`;

    // 3. Enregistrer la transaction en attente
    const transactionId = uuidv4();
    await db.query(
      'INSERT INTO transactions_zitopay (id, user_id, prepa_id, reference, amount, statut, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
      [transactionId, userId, prepaId, transactionReference, amount, 'pending']
    );

    logger.info(`Transaction initialisée: ${transactionReference}`);

    // 4. Renvoyer la référence et l'URL de notification au client
    const notificationUrl = process.env.ZITOPAY_NOTIFICATION_URL || 'http://localhost:8001/api/payment/zitopay/notification';

    res.json({
      success: true,
      reference: transactionReference,
      amount: amount,
      notificationUrl: notificationUrl
    });
  } catch (error) {
    logger.error('Erreur initTransaction:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// Webhook IPN (Appelé en arrière-plan par les serveurs ZitoPay)
exports.handleNotification = async (req, res) => {
  const ref = req.body.ref || req.query.ref;
  const status = req.body.status || req.query.status || 'success';
  const amount = req.body.amount || req.query.amount;

  try {
    logger.info('--- IPN ZitoPay Reçu ---');
    logger.info('Payload:', { body: req.body, query: req.query });

    if (!ref) {
      return res.status(400).json({ status: 'error', message: 'Référence manquante' });
    }

    const completed = await completeTransactionByRef(ref, amount);

    if (completed) {
      return res.status(200).json({ status: 'success' });
    } else {
      return res.status(400).json({ status: 'error', message: 'Échec de validation' });
    }
  } catch (error) {
    logger.error('Erreur handleNotification:', error);
    res.status(500).json({ status: 'error' });
  }
};

// Redirection de succès depuis ZitoPay (Chargée dans l'iframe)
exports.handleSuccess = async (req, res) => {
  const ref = req.body.ref || req.query.ref || req.query.transaction_id;
  const amount = req.body.amount || req.query.amount;

  try {
    let prepaId = 'unknown';

    if (ref) {
      // 1. Valider la transaction en base
      await completeTransactionByRef(ref, amount);

      // 2. Chercher la prepaId pour le signal
      const [transaction] = await db.query(
        'SELECT prepa_id FROM transactions_zitopay WHERE reference = ?',
        [ref]
      );
      if (transaction.length > 0) {
        prepaId = transaction[0].prepa_id;
      }
    }

    // On renvoie une page simple qui communique avec le parent (l'application) via l'iframe
    res.send(`
      <!DOCTYPE html>
      <html>
      <head><title>Paiement Réussi</title></head>
      <body style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;text-align:center;background:white;margin:0;">
        <div style="color:#28a745;font-size:48px;margin-bottom:10px;">✓</div>
        <h2 style="color:#333;margin-bottom:5px;">Paiement Réussi !</h2>
        <p style="color:#666;font-size:0.9rem;">Finalisation de votre inscription...</p>
        <script>
          // On prévient l'application parente
          if (window.parent) {
            window.parent.postMessage({ 
              type: 'payment_success', 
              prepaId: "${prepaId}",
              ref: "${ref || ''}"
            }, "*");
          }
        </script>
      </body>
      </html>
    `);

  } catch (error) {
    logger.error('Erreur handleSuccess:', error);
    res.status(500).send('Erreur lors de la validation du paiement');
  }
};

// Redirection d'annulation
exports.handleCancel = (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <body style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;text-align:center;background:white;margin:0;">
      <div style="color:#dc3545;font-size:48px;margin-bottom:10px;">✕</div>
      <h2 style="color:#333;margin-bottom:5px;">Paiement Annulé</h2>
      <script>
        if (window.parent) {
          window.parent.postMessage({ type: 'payment_cancel' }, "*");
        }
      </script>
    </body>
    </html>
  `);
};

// --- Logique métier partagée pour valider une transaction avec SQL TRANSACTIONS ---
async function completeTransactionByRef(ref, amount) {
  logger.info(`Validation transaction par référence (Avec Transactions): ${ref}`);

  // Obtenir une connexion dédiée du pool pour utiliser beginTransaction()
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Trouver la transaction avec un lock "FOR UPDATE" pour éviter les courses concurrentielles
    const [transactions] = await connection.query(
      'SELECT * FROM transactions_zitopay WHERE reference = ? FOR UPDATE',
      [ref]
    );

    if (transactions.length === 0) {
      logger.warn(`Transaction introuvable pour ref: ${ref}`);
      await connection.rollback();
      return false;
    }

    const transaction = transactions[0];

    // Si déjà complétée, on s'arrête là (idempotence)
    if (transaction.statut === 'completed') {
      logger.info(`Transaction ${ref} déjà marquée complétée.`);
      await connection.rollback(); // Pas d'erreur, mais on a rien modifié
      return true;
    }

    // 2. Mettre à jour le statut en base
    await connection.query(
      'UPDATE transactions_zitopay SET statut = ?, completed_at = NOW() WHERE reference = ?',
      ['completed', ref]
    );

    // 3. Valider l'inscription (En passant la connexion)
    await createOrUpdateInscriptionTransactional(connection, transaction.user_id, transaction.prepa_id, ref);

    // 4. Créer la notification utilisateur (En passant la connexion)
    await createPaymentNotificationTransactional(connection, transaction.user_id, transaction.prepa_id, transaction.amount, ref);

    // Si on arrive ici, tout s'est bien passé
    await connection.commit();
    logger.info(`✅ Transaction ${ref} validée avec succès et sauvegardée.`);
    return true;

  } catch (error) {
    // En cas de problème, on annule TOUTES les requêtes passées sur cette connection
    logger.error(`Erreur critique durant la validation de ${ref}. Rollback en cours...`, error);
    await connection.rollback();
    return false;
  } finally {
    // Toujours relâcher la connexion pour ne pas bloquer le pool
    connection.release();
  }
}

// --- Fonctions Utilitaires Transactionnelles ---

async function createOrUpdateInscriptionTransactional(connection, userId, prepaId, transactionRef) {
  logger.info(`[DEBUT] createOrUpdateInscriptionTransactional`);
  const inscriptionDate = new Date();
  const expirationDate = new Date(inscriptionDate);
  expirationDate.setDate(expirationDate.getDate() + 30); // 30 jours

  const [expiredInscription] = await connection.query(
    'SELECT * FROM inscriptions WHERE user_id = ? AND prepa_id = ? AND (statut = "expirée" OR date_expiration <= NOW())',
    [userId, prepaId]
  );

  if (expiredInscription.length > 0) {
    await connection.query(
      'UPDATE inscriptions SET date_inscription = ?, date_expiration = ?, statut = "active", transaction_id = ? WHERE id = ?',
      [inscriptionDate, expirationDate, transactionRef, expiredInscription[0].id]
    );
  } else {
    const inscriptionId = uuidv4();
    logger.info(`Création d'une NOUVELLE inscription: ${inscriptionId}`);
    await connection.query(
      'INSERT INTO inscriptions (id, user_id, prepa_id, date_inscription, date_expiration, statut, transaction_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [inscriptionId, userId, prepaId, inscriptionDate, expirationDate, 'active', transactionRef]
    );
  }
  logger.info(`[FIN] createOrUpdateInscriptionTransactional`);
}

async function createPaymentNotificationTransactional(connection, userId, prepaId, amount, transactionRef) {
  const [prepaResult] = await connection.query('SELECT nom FROM prepa_concours WHERE id = ?', [prepaId]);
  const prepaName = prepaResult[0]?.nom || 'Préparation';

  const notificationId = uuidv4();
  const message = `
    <strong>Paiement ZitoPay confirmé pour "${prepaName}"</strong><br><br>
    Référence : ${transactionRef}<br>
    Montant : ${amount} XAF<br>
    Votre inscription est active pour 30 jours.<br>
  `;

  await connection.query(
    'INSERT INTO notifications (id, user_id, message, transaction_id, prepa_id, montant, date_creation) VALUES (?, ?, ?, ?, ?, ?, NOW())',
    [notificationId, userId, message, transactionRef, prepaId, amount]
  );
}
