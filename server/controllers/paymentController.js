const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

// Note: Cette fonction est obsolète pour ZitoPay depuis la nouvelle implémentation.
// La vraie validation se fait via zitoPayController.js (Webhook IPN).
// Conservé uniquement pour rétrocompatibilité temporaire ou autres méthodes de paiement futures.
exports.processPayment = async (req, res) => {
  const authenticatedUserId = req.user.id;
  const { prepaId, amount, paymentMethod } = req.body;

  console.log('=== LOG OBSOLÈTE PAIEMENT ===');
  console.log('Appel à processPayment (ancienne méthode) pour prepaId:', prepaId);

  // Si c'est Zitopay, la validation est déjà asynchrone via IPN.
  if (paymentMethod === 'zitopay') {
    return res.status(200).json({
      status: 'success',
      message: 'Le paiement ZitoPay est géré en arrière-plan. Cette route ne valide plus directement l\'inscription.'
    });
  }

  // Pour d'autres méthodes (ex: simulations manuelles si conservées)
  res.status(400).json({ status: 'failure', message: 'Méthode de paiement non supportée par cette route' });
};
