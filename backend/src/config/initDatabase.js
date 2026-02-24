const db = require('./database');

const initDatabase = () => {
  // Users table with role-based access
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('Baker', 'Judge', 'Spectator', 'Admin')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      is_active BOOLEAN DEFAULT 1
    )
  `, (err) => {
    if (err) console.error('Error creating users table:', err);
    else console.log('Users table ready');
  });

  // Main themes table (categories: Cakes, Biscuits, etc.)
  db.run(`
    CREATE TABLE IF NOT EXISTS main_themes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      category_order INTEGER NOT NULL,
      is_active BOOLEAN DEFAULT 1
    )
  `, (err) => {
    if (err) console.error('Error creating main_themes table:', err);
    else {
      console.log('Main themes table ready');
      // Insert default main theme categories
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
      stmt.finalize();
    }
  });

  // Monthly themes table (now with main_theme_id and sub_theme_id)
  db.run(`
    CREATE TABLE IF NOT EXISTS themes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      month INTEGER NOT NULL,
      year INTEGER NOT NULL,
      is_active BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      locked_at DATETIME NULL,
      main_theme_id INTEGER,
      sub_theme_id INTEGER,
      FOREIGN KEY (main_theme_id) REFERENCES main_themes(id),
      FOREIGN KEY (sub_theme_id) REFERENCES theme_pool(id),
      UNIQUE(month, year)
    )
  `, (err) => {
    if (err) console.error('Error creating themes table:', err);
    else console.log('Themes table ready');
  });

  // Cake submissions table
  db.run(`
    CREATE TABLE IF NOT EXISTS submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      theme_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      image_path TEXT NOT NULL,
      submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (theme_id) REFERENCES themes(id) ON DELETE CASCADE,
      UNIQUE(user_id, theme_id)
    )
  `, (err) => {
    if (err) console.error('Error creating submissions table:', err);
    else console.log('Submissions table ready');
  });

  // Scores table for judge ratings
  db.run(`
    CREATE TABLE IF NOT EXISTS scores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      submission_id INTEGER NOT NULL,
      judge_id INTEGER NOT NULL,
      taste_score INTEGER CHECK(taste_score >= 1 AND taste_score <= 10),
      presentation_score INTEGER CHECK(presentation_score >= 1 AND presentation_score <= 10),
      creativity_score INTEGER CHECK(creativity_score >= 1 AND creativity_score <= 10),
      overall_score INTEGER CHECK(overall_score >= 1 AND overall_score <= 10),
      comments TEXT,
      scored_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE,
      FOREIGN KEY (judge_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(submission_id, judge_id)
    )
  `, (err) => {
    if (err) console.error('Error creating scores table:', err);
    else console.log('Scores table ready');
  });

  // Resources/Links table for boxes, decorations, etc.
  db.run(`
    CREATE TABLE IF NOT EXISTS resources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      url TEXT NOT NULL,
      category TEXT NOT NULL CHECK(category IN ('Boxes', 'Decorations', 'Ingredients', 'Tools', 'Other')),
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_by INTEGER,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
    )
  `, (err) => {
    if (err) console.error('Error creating resources table:', err);
    else console.log('Resources table ready');
  });

  // Score visibility settings
  db.run(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) console.error('Error creating settings table:', err);
    else {
      console.log('Settings table ready');
      // Insert default setting
      db.run(`INSERT OR IGNORE INTO settings (key, value) VALUES ('scores_revealed', 'false')`);
    }
  });

  // Available theme pool (sub-themes with colors)
  db.run(`
    CREATE TABLE IF NOT EXISTS theme_pool (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      is_used BOOLEAN DEFAULT 0,
      color_primary TEXT DEFAULT '#c49347',
      color_secondary TEXT DEFAULT '#d4ab6a',
      color_accent TEXT DEFAULT '#b07d35',
      color_gradient_start TEXT DEFAULT '#c49347',
      color_gradient_end TEXT DEFAULT '#b07d35'
    )
  `, (err) => {
    if (err) console.error('Error creating theme_pool table:', err);
    else {
      console.log('Theme pool table ready');
      // Insert default themes with colors
      const defaultThemes = [
        ['Chocolate Paradise', 'Anything chocolate-based', '#5d4037', '#8d6e63', '#6d4c41', '#5d4037', '#6d4c41'],
        ['Fruity Delights', 'Feature fresh or dried fruits', '#e91e63', '#f06292', '#c2185b', '#e91e63', '#c2185b'],
        ['Vintage Classic', 'Traditional classic bakes', '#8d6e63', '#a1887f', '#795548', '#8d6e63', '#795548'],
        ['Rainbow Colors', 'Vibrant, colorful creations', '#ff6b6b', '#4ecdc4', '#ffe66d', '#ff6b6b', '#4ecdc4'],
        ['Autumn Harvest', 'Seasonal autumn flavors', '#d84315', '#ff6f00', '#f57c00', '#d84315', '#f57c00'],
        ['Tropical Escape', 'Tropical fruit and flavors', '#00acc1', '#26c6da', '#00838f', '#00acc1', '#00838f'],
        ['Coffee & Caramel', 'Coffee or caramel themed', '#6d4c41', '#8d6e63', '#a1887f', '#6d4c41', '#8d6e63'],
        ['Nutty Adventure', 'Featuring nuts', '#795548', '#8d6e63', '#a1887f', '#795548', '#8d6e63'],
        ['Citrus Burst', 'Lemon, lime, orange flavors', '#ff9800', '#ffc107', '#f57c00', '#ff9800', '#f57c00'],
        ['Floral Fantasy', 'Edible flowers and floral flavors', '#9c27b0', '#ab47bc', '#8e24aa', '#9c27b0', '#8e24aa'],
        ['Spice Route', 'Warm spices like cinnamon, ginger', '#d84315', '#ff5722', '#bf360c', '#d84315', '#bf360c'],
        ['Childhood Favorite', 'Nostalgic childhood treats', '#ec407a', '#f06292', '#d81b60', '#ec407a', '#d81b60']
      ];

      const stmt = db.prepare(`
        INSERT OR IGNORE INTO theme_pool
        (name, description, color_primary, color_secondary, color_accent, color_gradient_start, color_gradient_end)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      defaultThemes.forEach(theme => stmt.run(theme));
      stmt.finalize();
    }
  });

  // Invite codes table
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
    if (err) console.error('Error creating invite_codes table:', err);
    else console.log('Invite codes table ready');
  });

  console.log('Database initialization complete!');
};

// Run initialization
initDatabase();

// Close database after initialization
setTimeout(() => {
  db.close((err) => {
    if (err) console.error('Error closing database:', err.message);
    else console.log('Database connection closed');
    process.exit(0);
  });
}, 1000);
