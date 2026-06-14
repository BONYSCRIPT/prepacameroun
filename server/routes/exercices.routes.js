const express = require('express');
const router = express.Router();
const exercicesController = require('../controllers/exercices.controller');
const adminAuthMiddleware = require('../middleware/adminAuthMiddleware');
const authMiddleware = require('../middleware/authMiddleware');
const { validateCreateExercice, validateUpdateExercice } = require('../middleware/exerciceValidation');

// Route pour obtenir tous les exercices
router.get('/', exercicesController.getAllExercices);

// Route pour obtenir un exercice spécifique
router.get('/:id', exercicesController.getExercice);

// Route pour obtenir tous les exercices d'une discipline spécifique
router.get('/discipline/:disciplineId', exercicesController.getExercicesByDiscipline);

// Routes protégées nécessitant une authentification
router.use(adminAuthMiddleware);

// Route pour créer un nouvel exercice
router.post('/', validateCreateExercice, exercicesController.createExercice);

// Route pour mettre à jour un exercice
router.put('/:id', validateUpdateExercice, exercicesController.updateExercice);

// Route pour supprimer un exercice
router.delete('/:id', exercicesController.deleteExercice);

module.exports = router;
