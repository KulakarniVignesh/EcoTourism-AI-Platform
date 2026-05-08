const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Guide = require('../models/Guide');
const Booking = require('../models/Booking');
const { authMiddleware, userMiddleware } = require('../middlewares/auth');

// Add a review
router.post('/', [authMiddleware, userMiddleware], async (req, res) => {
  try {
    const { booking_id, guide_id, rating, comment } = req.body;

    // Verify booking belongs to user and is completed/accepted
    const booking = await Booking.findById(booking_id);
    if(!booking || booking.tourist_id.toString() !== req.user.id || booking.status !== 'accepted') {
        return res.status(400).json({ message: 'Valid accepted booking required to review.' });
    }

    const newReview = new Review({
      booking_id,
      tourist_id: req.user.id,
      guide_id,
      rating,
      comment
    });

    const review = await newReview.save();

    // Update Guide average rating
    const reviews = await Review.find({ guide_id });
    const avgRating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;
    
    await Guide.findOneAndUpdate(
        { user_id: guide_id }, 
        { rating: avgRating, totalReviews: reviews.length }
    );

    res.json(review);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get guide reviews
router.get('/guide/:guide_id', async (req, res) => {
  try {
    const reviews = await Review.find({ guide_id: req.params.guide_id }).populate('tourist_id', ['name']);
    res.json(reviews);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
