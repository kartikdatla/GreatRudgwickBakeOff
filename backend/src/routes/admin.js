const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { User, InviteCode } = require('../models/User');
const crypto = require('crypto');

// All admin routes require Admin role
router.use(authenticateToken, authorizeRoles('Admin'));

// ============ USER MANAGEMENT ============

// GET /api/admin/users - List all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.getAll();
    res.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// PATCH /api/admin/users/:id/role - Change user role
router.patch('/users/:id/role', async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: 'Cannot change your own role' });
    }

    const validRoles = ['Baker', 'Judge', 'Spectator', 'Admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const result = await User.updateRole(parseInt(id), role);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: `Role updated to ${role}` });
  } catch (error) {
    console.error('Error updating role:', error);
    res.status(500).json({ error: 'Failed to update role' });
  }
});

// PATCH /api/admin/users/:id/active - Activate/deactivate user
router.patch('/users/:id/active', async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: 'Cannot deactivate your own account' });
    }

    const result = await User.setActive(parseInt(id), isActive);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: `User ${isActive ? 'activated' : 'deactivated'}` });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
});

// DELETE /api/admin/users/:id - Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    const result = await User.deleteUser(parseInt(id));
    if (result.changes === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// ============ INVITE CODES ============

// GET /api/admin/invites - List all invite codes
router.get('/invites', async (req, res) => {
  try {
    const invites = await InviteCode.getAll();
    res.json({ invites });
  } catch (error) {
    console.error('Error fetching invites:', error);
    res.status(500).json({ error: 'Failed to fetch invite codes' });
  }
});

// POST /api/admin/invites - Create new invite code
router.post('/invites', async (req, res) => {
  try {
    const { role, maxUses } = req.body;

    const validRoles = ['Baker', 'Judge', 'Spectator'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be Baker, Judge, or Spectator.' });
    }

    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    const invite = await InviteCode.create(code, role, req.user.id, maxUses || 1);

    res.status(201).json({ invite });
  } catch (error) {
    console.error('Error creating invite:', error);
    res.status(500).json({ error: 'Failed to create invite code' });
  }
});

// PATCH /api/admin/invites/:id/deactivate - Deactivate invite code
router.patch('/invites/:id/deactivate', async (req, res) => {
  try {
    const result = await InviteCode.deactivate(parseInt(req.params.id));
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Invite code not found' });
    }
    res.json({ message: 'Invite code deactivated' });
  } catch (error) {
    console.error('Error deactivating invite:', error);
    res.status(500).json({ error: 'Failed to deactivate invite code' });
  }
});

// DELETE /api/admin/invites/:id - Delete invite code
router.delete('/invites/:id', async (req, res) => {
  try {
    const result = await InviteCode.deleteCode(parseInt(req.params.id));
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Invite code not found' });
    }
    res.json({ message: 'Invite code deleted' });
  } catch (error) {
    console.error('Error deleting invite:', error);
    res.status(500).json({ error: 'Failed to delete invite code' });
  }
});

module.exports = router;
