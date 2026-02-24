const { Theme, MainTheme } = require('../models/Theme');
const { validateColorScheme } = require('../utils/colorValidation');

const drawTheme = async (req, res) => {
  try {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    // Check if theme already exists for this month
    const existingTheme = await Theme.getActive(req.user.role);
    if (existingTheme && existingTheme.month === month && existingTheme.year === year) {
      return res.status(400).json({
        error: 'Theme for this month already exists',
        theme: existingTheme
      });
    }

    const theme = await Theme.drawRandomTheme(month, year);
    res.status(201).json({
      message: 'Theme drawn successfully',
      theme
    });
  } catch (error) {
    console.error('Theme draw error:', error);
    res.status(500).json({ error: error.message || 'Failed to draw theme' });
  }
};

const getActiveTheme = async (req, res) => {
  try {
    // Get user role from authenticated request
    const userRole = req.user ? req.user.role : null;

    const theme = await Theme.getActive(userRole);
    if (!theme) {
      return res.status(404).json({ error: 'No active theme found' });
    }

    res.json({ theme });
  } catch (error) {
    console.error('Get active theme error:', error);
    res.status(500).json({ error: 'Failed to get active theme' });
  }
};

const getAllThemes = async (req, res) => {
  try {
    const themes = await Theme.getAll();
    res.json({ themes });
  } catch (error) {
    console.error('Get all themes error:', error);
    res.status(500).json({ error: 'Failed to get themes' });
  }
};

const lockTheme = async (req, res) => {
  try {
    const { themeId } = req.params;
    await Theme.lockTheme(themeId);

    res.json({ message: 'Theme locked successfully' });
  } catch (error) {
    console.error('Lock theme error:', error);
    res.status(500).json({ error: 'Failed to lock theme' });
  }
};

const revealToJudges = async (req, res) => {
  try {
    const { themeId } = req.params;
    await Theme.revealToJudges(themeId);

    res.json({ message: 'Sub-theme revealed to judges successfully' });
  } catch (error) {
    console.error('Reveal to judges error:', error);
    res.status(500).json({ error: 'Failed to reveal theme to judges' });
  }
};

const hideFromJudges = async (req, res) => {
  try {
    const { themeId } = req.params;
    await Theme.hideFromJudges(themeId);

    res.json({ message: 'Sub-theme hidden from judges successfully' });
  } catch (error) {
    console.error('Hide from judges error:', error);
    res.status(500).json({ error: 'Failed to hide theme from judges' });
  }
};

const updateTheme = async (req, res) => {
  try {
    const { themeId } = req.params;
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Theme name is required' });
    }

    // Check if theme is locked
    const isLocked = await Theme.isLocked(themeId);
    if (isLocked) {
      return res.status(403).json({ error: 'Cannot update a locked theme' });
    }

    await Theme.updateTheme(themeId, name, description);

    res.json({ message: 'Theme updated successfully' });
  } catch (error) {
    console.error('Update theme error:', error);
    res.status(500).json({ error: 'Failed to update theme' });
  }
};

// Main themes management
const getAllMainThemes = async (req, res) => {
  try {
    const mainThemes = await MainTheme.getAll();
    res.json({ mainThemes });
  } catch (error) {
    console.error('Get main themes error:', error);
    res.status(500).json({ error: 'Failed to get main themes' });
  }
};

// Sub-theme pool management
const getAllThemesFromPool = async (req, res) => {
  try {
    const themes = await Theme.getAllThemesFromPool();
    res.json({ themes });
  } catch (error) {
    console.error('Get theme pool error:', error);
    res.status(500).json({ error: 'Failed to get theme pool' });
  }
};

const addThemeToPool = async (req, res) => {
  try {
    const { name, description, colors } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Theme name is required' });
    }

    // Validate colors if provided
    if (colors) {
      const validation = validateColorScheme(colors);
      if (!validation.valid) {
        return res.status(400).json({
          error: 'Invalid color scheme',
          details: validation.errors
        });
      }

      // Return warnings if any
      if (validation.warnings.length > 0) {
        console.warn('Color warnings:', validation.warnings);
      }
    }

    const theme = await Theme.addThemeToPool(name, description || '', colors);
    res.status(201).json({
      message: 'Theme added to pool successfully',
      theme
    });
  } catch (error) {
    console.error('Add theme to pool error:', error);
    res.status(500).json({ error: 'Failed to add theme to pool' });
  }
};

const updateThemeInPool = async (req, res) => {
  try {
    const { themeId } = req.params;
    const { name, description, colors } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Theme name is required' });
    }

    // Validate colors if provided
    if (colors) {
      const validation = validateColorScheme(colors);
      if (!validation.valid) {
        return res.status(400).json({
          error: 'Invalid color scheme',
          details: validation.errors
        });
      }

      if (validation.warnings.length > 0) {
        console.warn('Color warnings:', validation.warnings);
      }
    }

    await Theme.updateThemeInPool(themeId, name, description || '', colors);
    res.json({ message: 'Theme updated in pool successfully' });
  } catch (error) {
    console.error('Update theme in pool error:', error);
    res.status(500).json({ error: 'Failed to update theme in pool' });
  }
};

const deleteThemeFromPool = async (req, res) => {
  try {
    const { themeId } = req.params;

    const result = await Theme.deleteThemeFromPool(themeId);

    if (result.changes === 0) {
      return res.status(400).json({
        error: 'Cannot delete theme. It may be in use or does not exist.'
      });
    }

    res.json({ message: 'Theme deleted from pool successfully' });
  } catch (error) {
    console.error('Delete theme from pool error:', error);
    res.status(500).json({ error: 'Failed to delete theme from pool' });
  }
};

const resetThemePool = async (req, res) => {
  try {
    await Theme.resetThemePool();
    res.json({ message: 'Theme pool reset successfully. All themes are now available.' });
  } catch (error) {
    console.error('Reset theme pool error:', error);
    res.status(500).json({ error: 'Failed to reset theme pool' });
  }
};

const redrawTheme = async (req, res) => {
  try {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const theme = await Theme.redraw(month, year);
    res.json({
      message: 'Theme redrawn successfully',
      theme
    });
  } catch (error) {
    console.error('Redraw theme error:', error);
    res.status(500).json({ error: error.message || 'Failed to redraw theme' });
  }
};

const setManualTheme = async (req, res) => {
  try {
    const { mainThemeId, subThemeId } = req.body;

    if (!mainThemeId || !subThemeId) {
      return res.status(400).json({ error: 'Both main theme and sub theme are required' });
    }

    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const theme = await Theme.setManualTheme(month, year, parseInt(mainThemeId), parseInt(subThemeId));
    res.json({
      message: 'Theme set successfully',
      theme
    });
  } catch (error) {
    console.error('Set manual theme error:', error);
    res.status(500).json({ error: error.message || 'Failed to set theme' });
  }
};

module.exports = {
  drawTheme,
  getActiveTheme,
  getAllThemes,
  lockTheme,
  revealToJudges,
  hideFromJudges,
  updateTheme,
  getAllMainThemes,
  getAllThemesFromPool,
  addThemeToPool,
  updateThemeInPool,
  deleteThemeFromPool,
  resetThemePool,
  redrawTheme,
  setManualTheme
};
