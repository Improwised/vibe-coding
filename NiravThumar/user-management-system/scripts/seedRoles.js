require('dotenv').config();
const mongoose = require('mongoose');
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
    // Define default roles
    const roles = [
      {
        name: 'admin',
        description: 'Administrator with full access',
        permissions: [
          'user:create',
          'user:read',
          'user:update',
          'user:delete',
          'role:assign',
        ],
      },
      {
        name: 'editor',
        description: 'Editor with content management access',
        permissions: ['user:read', 'user:update'],
      },
      {
        name: 'user',
        description: 'Standard user with limited access',
        permissions: ['user:read', 'user:update:self'],
      },
    ];

    // Insert roles if they don't exist
    for (const roleData of roles) {
      const existingRole = await Role.findOne({ name: roleData.name });
      if (!existingRole) {
        const role = new Role(roleData);
        await role.save();
        console.log(`Created role: ${roleData.name}`);
      } else {
        console.log(`Role already exists: ${roleData.name}`);
      }
    }

    console.log('Role seeding completed');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding roles:', error);
    process.exit(1);
  }
});
