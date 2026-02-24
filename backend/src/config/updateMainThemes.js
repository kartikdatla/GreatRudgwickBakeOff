const db = require('./database');

/**
 * Update main themes to be specific baked item types
 * Main Theme = Type of baked item (Cake, Cookie, Brownie, etc.)
 * Sub Theme = Flavor/style (Chocolate Paradise, Citrus Burst, etc.)
 */

const runUpdate = () => {
  console.log('Updating main themes to baked item types...');

  // Clear existing main themes
  db.run('DELETE FROM main_themes', (err) => {
    if (err) {
      console.error('Error clearing main themes:', err);
      return;
    }

    console.log('✓ Cleared old main themes');

    // Insert new main themes - specific baked item types
    const mainThemes = [
      ['Cake', 'Any type of cake - layer cakes, sponge cakes, pound cakes, bundt cakes, etc.', 1],
      ['Cookies', 'Baked cookies - chocolate chip, sugar cookies, shortbread, macarons, etc.', 2],
      ['Brownies', 'Chocolate or blondie brownies - fudgy, chewy, or cakey style', 3],
      ['Pie', 'Sweet or savory pies with pastry crust - fruit pies, cream pies, etc.', 4],
      ['Tart', 'Open-faced tarts with pastry base - fruit tarts, custard tarts, etc.', 5],
      ['Bread', 'Baked bread - loaves, rolls, enriched breads, artisan breads', 6],
      ['Pastry', 'Flaky pastries - croissants, danishes, puff pastry items, eclairs', 7],
      ['Traybake', 'Any bake made in a tray - bars, slices, sheet cakes', 8],
      ['Cupcakes', 'Individual cupcakes or muffins with or without frosting', 9],
      ['Biscuits', 'British-style biscuits - digestives, shortbread, sandwich biscuits', 10]
    ];

    const stmt = db.prepare('INSERT INTO main_themes (name, description, category_order) VALUES (?, ?, ?)');

    mainThemes.forEach(theme => {
      stmt.run(theme, (err) => {
        if (err) {
          console.error(`Error adding ${theme[0]}:`, err);
        } else {
          console.log(`✓ Added: ${theme[0]}`);
        }
      });
    });

    stmt.finalize(() => {
      console.log('\n✅ Main themes updated to baked item types!');
      console.log('\nNew structure:');
      console.log('Main Theme = Type of item (Cake, Cookie, Brownie, etc.)');
      console.log('Sub Theme = Flavor/style (Chocolate Paradise, Citrus Burst, etc.)');

      db.close(() => {
        process.exit(0);
      });
    });
  });
};

// Run update
runUpdate();
