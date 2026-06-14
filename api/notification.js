/**
 * Vercel Serverless Function - Webhook IPN Zitopay
 * Reçue automatiquement par Zitopay après un paiement
 * Remplace : server/controllers/zitoPayController.js (handleNotification)
 */
import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Méthode non autorisée' });
  }

  try {
    // Zitopay envoie les données en POST (p, sa, amount, ref, statut, etc.)
    const data = req.body;
    const reference = data.ref || data.reference;
    const statut = data.statut || data.status;

    console.log('📩 Notification Zitopay reçue:', { reference, statut, data });

    if (!reference) {
      return res.status(400).json({ success: false, message: 'Référence manquante' });
    }

    // Récupérer la transaction dans Firestore
    const transactionRef = db.collection('transactions_zitopay').doc(reference);
    const transactionSnap = await transactionRef.get();

    if (!transactionSnap.exists) {
      console.error('Transaction introuvable:', reference);
      return res.status(404).json({ success: false, message: 'Transaction introuvable' });
    }

    const transaction = transactionSnap.data();

    // Vérifier que le paiement est bien "réussi" ou "completed"
    if (statut === 'success' || statut === 'completed') {
      // Mettre à jour la transaction
      await transactionRef.update({
        statut: 'completed',
        paid_at: admin.firestore.FieldValue.serverTimestamp(),
        notification_data: data
      });

      // Activer l'inscription de l'utilisateur (30 jours)
      const inscriptionRef = db.collection('inscriptions').doc();
      const now = new Date();
      const expiration = new Date(now);
      expiration.setDate(expiration.getDate() + 30);

      await inscriptionRef.set({
        user_id: transaction.user_id,
        prepa_id: transaction.prepa_id,
        date_inscription: admin.firestore.FieldValue.serverTimestamp(),
        date_expiration: admin.firestore.Timestamp.fromDate(expiration),
        statut: 'active',
        transaction_id: reference,
      });

      // Créer une notification de succès
      await db.collection('notifications').add({
        user_id: transaction.user_id,
        prepa_id: transaction.prepa_id,
        transaction_id: reference,
        montant: transaction.montant,
        message: `
          <strong>Paiement réussi pour la préparation "${transaction.nom || 'Préparation'}"</strong><br><br>
          Identifiant de transaction : ${reference}<br>
          Montant : ${transaction.montant} XAF<br>
          Date : ${now.toLocaleDateString('fr-FR')} ${now.toLocaleTimeString('fr-FR')}<br><br>
          Votre inscription est active pour 30 jours.<br><br>
          <em>Conservez cet identifiant pour référence future.</em>
        `,
        date_creation: admin.firestore.FieldValue.serverTimestamp(),
        lu: false,
      });

      console.log('✅ Paiement traité avec succès:', reference);
    } else {
      // Paiement échoué ou annulé
      await transactionRef.update({
        statut: statut || 'failed',
        notification_data: data
      });
      console.log('❌ Paiement échoué:', reference);
    }

    // Répondre à Zitopay pour accuser réception
    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('Erreur notification Zitopay:', error);
    return res.status(500).json({ success: false, message: 'Erreur interne' });
  }
}