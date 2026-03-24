const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { Event, EmailLog } = require('../models/Event');
const { sendBroadcastEmail } = require('../utils/email');

// GET /api/events - Get all events (any authenticated user)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const events = await Event.getAll();
    res.json({ events });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// GET /api/events/upcoming - Get upcoming events only
router.get('/upcoming', authenticateToken, async (req, res) => {
  try {
    const events = await Event.getUpcoming();
    res.json({ events });
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// POST /api/events - Create event (admin only) + notify all users
router.post('/', authenticateToken, authorizeRoles('Admin'), async (req, res) => {
  try {
    const { title, description, eventDate, eventTime } = req.body;

    if (!title || !eventDate) {
      return res.status(400).json({ error: 'Title and date are required' });
    }

    const event = await Event.create(title, description, eventDate, eventTime, req.user.id);

    // Format date for email
    const dateObj = new Date(eventDate + 'T00:00:00');
    const formattedDate = dateObj.toLocaleDateString('en-GB', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
    const timeStr = eventTime ? ` at ${eventTime}` : '';

    const emailMessage = `${description || title}\n\nDate: ${formattedDate}${timeStr}`;
    const result = await sendBroadcastEmail(
      `Bake Off Event: ${title}`,
      emailMessage,
      'all'
    );

    // Log the email
    await EmailLog.create(
      `Bake Off Event: ${title}`,
      emailMessage,
      req.user.id,
      result.sent
    );

    res.status(201).json({
      event,
      message: `Event created and ${result.sent} user${result.sent !== 1 ? 's' : ''} notified`
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// DELETE /api/events/:id - Delete event (admin only)
router.delete('/:id', authenticateToken, authorizeRoles('Admin'), async (req, res) => {
  try {
    const result = await Event.delete(parseInt(req.params.id));
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json({ message: 'Event deleted' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

// GET /api/events/email-history - Get email log (any authenticated user)
router.get('/email-history', authenticateToken, async (req, res) => {
  try {
    const emails = await EmailLog.getAll();
    res.json({ emails });
  } catch (error) {
    console.error('Error fetching email history:', error);
    res.status(500).json({ error: 'Failed to fetch email history' });
  }
});

module.exports = router;
