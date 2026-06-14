// src/server/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware'); // Mettez à jour le chemin
const userController = require('../controllers/userController');
const { validateFirebaseLogin } = require('../middleware/firebaseValidation');
const { validateResetPasswordToken } = require('../middleware/resetPasswordValidation');
const notificationController = require('../controllers/notificationController');

// Route pour l'authentification Firebase (token uniquement)
router.post('/firebaselogin', validateFirebaseLogin, userController.firebaseLogin);

// Route pour l'authentification classique (email/mot de passe)
// Ajoutez un nouveau contrôleur pour gérer l'authentification classique
// router.post('/login', validateLogin, userController.classicLogin);

// Route pour demander la réinitialisation du mot de passe
router.post('/forgot-password', userController.forgotPassword);

// Route pour la reinitialisation du mot de passe
router.post('/reset-password', validateResetPasswordToken, userController.resetPassword);

// Ajoutez cette nouvelle route
router.get('/verify', verifyToken, userController.verifyUser);

// Route to get user profile (protected)
router.get('/profile', verifyToken, userController.getProfile);

// Route to update user profile (protected)
router.put('/profile', verifyToken, userController.updateProfile);

// Route to change user password (protected)
router.put('/change-password', verifyToken, userController.changePassword);

// Routes pour les notifications
// Route pour rcuprer les notifications de l'utilisateurc
router.get('/notifications', verifyToken, notificationController.getUserNotifications);

// Route pour marquer une notification comme lue
router.put('/notifications/:notificationId/read', verifyToken, notificationController.markNotificationAsRead);

// Route pour supprimer une notification
router.delete('/notifications/:id', verifyToken, notificationController.deleteNotification);

module.exports = router;


