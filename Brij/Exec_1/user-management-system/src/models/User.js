const { db } = require('../config/database');
const bcrypt = require('bcrypt');

class User {
  static async create(userData) {
    const { email, password, name, role_id = 3 } = userData;
    const password_hash = await bcrypt.hash(password, 10);
    
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO users (email, password_hash, name, role_id)
        VALUES (?, ?, ?, ?)
      `;
      
      db.run(query, [email, password_hash, name, role_id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, email, name, role_id });
        }
      });
    });
  }

  static async findByEmail(email) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT u.*, r.name as role_name 
        FROM users u 
        JOIN roles r ON u.role_id = r.id 
        WHERE u.email = ?
      `;
      
      db.get(query, [email], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  static async findById(id) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT u.id, u.email, u.name, u.role_id, r.name as role_name, u.created_at, u.updated_at
        FROM users u 
        JOIN roles r ON u.role_id = r.id 
        WHERE u.id = ?
      `;
      
      db.get(query, [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  static async update(id, updateData) {
    const { name, email, password, role_id } = updateData;
    const updates = [];
    const values = [];
    
    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    
    if (email !== undefined) {
      updates.push('email = ?');
      values.push(email);
    }
    
    if (password !== undefined) {
      updates.push('password_hash = ?');
      values.push(password);
    }
    
    if (role_id !== undefined) {
      updates.push('role_id = ?');
      values.push(role_id);
    }
    
    if (updates.length === 0) {
      return Promise.resolve({ changes: 0 });
    }
    
    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);
    
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE users
        SET ${updates.join(', ')}
        WHERE id = ?
      `;
      
      db.run(query, values, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ changes: this.changes });
        }
      });
    });
  }

  static async delete(id) {
    return new Promise((resolve, reject) => {
      const query = 'DELETE FROM users WHERE id = ?';
      
      db.run(query, [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ changes: this.changes });
        }
      });
    });
  }

  static async getAll() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT u.id, u.email, u.name, u.role_id, r.name as role_name, u.created_at, u.updated_at
        FROM users u 
        JOIN roles r ON u.role_id = r.id
        ORDER BY u.created_at DESC
      `;
      
      db.all(query, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  static async validatePassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  static async hashPassword(password) {
    return bcrypt.hash(password, 10);
  }
}

module.exports = User;