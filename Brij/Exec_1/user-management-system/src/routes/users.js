const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');
const { isAdmin, isOwnerOrAdmin } = require('../middleware/authorize');
const { validateRegistration, validateLogin, validateProfileUpdate, validateRoleAssignment, handleValidationErrors } = require('../middleware/validation');
const { loginLimiter } = require('../middleware/rateLimiter');

// Public routes
router.post('/register', validateRegistration, handleValidationErrors, userController.register);
router.post('/login', loginLimiter, validateLogin, handleValidationErrors, userController.login);

// Protected routes
router.get('/', authenticateToken, isAdmin, userController.getAllUsers);
router.get('/:id', authenticateToken, isOwnerOrAdmin, userController.getProfile);
router.put('/:id', authenticateToken, isOwnerOrAdmin, validateProfileUpdate, handleValidationErrors, userController.updateProfile);
router.delete('/:id', authenticateToken, isAdmin, userController.deleteUser);
router.put('/:id/assign-role', authenticateToken, isAdmin, validateRoleAssignment, handleValidationErrors, userController.assignRole);

module.exports = router;