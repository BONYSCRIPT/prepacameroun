const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');

// Route pour traiter le paiement, protégée par l'authentification
router.post('/process', authMiddleware, paymentController.processPayment);

module.exports = router;
