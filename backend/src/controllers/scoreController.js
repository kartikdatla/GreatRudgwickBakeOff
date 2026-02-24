const Score = require('../models/Score');
const Theme = require('../models/Theme');
const Settings = require('../models/Settings');
const Submission = require('../models/Submission');

const submitScore = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { taste, presentation, creativity, overall, comments } = req.body;
    const judgeId = req.user.id;

    // Validate scores
    if (!taste || !presentation || !creativity || !overall) {
      return res.status(400).json({ error: 'All scores are required' });
    }

    if ([taste, presentation, creativity, overall].some(s => s < 1 || s > 10)) {
      return res.status(400).json({ error: 'Scores must be between 1 and 10' });
    }

    // Check if submission exists
    const submission = await Submission.getById(submissionId);
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    // Check if theme is locked
    const isLocked = await Theme.isLocked(submission.theme_id);
    if (isLocked) {
      return res.status(403).json({ error: 'Scoring is locked for this theme' });
    }

    // Check if judge already scored this submission
    const existingScore = await Score.getJudgeScore(submissionId, judgeId);

    const scores = { taste, presentation, creativity, overall, comments };

    if (existingScore) {
      await Score.update(submissionId, judgeId, scores);
      res.json({ message: 'Score updated successfully' });
    } else {
      await Score.create(submissionId, judgeId, scores);
      res.status(201).json({ message: 'Score submitted successfully' });
    }
  } catch (error) {
    console.error('Submit score error:', error);
    res.status(500).json({ error: 'Failed to submit score' });
  }
};

const getSubmissionScores = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const scoresRevealed = await Settings.areScoresRevealed();

    const scores = await Score.getBySubmission(submissionId, scoresRevealed);

    res.json({
      scores,
      revealed: scoresRevealed
    });
  } catch (error) {
    console.error('Get submission scores error:', error);
    res.status(500).json({ error: 'Failed to get scores' });
  }
};

const getJudgeScore = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const judgeId = req.user.id;

    const score = await Score.getJudgeScore(submissionId, judgeId);

    res.json({ score });
  } catch (error) {
    console.error('Get judge score error:', error);
    res.status(500).json({ error: 'Failed to get score' });
  }
};

const getLeaderboard = async (req, res) => {
  try {
    const { themeId } = req.params;
    const scoresRevealed = await Settings.areScoresRevealed();

    const leaderboard = await Score.getLeaderboard(themeId, scoresRevealed);

    res.json({
      leaderboard,
      revealed: scoresRevealed
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ error: 'Failed to get leaderboard' });
  }
};

const revealScores = async (req, res) => {
  try {
    const { reveal } = req.body;
    await Settings.revealScores(reveal);

    res.json({
      message: `Scores ${reveal ? 'revealed' : 'hidden'} successfully`,
      revealed: reveal
    });
  } catch (error) {
    console.error('Reveal scores error:', error);
    res.status(500).json({ error: 'Failed to update score visibility' });
  }
};

module.exports = {
  submitScore,
  getSubmissionScores,
  getJudgeScore,
  getLeaderboard,
  revealScores
};
