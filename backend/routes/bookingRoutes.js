const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const { authMiddleware, userMiddleware, guideMiddleware } = require('../middlewares/auth');

// Create a booking (User only)
router.post('/', [authMiddleware, userMiddleware], async (req, res) => {
  try {
    const { guide_id, date, message } = req.body;
    const newBooking = new Booking({
      tourist_id: req.user.id,
      guide_id,
      date,
      message
    });

    const booking = await newBooking.save();
    res.json(booking);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get user's bookings (User only)
router.get('/my-bookings', [authMiddleware, userMiddleware], async (req, res) => {
  try {
    const bookings = await Booking.find({ tourist_id: req.user.id })
      .populate('guide_id', ['name', 'email'])
      .sort({ date: -1 });
    res.json(bookings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get guide's booking requests (Guide only)
router.get('/guide-requests', [authMiddleware, guideMiddleware], async (req, res) => {
  try {
    const bookings = await Booking.find({ guide_id: req.user.id })
      .populate('tourist_id', ['name', 'email'])
      .sort({ date: -1 });
    res.json(bookings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Update booking status (Guide only)
router.put('/:id/status', [authMiddleware, guideMiddleware], async (req, res) => {
  try {
    const { status } = req.body;
    let booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.guide_id.toString() !== req.user.id) {
       return res.status(401).json({ message: 'User not authorized' });
    }

    booking.status = status;
    await booking.save();
    res.json(booking);
  } catch (err) {
    console.error(err.message);
    if(err.kind == 'ObjectId') {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;
