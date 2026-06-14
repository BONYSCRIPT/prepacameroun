const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const adminAuthMiddleware = require('../middleware/adminAuthMiddleware');
const { validateAdmin, validateLogin } = require('../middleware/adminValidation');

// Route for registering a new admin with validation and rate limiting
router.post('/register', validateAdmin, adminController.registerAdmin);

// Route for admin login with validation and rate limiting
router.post('/login', validateLogin, adminController.loginAdmin);

// Route for password reset
router.post('/reset-password', adminController.resetPassword);

// The following routes require admin authentication
router.use(adminAuthMiddleware);

// Route for admin logouts
router.post('/logout', adminController.logoutAdmin);

// Route to get specific admin information
router.get('/:id', adminController.getAdminInfo);

// Route to update admin information with validation
router.put('/:id', adminController.updateAdmin);

// Route to delete an admin
router.delete('/:id', adminController.deleteAdmin);

// Route to get all admins
router.get('/', adminController.getAllAdmins);

module.exports = router;
