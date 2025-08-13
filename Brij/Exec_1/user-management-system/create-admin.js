const { db } = require('./src/config/database');
const bcrypt = require('bcrypt');

const createAdminUser = async () => {
  try {
    const email = 'admin@example.com';
    const password = 'Admin@1234';
    const name = 'System Administrator';
    
    // Check if admin already exists
    const existingUser = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (existingUser) {
      console.log('Admin user already exists. Updating role...');
      
      // Update existing user to admin
      await new Promise((resolve, reject) => {
        db.run('UPDATE users SET role_id = 1 WHERE email = ?', [email], function(err) {
          if (err) reject(err);
          else resolve();
        });
      });
      
      console.log('✅ Admin role updated for existing user');
    } else {
      // Create new admin user
      const password_hash = await bcrypt.hash(password, 10);
      
      await new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO users (email, password_hash, name, role_id) VALUES (?, ?, ?, 1)',
          [email, password_hash, name],
          function(err) {
            if (err) reject(err);
            else resolve();
          }
        );
      });
      
      console.log('✅ Admin user created successfully');
    }

    console.log('\n📋 Admin Credentials:');
    console.log('Email: admin@example.com');
    console.log('Password: Admin@1234');
    console.log('\n🔑 Use this to login and get admin token:');
    console.log(`curl -X POST http://localhost:3000/api/users/login \\
  -H 'Content-Type: application/json' \\
  -d '{"email":"admin@example.com","password":"Admin@1234"}'`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    process.exit(1);
  }
};

createAdminUser();