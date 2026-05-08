const express = require('express');
const router = express.Router();
const { analyzeTrip } = require('../controllers/travelController');
const { authMiddleware } = require('../middlewares/auth');

// @route   POST /api/travel/analyze
// @desc    Analyze trip for footprint, crowd, and best visit time
// @access  Protected
router.post('/analyze', authMiddleware, analyzeTrip);

module.exports = router;
