const db = require('./database');

/**
 * Migration script for two-tier theme system and dynamic colors
 * Adds main_themes table and color columns to theme_pool
 */

const runMigration = () => {
  console.log('Starting database migration...');

  // Step 1: Create main_themes table
  db.run(`
    CREATE TABLE IF NOT EXISTS main_themes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      category_order INTEGER NOT NULL,
      is_active BOOLEAN DEFAULT 1
    )
  `, (err) => {
    if (err) {
      console.error('Error creating main_themes table:', err);
    } else {
      console.log('✓ Main themes table ready');

      // Insert default main themes
      const mainThemes = [
        ['Cakes', 'Layer cakes, bundt cakes, cheesecakes, and all cake varieties', 1],
        ['Biscuits & Cookies', 'Any baked cookies, biscuits, or similar treats', 2],
        ['Breads', 'Loaves, rolls, enriched breads, and artisan breads', 3],
        ['Pastries', 'Pies, tarts, croissants, danishes, and flaky pastries', 4],
        ['Traybakes', 'Brownies, bars, slices, and similar tray-baked goods', 5],
        ['Small Bakes', 'Cupcakes, muffins, and individual portion bakes', 6]
      ];

      const stmt = db.prepare('INSERT OR IGNORE INTO main_themes (name, description, category_order) VALUES (?, ?, ?)');
      mainThemes.forEach(theme => stmt.run(theme));
      stmt.finalize(() => {
        console.log('✓ Main themes populated');
      });
    }
  });

  // Step 2: Add color columns to theme_pool
  const colorColumns = [
    'color_primary TEXT DEFAULT "#c49347"',
    'color_secondary TEXT DEFAULT "#d4ab6a"',
    'color_accent TEXT DEFAULT "#b07d35"',
    'color_gradient_start TEXT DEFAULT "#c49347"',
    'color_gradient_end TEXT DEFAULT "#b07d35"'
  ];

  colorColumns.forEach((column, index) => {
    const columnName = column.split(' ')[0];

    // Check if column exists first
    db.all(`PRAGMA table_info(theme_pool)`, (err, columns) => {
      if (err) {
        console.error('Error checking theme_pool schema:', err);
        return;
      }

      const columnExists = columns.some(col => col.name === columnName);

      if (!columnExists) {
        db.run(`ALTER TABLE theme_pool ADD COLUMN ${column}`, (err) => {
          if (err) {
            console.error(`Error adding column ${columnName}:`, err);
          } else {
            console.log(`✓ Added column: ${columnName}`);
          }
        });
      } else {
        console.log(`⊙ Column ${columnName} already exists`);
      }
    });
  });

  // Step 3: Update existing theme_pool entries with colors
  setTimeout(() => {
    const themeColors = [
      ['Chocolate Paradise', '#5d4037', '#8d6e63', '#6d4c41', '#5d4037', '#6d4c41'],
      ['Fruity Delights', '#e91e63', '#f06292', '#c2185b', '#e91e63', '#c2185b'],
      ['Vintage Classic', '#8d6e63', '#a1887f', '#795548', '#8d6e63', '#795548'],
      ['Rainbow Colors', '#ff6b6b', '#4ecdc4', '#ffe66d', '#ff6b6b', '#4ecdc4'],
      ['Autumn Harvest', '#d84315', '#ff6f00', '#f57c00', '#d84315', '#f57c00'],
      ['Tropical Escape', '#00acc1', '#26c6da', '#00838f', '#00acc1', '#00838f'],
      ['Coffee & Caramel', '#6d4c41', '#8d6e63', '#a1887f', '#6d4c41', '#8d6e63'],
      ['Nutty Adventure', '#795548', '#8d6e63', '#a1887f', '#795548', '#8d6e63'],
      ['Citrus Burst', '#ff9800', '#ffc107', '#f57c00', '#ff9800', '#f57c00'],
      ['Floral Fantasy', '#9c27b0', '#ab47bc', '#8e24aa', '#9c27b0', '#8e24aa'],
      ['Spice Route', '#d84315', '#ff5722', '#bf360c', '#d84315', '#bf360c'],
      ['Childhood Favorite', '#ec407a', '#f06292', '#d81b60', '#ec407a', '#d81b60']
    ];

    const updateStmt = db.prepare(`
      UPDATE theme_pool
      SET color_primary = ?, color_secondary = ?, color_accent = ?,
          color_gradient_start = ?, color_gradient_end = ?
      WHERE name = ?
    `);

    themeColors.forEach(([name, primary, secondary, accent, gradStart, gradEnd]) => {
      updateStmt.run(primary, secondary, accent, gradStart, gradEnd, name);
    });

    updateStmt.finalize(() => {
      console.log('✓ Theme colors updated');
    });
  }, 1000);

  // Step 4: Add foreign key columns to themes table
  setTimeout(() => {
    db.all(`PRAGMA table_info(themes)`, (err, columns) => {
      if (err) {
        console.error('Error checking themes schema:', err);
        return;
      }

      const hasMainThemeId = columns.some(col => col.name === 'main_theme_id');
      const hasSubThemeId = columns.some(col => col.name === 'sub_theme_id');

      if (!hasMainThemeId) {
        db.run(`ALTER TABLE themes ADD COLUMN main_theme_id INTEGER`, (err) => {
          if (err) {
            console.error('Error adding main_theme_id:', err);
          } else {
            console.log('✓ Added column: main_theme_id');
          }
        });
      } else {
        console.log('⊙ Column main_theme_id already exists');
      }

      if (!hasSubThemeId) {
        db.run(`ALTER TABLE themes ADD COLUMN sub_theme_id INTEGER`, (err) => {
          if (err) {
            console.error('Error adding sub_theme_id:', err);
          } else {
            console.log('✓ Added column: sub_theme_id');
          }
        });
      } else {
        console.log('⊙ Column sub_theme_id already exists');
      }
    });
  }, 1500);

  // Close database after migration
  setTimeout(() => {
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
      } else {
        console.log('\n✅ Migration complete! Database ready for two-tier themes and dynamic colors.');
      }
      process.exit(0);
    });
  }, 3000);
};

// Run migration
runMigration();
