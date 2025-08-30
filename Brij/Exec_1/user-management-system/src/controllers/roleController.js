const Role = require('../models/Role');
const logger = require('../utils/logger');

const getAllRoles = async (req, res) => {
  try {
    const roles = await Role.getAll();
    
    res.json({
      roles: roles
    });
  } catch (error) {
    logger.error('Get all roles error', { 
      error: error.message, 
      ip: req.ip 
    });
    res.status(500).json({ 
      error: 'Failed to retrieve roles' 
    });
  }
};

module.exports = {
  getAllRoles
};