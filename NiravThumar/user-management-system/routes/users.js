const express = require('express');
const router = express.Router();

const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  deleteUser,
  assignRole,
} = require('../controllers/userController');

const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { loginLimiter } = require('../middleware/rateLimiter');

// Public routes
router.post('/register', registerUser);
router.post('/login', loginLimiter, loginUser);

// Protected routes
router.get('/:id', authenticateToken, getUserProfile);
router.put('/:id', authenticateToken, updateUserProfile);
router.delete('/:id', authenticateToken, authorizeRole('admin'), deleteUser);
router.put(
  '/:id/assign-role',
  authenticateToken,
  authorizeRole('admin'),
  assignRole
);

module.exports = router;
