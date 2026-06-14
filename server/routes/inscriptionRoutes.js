const express = require('express');
const router = express.Router();
const inscriptionController = require('../controllers/inscriptionController');
const authMiddleware = require('../middleware/authMiddleware');

// Appliquer le middleware d'authentification à toutes les routes
router.use(authMiddleware);

// Récupérer toutes les inscriptions de l'utilisateur connecté
router.get('/user/inscriptions', inscriptionController.getUserInscriptions);

// Verifier et mettre à jour les inscriptions
router.get('/check-and-update', inscriptionController.checkAndUpdateInscriptions);

// Créer une nouvelle inscription
router.post('/inscriptions', inscriptionController.createInscription);

// Mettre à jour le statut d'une inscription
router.put('/inscriptions/:id/status', inscriptionController.updateInscriptionStatus);

// Supprimer une inscription
router.delete('/inscriptions/:id', inscriptionController.deleteInscription);

module.exports = router;
