const { User, InviteCode } = require('../models/User');
const { generateToken } = require('../utils/tokenUtils');

const validatePassword = (password) => {
  if (password.length < 8) {
    return 'Password must be at least 8 characters long';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }
  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter';
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number';
  }
  return null;
};

const register = async (req, res) => {
  try {
    const { email, password, name, inviteCode } = req.body;

    if (!email || !password || !name || !inviteCode) {
      return res.status(400).json({ error: 'All fields are required, including invite code' });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return res.status(400).json({ error: passwordError });
    }

    // Validate invite code
    const cleanCode = inviteCode.trim().toUpperCase();
    console.log('Registration attempt - invite code raw:', JSON.stringify(inviteCode), 'cleaned:', JSON.stringify(cleanCode));
    const invite = await InviteCode.findByCode(cleanCode);
    console.log('Invite lookup result:', invite ? JSON.stringify(invite) : 'NOT FOUND');
    if (!invite) {
      return res.status(400).json({ error: 'Invalid invite code' });
    }
    if (!invite.is_active) {
      return res.status(400).json({ error: 'This invite code is no longer active' });
    }
    if (invite.uses >= invite.max_uses) {
      return res.status(400).json({ error: 'This invite code has been fully used' });
    }

    // Role comes from the invite code
    const role = invite.role;

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const user = await User.create(email, password, name, role);
    await InviteCode.incrementUses(invite.id);

    const token = generateToken(user);

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if account is deactivated
    if (!user.is_active) {
      return res.status(403).json({ error: 'Your account has been deactivated. Contact an admin.' });
    }

    const isValidPassword = await User.verifyPassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

module.exports = { register, login, getProfile };
