require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Role = require('../models/Role');

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
    // Find the admin role
    const adminRole = await Role.findOne({ name: 'admin' });
    if (!adminRole) {
      console.log('Admin role not found');
      process.exit(1);
    }

    // Find the admin user
    const adminUser = await User.findOne({ email: 'admin@example.com' });
    if (!adminUser) {
      console.log('Admin user not found');
      process.exit(1);
    }

    // Assign admin role to admin user
    adminUser.role_id = adminRole._id;
    await adminUser.save();

    console.log(`User ${adminUser.email} has been assigned the admin role`);
    console.log(`User ID: ${adminUser._id}`);
    console.log(`Role ID: ${adminRole._id}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error assigning admin role:', error);
    process.exit(1);
  }
});