const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

// Check if we're in a test environment
const isTest = process.env.NODE_ENV === 'test';

// General rate limiter
const generalLimiter = rateLimit({
  windowMs: isTest
    ? 1 * 60 * 1000 // 1 minute for testing
    : parseInt(process.env.RATE_LIMIT_WINDOW) * 60 * 1000 || 15 * 60 * 1000, // default 15 minutes
  max: isTest
    ? 1000 // 1000 requests per windowMs for testing
    : parseInt(process.env.RATE_LIMIT_MAX) || 100, // limit each IP to 100 requests per windowMs
  message: {
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res, next, options) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip} on ${req.originalUrl}`);
    res.status(options.statusCode).send(options.message);
  },
});

// Login rate limiter (stricter)
const loginLimiter = rateLimit({
  windowMs: isTest ? 1 * 60 * 1000 : 15 * 60 * 1000, // 1 minute for testing, 15 minutes for production
  max: isTest ? 100 : 5, // 100 requests per windowMs for testing, 5 for production
  message: {
    message: 'Too many login attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    logger.warn(
      `Login rate limit exceeded for IP: ${req.ip} on ${req.originalUrl}`
    );
    res.status(options.statusCode).send(options.message);
  },
});

module.exports = {
  generalLimiter,
  loginLimiter,
};
