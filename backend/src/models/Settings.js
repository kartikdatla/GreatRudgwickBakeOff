const db = require('../config/database');

class Settings {
  static async get(key) {
    return new Promise((resolve, reject) => {
      db.get('SELECT value FROM settings WHERE key = ?', [key], (err, row) => {
        if (err) reject(err);
        else resolve(row ? row.value : null);
      });
    });
  }

  static async set(key, value) {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
        [key, value],
        function(err) {
          if (err) reject(err);
          else resolve({ key, value });
        }
      );
    });
  }

  static async areScoresRevealed() {
    const value = await this.get('scores_revealed');
    return value === 'true';
  }

  static async revealScores(reveal = true) {
    return await this.set('scores_revealed', reveal ? 'true' : 'false');
  }
}

module.exports = Settings;
