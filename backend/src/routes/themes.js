const express = require('express');
const router = express.Router();
const {
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
  setManualTheme,
  updateIntroVideo,
  deleteTheme
} = require('../controllers/themeController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Theme drawing and management
router.post('/draw', authenticateToken, authorizeRoles('Admin'), drawTheme);
router.post('/redraw', authenticateToken, authorizeRoles('Admin'), redrawTheme);
router.post('/set', authenticateToken, authorizeRoles('Admin'), setManualTheme);
router.get('/active', authenticateToken, getActiveTheme);
router.get('/', authenticateToken, getAllThemes);
router.patch('/:themeId/lock', authenticateToken, authorizeRoles('Admin'), lockTheme);
router.patch('/:themeId/reveal', authenticateToken, authorizeRoles('Admin'), revealToJudges);
router.patch('/:themeId/hide', authenticateToken, authorizeRoles('Admin'), hideFromJudges);
router.patch('/:themeId/intro-video', authenticateToken, authorizeRoles('Admin'), updateIntroVideo);
router.delete('/:themeId', authenticateToken, authorizeRoles('Admin'), deleteTheme);
router.patch('/:themeId', authenticateToken, authorizeRoles('Admin'), updateTheme);

// Main themes (categories)
router.get('/main/all', authenticateToken, authorizeRoles('Admin'), getAllMainThemes);

// Sub-theme pool management
router.get('/pool/all', authenticateToken, authorizeRoles('Admin'), getAllThemesFromPool);
router.post('/pool', authenticateToken, authorizeRoles('Admin'), addThemeToPool);
router.patch('/pool/:themeId', authenticateToken, authorizeRoles('Admin'), updateThemeInPool);
router.delete('/pool/:themeId', authenticateToken, authorizeRoles('Admin'), deleteThemeFromPool);
router.post('/pool/reset', authenticateToken, authorizeRoles('Admin'), resetThemePool);

module.exports = router;
