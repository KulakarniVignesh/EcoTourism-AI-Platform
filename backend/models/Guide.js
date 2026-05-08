const mongoose = require('mongoose');

const guideSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  bio: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
  languages: {
    type: String,
    default: ''
  },
  experience: {
    type: String, // E.g., '5 years'
    default: ''
  },
  price: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  phone: {
    type: String,
    required: true,
    default: '0000000000'
  }
}, { timestamps: true });

module.exports = mongoose.model('Guide', guideSchema);
