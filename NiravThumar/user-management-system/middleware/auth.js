const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).populate('role_id');

    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

const authorizeRole = (requiredRole) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      // If requiredRole is an array, check if user has any of those roles
      if (Array.isArray(requiredRole)) {
        const userRole = req.user.role_id.name;
        if (!requiredRole.includes(userRole)) {
          return res.status(403).json({ message: 'Insufficient permissions' });
        }
      } else {
        // If requiredRole is a string, check if user has that role
        if (req.user.role_id.name !== requiredRole) {
          return res.status(403).json({ message: 'Insufficient permissions' });
        }
      }

      next();
    } catch (error) {
      logger.error('Authorization error:', error);
      return res.status(500).json({ message: 'Authorization check failed' });
    }
  };
};

module.exports = {
  authenticateToken,
  authorizeRole,
};
