require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect(
  process.env.MONGODB_URI || 'mongodb://localhost:27017/usermanagement',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection error:'));
db.once('open', async () => {
  console.log('Connected to MongoDB');

  try {
    // Delete all users but keep roles
    const result = await User.deleteMany({});
    console.log(`Deleted ${result.deletedCount} users`);
    
    console.log('User data cleared successfully. Role data preserved.');
    process.exit(0);
  } catch (error) {
    console.error('Error clearing user data:', error);
    process.exit(1);
  }
});