const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../../database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
  }
});

const initializeDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Create roles table
      db.run(`
        CREATE TABLE IF NOT EXISTS roles (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name VARCHAR(50) UNIQUE NOT NULL,
          description TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create users table
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          role_id INTEGER NOT NULL,
          name VARCHAR(255),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (role_id) REFERENCES roles(id)
        )
      `);

      // Insert default roles
      const defaultRoles = [
        { name: 'admin', description: 'Administrator with full access' },
        { name: 'editor', description: 'Editor with limited admin access' },
        { name: 'user', description: 'Regular user with basic access' }
      ];

      const stmt = db.prepare('INSERT OR IGNORE INTO roles (name, description) VALUES (?, ?)');
      defaultRoles.forEach(role => {
        stmt.run(role.name, role.description);
      });
      stmt.finalize();

      console.log('Database initialized successfully');
      resolve();
    });
  });
};

module.exports = { db, initializeDatabase };