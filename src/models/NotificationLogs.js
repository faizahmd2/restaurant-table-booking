const mongoose = require('mongoose');

const notificationLogSchema = new mongoose.Schema({
  type: { type: String, enum: ['email', 'sms'], required: true },
  recipient: { type: String, required: true },
  message: { type: String },
  provider: { type: String },
  referenceType: { type: String },
  referenceId: { type: String },
  remarks: { type: String },
  status: { type: String, enum: ['pending', 'sent', 'failed', 'limit_reached'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('NotificationLog', notificationLogSchema);
