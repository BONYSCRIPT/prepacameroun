const express = require('express');
const router = express.Router();
const disciplinesController = require('../controllers/disciplines.controller');
const authMiddleware = require('../middleware/authMiddleware');

// Routes protégées nécessitant une authentification
router.use(authMiddleware);

// Route pour obtenir toutes les disciplines d'une prépa concours spécifique
router.get('/prepa/:prepaId', disciplinesController.getDisciplinesByPrepa);

module.exports = router;
