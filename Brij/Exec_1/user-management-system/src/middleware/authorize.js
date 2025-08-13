const logger = require('../utils/logger');

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      logger.warn('Authorization attempt without authentication', { 
        ip: req.ip, 
        path: req.path 
      });
      return res.status(401).json({ 
        error: 'Authentication required' 
      });
    }

    const userRole = req.user.role_name;
    
    if (!allowedRoles.includes(userRole)) {
      logger.warn('Unauthorized access attempt', { 
        userId: req.user.id, 
        userRole, 
        requiredRoles: allowedRoles, 
        ip: req.ip, 
        path: req.path 
      });
      return res.status(403).json({ 
        error: 'Insufficient permissions' 
      });
    }

    next();
  };
};

const isAdmin = authorize('admin');
const isAdminOrEditor = authorize('admin', 'editor');
const isOwnerOrAdmin = (req, res, next) => {
  const userId = parseInt(req.params.id);
  const currentUserId = req.user.id;
  const userRole = req.user.role_name;

  if (userRole === 'admin' || currentUserId === userId) {
    next();
  } else {
    logger.warn('Unauthorized profile access attempt', { 
      userId: currentUserId, 
      targetUserId: userId, 
      userRole, 
      ip: req.ip 
    });
    return res.status(403).json({ 
      error: 'Access denied' 
    });
  }
};

module.exports = { authorize, isAdmin, isAdminOrEditor, isOwnerOrAdmin };