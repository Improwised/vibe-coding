const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, roleController.getAllRoles);

module.exports = router;