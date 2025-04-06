const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  tableId: { type: String, required: true },
  bookingTime: { type: Date, required: true },
  guestCount: { type: Number, required: true },
  status: { type: String, enum: ['confirmed', 'canceled', 'completed'], default: 'confirmed' },
  confirmationCode: { type: Number, required: true },
  created: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now }
});

bookingSchema.pre('save', function (next) {
  this.updated = new Date();
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
