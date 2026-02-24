const db = require('../config/database');

class Submission {
  static async create(userId, themeId, title, description, imagePath) {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO submissions (user_id, theme_id, title, description, image_path) VALUES (?, ?, ?, ?, ?)',
        [userId, themeId, title, description, imagePath],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, userId, themeId, title, description, imagePath });
        }
      );
    });
  }

  static async getByTheme(themeId) {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT s.*, u.name as baker_name, u.email as baker_email
         FROM submissions s
         JOIN users u ON s.user_id = u.id
         WHERE s.theme_id = ?
         ORDER BY s.submitted_at DESC`,
        [themeId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  static async getById(id) {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT s.*, u.name as baker_name
         FROM submissions s
         JOIN users u ON s.user_id = u.id
         WHERE s.id = ?`,
        [id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  static async getUserSubmissionForTheme(userId, themeId) {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM submissions WHERE user_id = ? AND theme_id = ?',
        [userId, themeId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  static async delete(id, userId) {
    return new Promise((resolve, reject) => {
      db.run(
        'DELETE FROM submissions WHERE id = ? AND user_id = ?',
        [id, userId],
        function(err) {
          if (err) reject(err);
          else resolve({ changes: this.changes });
        }
      );
    });
  }
}

module.exports = Submission;
