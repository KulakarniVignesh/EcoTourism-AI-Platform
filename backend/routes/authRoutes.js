const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Guide = require('../models/Guide');
const Activity = require('../models/Activity');
const { authMiddleware, userMiddleware } = require('../middlewares/auth');

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    console.log(`\n[Auth] Registration Attempt: ${email} as ${role}`);

    let user = await User.findOne({ email });
    if (user) {
      console.warn(`[Auth] Duplicate email error during registration: ${email}`);
      return res.status(400).json({ message: 'User already exists' });
    }

    user = new User({ name, email, password, role });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();
    console.log(`[Auth] ✅ User created successfully: ${email} (${user.id})`);

    const payload = { user: { id: user.id, role: user.role } };
    const maxAge = 5 * 24 * 60 * 60; // 5 days

    jwt.sign(payload, process.env.JWT_SECRET || 'secret123', { expiresIn: maxAge }, (err, token) => {
      if (err) throw err;
      res.json({ token, role: user.role, name: user.name });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    console.log(`\n[Auth] Login Attempt: ${email} as ${role}`);

    const user = await User.findOne({ email });
    if (!user) {
      console.warn(`[Auth] Login failed: User not found (${email})`);
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    // Role Validation
    if (user.role !== role) {
      console.warn(`[Auth] Login failed: Role mismatch. Expected ${user.role}, got ${role}`);
      return res.status(401).json({ message: 'Role mismatch. Please select the correct role.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.warn(`[Auth] Login failed: Incorrect password (${email})`);
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    console.log(`[Auth] ✅ Login successful: ${email}`);
    const payload = { user: { id: user.id, role: user.role } };
    jwt.sign(payload, process.env.JWT_SECRET || 'secret123', { expiresIn: '5d' }, (err, token) => {
      if (err) throw err;
      res.json({ token, role: user.role, name: user.name });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get Profile
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('Get Profile Error:', err.message);
    res.status(500).send('Server Error');
  }
});

// Update Profile (Settings)
router.put('/me', authMiddleware, async (req, res) => {
  try {
    const { name, email } = req.body;
    let user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name) user.name = name;
    if (email) user.email = email;

    await user.save();
    res.json({ message: 'Profile updated successfully', user: { name: user.name, email: user.email } });
  } catch (err) {
    console.error('Update Profile Error:', err.message);
    res.status(500).send('Server Error');
  }
});

// Delete Account (Settings)
router.delete('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // If guide, delete guide profile
    if (user.role === 'guide') {
      await Guide.findOneAndDelete({ user_id: req.user.id });
    }

    await User.findByIdAndDelete(req.user.id);
    console.log(`[Auth] 🗑️ Account deleted: ${req.user.id}`);
    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    console.error('Delete Account Error:', err.message);
    res.status(500).send('Server Error');
  }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email' });
    }

    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 mins
    await user.save();

    // Since we don't have an SMTP server set up, return the token in the response for testing.
    const resetUrl = `http://localhost:3001/reset-password.html?token=${resetToken}`;
    
    console.log(`[Auth] 🔑 Password reset token generated for ${email}. Link: ${resetUrl}`);
    res.json({ 
      message: 'Password reset link generated.',
      resetUrl // This is returned to simulate an email sent
    });
  } catch (err) {
    console.error('Forgot Password Error:', err.message);
    res.status(500).send('Server Error');
  }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    
    // Hash token to compare
    const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
    
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Set new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    
    // Clear reset fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    
    await user.save();
    console.log(`[Auth] 🔐 Password reset successfully for ${user.email}`);
    
    res.json({ message: 'Password has been successfully reset. You can now log in.' });
  } catch (err) {
    console.error('Reset Password Error:', err.message);
    res.status(500).send('Server Error');
  }
});

// Track User Activity (Optional for analytics)

router.post('/activity', [authMiddleware, userMiddleware], async (req, res) => {
  try {
    const { action, details } = req.body;
    const newActivity = new Activity({
      guideId: req.user.id, // Using the same field as user identifier
      action,
      details
    });
    await newActivity.save();
    console.log(`[Analytics] Activity logged: ${action} for User: ${req.user.id}`);
    res.json({ message: 'Activity tracked successfully' });
  } catch (err) {
    console.error('❌ Activity logging error:', err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
