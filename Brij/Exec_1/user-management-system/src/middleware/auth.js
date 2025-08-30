const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    logger.warn('Access attempt without token', { 
      ip: req.ip, 
      path: req.path 
    });
    return res.status(401).json({ 
      error: 'Access token required' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      logger.warn('Invalid token - user not found', { 
        userId: decoded.userId, 
        ip: req.ip 
      });
      return res.status(401).json({ 
        error: 'Invalid token' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error('Token verification failed', { 
      error: error.message, 
      ip: req.ip 
    });
    return res.status(403).json({ 
      error: 'Invalid or expired token' 
    });
  }
};

module.exports = { authenticateToken };