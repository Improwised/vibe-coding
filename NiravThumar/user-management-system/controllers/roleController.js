const Role = require('../models/Role');
const logger = require('../utils/logger');

// Get all roles
const getRoles = async (req, res) => {
  try {
    const roles = await Role.find({}, { name: 1, description: 1 });

    res.json({
      roles: roles.map((role) => ({
        id: role._id,
        name: role.name,
        description: role.description,
      })),
    });
  } catch (error) {
    logger.error('Get roles error:', error);
    res
      .status(500)
      .json({ message: 'Error retrieving roles', error: error.message });
  }
};

module.exports = {
  getRoles,
};
