const express = require('express');
const router = express.Router();
const anciensSujetsController = require('../controllers/anciensSujets.controller');
const adminAuthMiddleware = require('../middleware/adminAuthMiddleware');
const authMiddleware = require('../middleware/authMiddleware');
const { validateCreateAncienSujet, validateUpdateAncienSujet } = require('../middleware/ancienSujetValidation');

// Route pour obtenir tous les anciens sujets
router.get('/', anciensSujetsController.getAllAnciensSujets);

// Route pour obtenir un ancien sujet spécifique
router.get('/:id', anciensSujetsController.getAncienSujet);

// Route pour obtenir tous les anciens sujets d'une discipline spécifique
router.get('/discipline/:disciplineId', anciensSujetsController.getExamensByDiscipline);

// Routes protégées nécessitant une authentification
router.use(adminAuthMiddleware);

// Route pour créer un nouvel ancien sujet
router.post('/', validateCreateAncienSujet, anciensSujetsController.createAncienSujet);

// Route pour mettre à jour un ancien sujet
router.put('/:id', validateUpdateAncienSujet, anciensSujetsController.updateAncienSujet);

// Route pour supprimer un ancien sujet
router.delete('/:id', anciensSujetsController.deleteAncienSujet);

module.exports = router;

