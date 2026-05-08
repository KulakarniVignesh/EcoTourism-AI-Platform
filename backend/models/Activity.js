const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  guideId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String, // e.g., 'transport_booking', 'hotel_booking'
    required: true
  },
  details: {
    type: String, // e.g., target URL or location context
    default: ''
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Activity', activitySchema);
