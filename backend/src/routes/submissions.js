const express = require('express');
const router = express.Router();
const {
  createSubmission,
  getSubmissionsByTheme,
  getSubmissionById,
  deleteSubmission
} = require('../controllers/submissionController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const upload = require('../config/multer');

router.post('/', authenticateToken, authorizeRoles('Baker'), upload.single('image'), createSubmission);
router.get('/theme/:themeId', authenticateToken, getSubmissionsByTheme);
router.get('/:id', authenticateToken, getSubmissionById);
router.delete('/:id', authenticateToken, authorizeRoles('Baker'), deleteSubmission);

module.exports = router;
