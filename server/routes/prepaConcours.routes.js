const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadPrepaImgMiddleware');
const prepaConcoursController = require('../controllers/prepaConcours.controller');
const adminAuthMiddleware = require('../middleware/adminAuthMiddleware');
const { validatePrepaMiddleware, validateUpdatePrepaMiddleware } = require('../middleware/prepaValidation');

// Route pour obtenir toutes les préparations aux concours
router.get('/', prepaConcoursController.getAllPrepaConcours);

// Route pour obtenir les préparations aux concours publiées
router.get('/published', prepaConcoursController.getPublishedPrepaConcours);

// Route pour obtenir une préparation aux concours spécifique
router.get('/:id', prepaConcoursController.getPrepaConcours);

// Routes protégées nécessitant une authentification
router.use(adminAuthMiddleware);

// Route pour changer l'état de publication d'une préparation aux concours
router.put('/:id/toggle-publish', adminAuthMiddleware, prepaConcoursController.togglePublishStatus);

// Route pour créer une nouvelle préparation aux concours
router.post('/', upload.single('image'), validatePrepaMiddleware, prepaConcoursController.createPrepaConcours);

// Route pour mettre à jour une préparation aux concours
router.put('/:id', upload.single('image'), validateUpdatePrepaMiddleware, prepaConcoursController.updatePrepaConcours);

// Route pour supprimer une préparation aux concours
router.delete('/:id', prepaConcoursController.deletePrepaConcours);

module.exports = router;
