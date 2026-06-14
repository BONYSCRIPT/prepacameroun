const express = require('express');
const router = express.Router();
const zitoPayController = require('../controllers/zitoPayController');
const authMiddleware = require('../middleware/authMiddleware');

// Route pour initialiser une transaction
router.post('/init', authMiddleware, zitoPayController.initTransaction);

// Route pour vérifier un paiement (côté client) - OBSOLETE (Maintenant géré par IPN)
// router.post('/verify', authMiddleware, zitoPayController.verifyPayment);

// Webhook de notification ZitoPay (pas d'auth car vient de ZitoPay)
router.post('/notification', zitoPayController.handleNotification);

// Routes de redirection (ZitoPay appelle ces URLs en fin de processus)
// On accepte POST car ZitoPay transmet les données de paiement ainsi
router.all('/success', zitoPayController.handleSuccess);
router.all('/cancel', zitoPayController.handleCancel);

module.exports = router;
