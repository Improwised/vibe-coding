const { db } = require('../config/database');

class Role {
  static async getAll() {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM roles ORDER BY id';
      
      db.all(query, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  static async findById(id) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM roles WHERE id = ?';
      
      db.get(query, [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  static async findByName(name) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM roles WHERE name = ?';
      
      db.get(query, [name], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  static async create(roleData) {
    const { name, description } = roleData;
    
    return new Promise((resolve, reject) => {
      const query = 'INSERT INTO roles (name, description) VALUES (?, ?)';
      
      db.run(query, [name, description], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, name, description });
        }
      });
    });
  }
}

module.exports = Role;