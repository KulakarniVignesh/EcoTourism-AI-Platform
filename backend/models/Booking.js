const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  tourist_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  guide_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  message: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
