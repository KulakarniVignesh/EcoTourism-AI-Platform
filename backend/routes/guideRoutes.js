const express = require('express');
const router = express.Router();
const Guide = require('../models/Guide');
const User = require('../models/User');
const { authMiddleware, guideMiddleware } = require('../middlewares/auth');

// Get all guides
router.get('/', async (req, res) => {
  try {
    const guides = await Guide.find().populate('user_id', ['name', 'email']);
    res.json(guides);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Create or update guide profile
router.post('/profile', [authMiddleware, guideMiddleware], async (req, res) => {
  const { bio, location, languages, experience, price, phone } = req.body;

  // Basic validation for phone number
  if (!phone || !/^\d{10}$/.test(phone)) {
    return res.status(400).json({ message: 'A valid 10-digit phone number is required.' });
  }

  const profileFields = {
    user_id: req.user.id,
    bio,
    location,
    languages,
    experience,
    price,
    phone
  };

  try {
    let guide = await Guide.findOne({ user_id: req.user.id });

    if (guide) {
      // Update
      guide = await Guide.findOneAndUpdate({ user_id: req.user.id }, { $set: profileFields }, { new: true });
      return res.json({ message: 'Profile updated successfully', guide });
    }

    // Create
    guide = new Guide(profileFields);
    await guide.save();
    res.json({ message: 'Profile created successfully', guide });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get guide profile by id (for current logged in guide)
router.get('/me', [authMiddleware, guideMiddleware], async (req, res) => {
  try {
    const profile = await Guide.findOne({ user_id: req.user.id }).populate('user_id', ['name', 'email']);
    if (!profile) {
      return res.status(400).json({ message: 'There is no profile for this user' });
    }
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get guide by ID
router.get('/:id', async (req, res) => {
  try {
    const guide = await Guide.findById(req.params.id).populate('user_id', ['name', 'email']);
    if (!guide) {
      return res.status(404).json({ message: 'Guide not found' });
    }
    res.json(guide);
  } catch (err) {
    console.error(err.message);
    if(err.kind == 'ObjectId') {
      return res.status(404).json({ message: 'Guide not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;
