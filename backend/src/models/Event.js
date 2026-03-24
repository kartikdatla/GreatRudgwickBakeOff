const db = require('../config/database');

// Auto-create tables on first require
db.run(`
  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    event_time TEXT,
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS email_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    sent_by INTEGER,
    recipient_count INTEGER DEFAULT 0,
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sent_by) REFERENCES users(id)
  )
`);

class Event {
  static async create(title, description, eventDate, eventTime, createdBy) {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO events (title, description, event_date, event_time, created_by) VALUES (?, ?, ?, ?, ?)',
        [title, description, eventDate, eventTime || null, createdBy],
        function (err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, title, description, event_date: eventDate, event_time: eventTime });
        }
      );
    });
  }

  static async getAll() {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT e.*, u.name as created_by_name
         FROM events e
         LEFT JOIN users u ON e.created_by = u.id
         ORDER BY e.event_date ASC`,
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  static async getUpcoming() {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT e.*, u.name as created_by_name
         FROM events e
         LEFT JOIN users u ON e.created_by = u.id
         WHERE e.event_date >= date('now')
         ORDER BY e.event_date ASC`,
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  static async delete(id) {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM events WHERE id = ?', [id], function (err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
  }
}

class EmailLog {
  static async create(subject, message, sentBy, recipientCount) {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO email_log (subject, message, sent_by, recipient_count) VALUES (?, ?, ?, ?)',
        [subject, message, sentBy, recipientCount],
        function (err) {
          if (err) reject(err);
          else resolve({ id: this.lastID });
        }
      );
    });
  }

  static async getAll() {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT el.*, u.name as sent_by_name
         FROM email_log el
         LEFT JOIN users u ON el.sent_by = u.id
         ORDER BY el.sent_at DESC`,
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }
}

module.exports = { Event, EmailLog };
