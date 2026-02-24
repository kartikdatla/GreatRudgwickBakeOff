const express = require('express');
const router = express.Router();
const {
  submitScore,
  getSubmissionScores,
  getJudgeScore,
  getLeaderboard,
  revealScores
} = require('../controllers/scoreController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.post('/submission/:submissionId', authenticateToken, authorizeRoles('Judge'), submitScore);
router.get('/submission/:submissionId', authenticateToken, getSubmissionScores);
router.get('/submission/:submissionId/judge', authenticateToken, authorizeRoles('Judge'), getJudgeScore);
router.get('/leaderboard/:themeId', authenticateToken, getLeaderboard);
router.post('/reveal', authenticateToken, authorizeRoles('Admin'), revealScores);

module.exports = router;
