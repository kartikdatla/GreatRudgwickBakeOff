const Submission = require('../models/Submission');
const Theme = require('../models/Theme');
const path = require('path');

const createSubmission = async (req, res) => {
  try {
    const { title, description, themeId } = req.body;
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    // Check if user already submitted for this theme
    const existingSubmission = await Submission.getUserSubmissionForTheme(userId, themeId);
    if (existingSubmission) {
      return res.status(400).json({ error: 'You have already submitted for this theme' });
    }

    // Check if theme is locked
    const isLocked = await Theme.isLocked(themeId);
    if (isLocked) {
      return res.status(403).json({ error: 'This theme is locked for submissions' });
    }

    const imagePath = `/uploads/${req.file.filename}`;
    const submission = await Submission.create(userId, themeId, title, description, imagePath);

    res.status(201).json({
      message: 'Submission created successfully',
      submission
    });
  } catch (error) {
    console.error('Create submission error:', error);
    res.status(500).json({ error: 'Failed to create submission' });
  }
};

const getSubmissionsByTheme = async (req, res) => {
  try {
    const { themeId } = req.params;
    const submissions = await Submission.getByTheme(themeId);

    res.json({ submissions });
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({ error: 'Failed to get submissions' });
  }
};

const getSubmissionById = async (req, res) => {
  try {
    const { id } = req.params;
    const submission = await Submission.getById(id);

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    res.json({ submission });
  } catch (error) {
    console.error('Get submission error:', error);
    res.status(500).json({ error: 'Failed to get submission' });
  }
};

const deleteSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await Submission.delete(id, userId);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Submission not found or unauthorized' });
    }

    res.json({ message: 'Submission deleted successfully' });
  } catch (error) {
    console.error('Delete submission error:', error);
    res.status(500).json({ error: 'Failed to delete submission' });
  }
};

module.exports = {
  createSubmission,
  getSubmissionsByTheme,
  getSubmissionById,
  deleteSubmission
};
