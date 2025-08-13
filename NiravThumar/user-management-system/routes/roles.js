const express = require('express');
const router = express.Router();

const { getRoles } = require('../controllers/roleController');

// Public routes
router.get('/', getRoles);

module.exports = router;
