const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'test' ? 1000 : 5, // Disable rate limiting in tests
  message: {
    error: 'Too many login attempts',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Rate limit exceeded for login attempts', {
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    res.status(429).json({
      error: 'Too many login attempts',
      retryAfter: '15 minutes'
    });
  }
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests',
    retryAfter: '15 minutes'
  }
});

module.exports = {
  loginLimiter,
  generalLimiter
};