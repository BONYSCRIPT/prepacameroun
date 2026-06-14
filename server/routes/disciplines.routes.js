const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadDisciplineImgMiddleware');
const disciplinesController = require('../controllers/disciplines.controller');
const adminAuthMiddleware = require('../middleware/adminAuthMiddleware');
const { validateCreateDisciplineMiddleware, validateUpdateDisciplineMiddleware } = require('../middleware/disciplineValidation');

// Route pour obtenir toutes les disciplines
router.get('/', disciplinesController.getAllDisciplines);

// Route pour obtenir une discipline spécifique
router.get('/:id', disciplinesController.getDiscipline);

// Routes protégées nécessitant une authentification
router.use(adminAuthMiddleware);

// Route pour créer une nouvelle discipline
router.post('/', upload.single('image'), validateCreateDisciplineMiddleware, disciplinesController.createDiscipline);

// Route pour mettre à jour une discipline
router.put('/:id', upload.single('image'), validateUpdateDisciplineMiddleware, disciplinesController.updateDiscipline);

// Route pour obtenir toutes les disciplines d'une prépa concours spécifique
router.get('/prepa/:prepaId', disciplinesController.getDisciplinesByPrepa);

// Route pour supprimer une discipline
router.delete('/:id', disciplinesController.deleteDiscipline);

module.exports = router;
