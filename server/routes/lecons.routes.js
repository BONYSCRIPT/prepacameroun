const express = require('express');
const router = express.Router();
const leconsController = require('../controllers/lecons.controller');
const adminAuthMiddleware = require('../middleware/adminAuthMiddleware');
const authMiddleware = require('../middleware/authMiddleware');
const { validateCreateLesson, validateUpdateLesson } = require('../middleware/leconValidation');

// Route pour obtenir toutes les leçons
router.get('/', leconsController.getAllLecons);

// Route pour obtenir une leçon spécifique
router.get('/:id', leconsController.getLecon);

// Route pour obtenir toutes les leçons d'une discipline spécifique
router.get('/discipline/:disciplineId', leconsController.getLeconsByDiscipline);

// Routes protégées nécessitant une authentification
router.use(adminAuthMiddleware);

// Route pour créer une nouvelle leçon
router.post('/', validateCreateLesson, leconsController.createLecon);

// Route pour mettre à jour une leçon
router.put('/:id', validateUpdateLesson, leconsController.updateLecon);

// Route pour supprimer une leçon
router.delete('/:id', leconsController.deleteLecon);

module.exports = router;
