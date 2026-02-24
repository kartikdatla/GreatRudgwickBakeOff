const db = require('../config/database');

class Resource {
  static async create(title, url, category, description, createdBy) {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO resources (title, url, category, description, created_by) VALUES (?, ?, ?, ?, ?)',
        [title, url, category, description || '', createdBy],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, title, url, category, description });
        }
      );
    });
  }

  static async getAll() {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT r.*, u.name as creator_name
         FROM resources r
         LEFT JOIN users u ON r.created_by = u.id
         ORDER BY r.category, r.created_at DESC`,
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  static async getByCategory(category) {
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM resources WHERE category = ? ORDER BY created_at DESC',
        [category],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  static async delete(id) {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM resources WHERE id = ?', [id], function(err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
  }
}

module.exports = Resource;
