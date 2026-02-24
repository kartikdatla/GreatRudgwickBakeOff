const db = require('../config/database');

class MainTheme {
  static async getAll() {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM main_themes WHERE is_active = 1 ORDER BY category_order', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static async getById(id) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM main_themes WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  static async getRandom() {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM main_themes WHERE is_active = 1 ORDER BY RANDOM() LIMIT 1',
        (err, row) => {
          if (err) reject(err);
          else if (!row) reject(new Error('No active main themes available'));
          else resolve(row);
        }
      );
    });
  }
}

class Theme {
  /**
   * Draw random theme (two-tier: main theme + sub theme)
   * Main theme tells bakers WHAT to bake (Cakes, Biscuits, etc.)
   * Sub theme is secret for judging criteria
   */
  static async drawRandomTheme(month, year) {
    return new Promise(async (resolve, reject) => {
      try {
        // 1. Select random main theme
        const mainTheme = await MainTheme.getRandom();

        // 2. Select random unused sub-theme
        db.get(
          `SELECT * FROM theme_pool WHERE is_used = 0 ORDER BY RANDOM() LIMIT 1`,
          async (err, subTheme) => {
            if (err) {
              reject(err);
            } else if (!subTheme) {
              reject(new Error('No unused sub-themes available'));
            } else {
              // 3. Create the monthly theme with both IDs
              db.run(
                `INSERT INTO themes
                (name, description, month, year, is_active, main_theme_id, sub_theme_id)
                VALUES (?, ?, ?, ?, 1, ?, ?)`,
                [mainTheme.name, subTheme.name, month, year, mainTheme.id, subTheme.id],
                function(err) {
                  if (err) {
                    reject(err);
                  } else {
                    // 4. Mark sub-theme as used
                    db.run('UPDATE theme_pool SET is_used = 1 WHERE id = ?', [subTheme.id]);

                    // 5. Deactivate other themes
                    db.run('UPDATE themes SET is_active = 0 WHERE id != ?', [this.lastID]);

                    resolve({
                      id: this.lastID,
                      name: mainTheme.name,
                      mainTheme: {
                        id: mainTheme.id,
                        name: mainTheme.name,
                        description: mainTheme.description
                      },
                      subTheme: {
                        id: subTheme.id,
                        name: subTheme.name,
                        description: subTheme.description,
                        colors: {
                          primary: subTheme.color_primary,
                          secondary: subTheme.color_secondary,
                          accent: subTheme.color_accent,
                          gradientStart: subTheme.color_gradient_start,
                          gradientEnd: subTheme.color_gradient_end
                        }
                      },
                      month,
                      year
                    });
                  }
                }
              );
            }
          }
        );
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Get active theme with full details (main + sub theme + colors)
   * @param {string} userRole - User's role for role-based filtering
   */
  static async getActive(userRole = null) {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT
          t.*,
          mt.name as main_theme_name,
          mt.description as main_theme_description,
          st.name as sub_theme_name,
          st.description as sub_theme_description,
          st.color_primary,
          st.color_secondary,
          st.color_accent,
          st.color_gradient_start,
          st.color_gradient_end
        FROM themes t
        LEFT JOIN main_themes mt ON t.main_theme_id = mt.id
        LEFT JOIN theme_pool st ON t.sub_theme_id = st.id
        WHERE t.is_active = 1`,
        (err, row) => {
          if (err) {
            reject(err);
          } else if (!row) {
            resolve(null);
          } else {
            // Format response based on user role
            const response = {
              id: row.id,
              month: row.month,
              year: row.year,
              locked_at: row.locked_at,
              revealed_to_judges: row.revealed_to_judges || false,
              intro_video_url: row.intro_video_url || null,
              mainTheme: {
                id: row.main_theme_id,
                name: row.main_theme_name || row.name,
                description: row.main_theme_description
              },
              colors: {
                primary: row.color_primary,
                secondary: row.color_secondary,
                accent: row.color_accent,
                gradientStart: row.color_gradient_start,
                gradientEnd: row.color_gradient_end
              }
            };

            // Admins always see the sub-theme
            // Judges only see it if revealed_to_judges is true
            if (userRole === 'Admin' || (userRole === 'Judge' && row.revealed_to_judges)) {
              response.subTheme = {
                id: row.sub_theme_id,
                name: row.sub_theme_name || row.description,
                description: row.sub_theme_description
              };
            }

            resolve(response);
          }
        }
      );
    });
  }

  static async getAll() {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT
          t.*,
          mt.name as main_theme_name,
          st.name as sub_theme_name
        FROM themes t
        LEFT JOIN main_themes mt ON t.main_theme_id = mt.id
        LEFT JOIN theme_pool st ON t.sub_theme_id = st.id
        ORDER BY year DESC, month DESC`,
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  /**
   * Redraw: delete current month's theme and draw a new random one
   */
  static async redraw(month, year) {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT id, sub_theme_id FROM themes WHERE month = ? AND year = ?',
        [month, year],
        (err, existing) => {
          if (err) return reject(err);

          const cleanup = (cb) => {
            if (existing) {
              db.run('UPDATE theme_pool SET is_used = 0 WHERE id = ?', [existing.sub_theme_id], () => {
                db.run('DELETE FROM themes WHERE id = ?', [existing.id], (err) => {
                  if (err) return reject(err);
                  cb();
                });
              });
            } else {
              cb();
            }
          };

          cleanup(async () => {
            try {
              const result = await Theme.drawRandomTheme(month, year);
              resolve(result);
            } catch (e) {
              reject(e);
            }
          });
        }
      );
    });
  }

  /**
   * Manually set the active theme with specific main + sub theme
   */
  static async setManualTheme(month, year, mainThemeId, subThemeId) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM main_themes WHERE id = ?', [mainThemeId], (err, mainTheme) => {
        if (err) return reject(err);
        if (!mainTheme) return reject(new Error('Main theme not found'));

        db.get('SELECT * FROM theme_pool WHERE id = ?', [subThemeId], (err, subTheme) => {
          if (err) return reject(err);
          if (!subTheme) return reject(new Error('Sub theme not found'));

          db.get(
            'SELECT id, sub_theme_id FROM themes WHERE month = ? AND year = ?',
            [month, year],
            (err, existing) => {
              if (err) return reject(err);

              const proceed = () => {
                db.run('UPDATE theme_pool SET is_used = 1 WHERE id = ?', [subThemeId]);

                db.run(
                  `INSERT INTO themes
                  (name, description, month, year, is_active, main_theme_id, sub_theme_id)
                  VALUES (?, ?, ?, ?, 1, ?, ?)`,
                  [mainTheme.name, subTheme.name, month, year, mainThemeId, subThemeId],
                  function(insertErr) {
                    if (insertErr) return reject(insertErr);

                    db.run('UPDATE themes SET is_active = 0 WHERE id != ?', [this.lastID]);

                    resolve({
                      id: this.lastID,
                      name: mainTheme.name,
                      mainTheme: {
                        id: mainTheme.id,
                        name: mainTheme.name,
                        description: mainTheme.description
                      },
                      subTheme: {
                        id: subTheme.id,
                        name: subTheme.name,
                        description: subTheme.description,
                        colors: {
                          primary: subTheme.color_primary,
                          secondary: subTheme.color_secondary,
                          accent: subTheme.color_accent,
                          gradientStart: subTheme.color_gradient_start,
                          gradientEnd: subTheme.color_gradient_end
                        }
                      },
                      month,
                      year
                    });
                  }
                );
              };

              if (existing) {
                if (existing.sub_theme_id !== subThemeId) {
                  db.run('UPDATE theme_pool SET is_used = 0 WHERE id = ?', [existing.sub_theme_id]);
                }
                db.run('DELETE FROM themes WHERE id = ?', [existing.id], (err) => {
                  if (err) return reject(err);
                  proceed();
                });
              } else {
                proceed();
              }
            }
          );
        });
      });
    });
  }

  static async lockTheme(themeId) {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE themes SET locked_at = CURRENT_TIMESTAMP WHERE id = ?',
        [themeId],
        function(err) {
          if (err) reject(err);
          else resolve({ changes: this.changes });
        }
      );
    });
  }

  static async revealToJudges(themeId) {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE themes SET revealed_to_judges = 1 WHERE id = ?',
        [themeId],
        function(err) {
          if (err) reject(err);
          else resolve({ changes: this.changes });
        }
      );
    });
  }

  static async hideFromJudges(themeId) {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE themes SET revealed_to_judges = 0 WHERE id = ?',
        [themeId],
        function(err) {
          if (err) reject(err);
          else resolve({ changes: this.changes });
        }
      );
    });
  }

  static async isLocked(themeId) {
    return new Promise((resolve, reject) => {
      db.get('SELECT locked_at FROM themes WHERE id = ?', [themeId], (err, row) => {
        if (err) reject(err);
        else resolve(row && row.locked_at !== null);
      });
    });
  }

  static async updateTheme(themeId, name, description) {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE themes SET name = ?, description = ? WHERE id = ?',
        [name, description, themeId],
        function(err) {
          if (err) reject(err);
          else resolve({ changes: this.changes });
        }
      );
    });
  }

  // Sub-theme pool management (with colors)
  static async getAllThemesFromPool() {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM theme_pool ORDER BY name', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static async addThemeToPool(name, description, colors = {}) {
    return new Promise((resolve, reject) => {
      const {
        primary = '#c49347',
        secondary = '#d4ab6a',
        accent = '#b07d35',
        gradientStart = '#c49347',
        gradientEnd = '#b07d35'
      } = colors;

      db.run(
        `INSERT INTO theme_pool
        (name, description, is_used, color_primary, color_secondary, color_accent, color_gradient_start, color_gradient_end)
        VALUES (?, ?, 0, ?, ?, ?, ?, ?)`,
        [name, description, primary, secondary, accent, gradientStart, gradientEnd],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, name, description, colors });
        }
      );
    });
  }

  static async updateThemeInPool(themeId, name, description, colors = null) {
    return new Promise((resolve, reject) => {
      let query, params;

      if (colors) {
        query = `UPDATE theme_pool
                SET name = ?, description = ?,
                    color_primary = ?, color_secondary = ?, color_accent = ?,
                    color_gradient_start = ?, color_gradient_end = ?
                WHERE id = ?`;
        params = [
          name, description,
          colors.primary, colors.secondary, colors.accent,
          colors.gradientStart, colors.gradientEnd,
          themeId
        ];
      } else {
        query = 'UPDATE theme_pool SET name = ?, description = ? WHERE id = ?';
        params = [name, description, themeId];
      }

      db.run(query, params, function(err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
  }

  static async deleteThemeFromPool(themeId) {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM theme_pool WHERE id = ? AND is_used = 0', [themeId], function(err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
  }

  static async resetThemePool() {
    return new Promise((resolve, reject) => {
      db.run('UPDATE theme_pool SET is_used = 0', function(err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
  }

  static async updateIntroVideo(themeId, videoUrl) {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE themes SET intro_video_url = ? WHERE id = ?',
        [videoUrl || null, themeId],
        function(err) {
          if (err) reject(err);
          else resolve({ changes: this.changes });
        }
      );
    });
  }
}

module.exports = { Theme, MainTheme };
