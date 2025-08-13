const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const userRoutes = require('./routes/users');
const roleRoutes = require('./routes/roles');
const { errorHandler } = require('./middleware/errorHandler');
const { generalLimiter } = require('./middleware/rateLimiter');
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(generalLimiter);

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res
    .status(200)
    .json({ status: 'OK', message: 'User Management System is running' });
});

// Error handling middleware
app.use(errorHandler);

// Export app for testing
module.exports = app;

// Only start server if this file is run directly
if (require.main === module) {
  // Connect to MongoDB
  mongoose
    .connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/usermanagement',
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    )
    .then(() => {
      logger.info('Connected to MongoDB');
      app.listen(PORT, () => {
        logger.info(`Server is running on port ${PORT}`);
      });
    })
    .catch((error) => {
      logger.error('Database connection error:', error);
      process.exit(1);
    });
}
