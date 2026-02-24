const db = require('./database');

const migrate = () => {
  console.log('Migrating: Adding invite_codes table...');

  db.run(`
    CREATE TABLE IF NOT EXISTS invite_codes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('Baker', 'Judge', 'Spectator')),
      created_by INTEGER,
      max_uses INTEGER DEFAULT 1,
      uses INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id)
    )
  `, (err) => {
    if (err) {
      console.error('Error creating invite_codes table:', err);
    } else {
      console.log('invite_codes table ready');
    }

    db.close(() => {
      console.log('Migration complete');
      process.exit(0);
    });
  });
};

migrate();
