const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async create(email, password, name, role) {
    const hashedPassword = await bcrypt.hash(password, 10);

    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
        [email, hashedPassword, name, role],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, email, name, role });
        }
      );
    });
  }

  static async findByEmail(email) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  static async findById(id) {
    return new Promise((resolve, reject) => {
      db.get('SELECT id, email, name, role, created_at FROM users WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async getAll() {
    return new Promise((resolve, reject) => {
      db.all('SELECT id, email, name, role, created_at, is_active FROM users ORDER BY created_at DESC', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static async updateRole(userId, newRole) {
    return new Promise((resolve, reject) => {
      db.run('UPDATE users SET role = ? WHERE id = ?', [newRole, userId], function(err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
  }

  static async setActive(userId, isActive) {
    return new Promise((resolve, reject) => {
      db.run('UPDATE users SET is_active = ? WHERE id = ?', [isActive ? 1 : 0, userId], function(err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
  }

  static async deleteUser(userId) {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM users WHERE id = ?', [userId], function(err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
  }
}

class InviteCode {
  static async create(code, role, createdBy, maxUses = 1) {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO invite_codes (code, role, created_by, max_uses) VALUES (?, ?, ?, ?)',
        [code, role, createdBy, maxUses],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, code, role, maxUses });
        }
      );
    });
  }

  static async findByCode(code) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM invite_codes WHERE code = ?', [code], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  static async getAll() {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT ic.*, u.name as created_by_name
         FROM invite_codes ic
         LEFT JOIN users u ON ic.created_by = u.id
         ORDER BY ic.created_at DESC`,
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  static async incrementUses(codeId) {
    return new Promise((resolve, reject) => {
      db.run('UPDATE invite_codes SET uses = uses + 1 WHERE id = ?', [codeId], function(err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
  }

  static async deactivate(codeId) {
    return new Promise((resolve, reject) => {
      db.run('UPDATE invite_codes SET is_active = 0 WHERE id = ?', [codeId], function(err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
  }

  static async deleteCode(codeId) {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM invite_codes WHERE id = ?', [codeId], function(err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
  }
}

module.exports = { User, InviteCode };
