const db = require('./database');

/**
 * Migration to add sub-theme reveal functionality
 * Adds revealed_to_judges column to themes table
 */

const runMigration = () => {
  console.log('Starting reveal migration...');

  // Check if column exists
  db.all(`PRAGMA table_info(themes)`, (err, columns) => {
    if (err) {
      console.error('Error checking themes schema:', err);
      return;
    }

    const hasRevealColumn = columns.some(col => col.name === 'revealed_to_judges');

    if (!hasRevealColumn) {
      db.run(`ALTER TABLE themes ADD COLUMN revealed_to_judges BOOLEAN DEFAULT 0`, (err) => {
        if (err) {
          console.error('Error adding revealed_to_judges column:', err);
        } else {
          console.log('✓ Added column: revealed_to_judges');
        }

        // Close database
        setTimeout(() => {
          db.close((err) => {
            if (err) {
              console.error('Error closing database:', err.message);
            } else {
              console.log('\n✅ Reveal migration complete!');
            }
            process.exit(0);
          });
        }, 500);
      });
    } else {
      console.log('⊙ Column revealed_to_judges already exists');
      db.close(() => {
        console.log('\n✅ No migration needed!');
        process.exit(0);
      });
    }
  });
};

// Run migration
runMigration();
