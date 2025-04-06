const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
  tableId: { type: String, required: true },
  capacity: { type: Number, required: true },
  status: { type: Number, default: 1 },
});

const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String
  },
  cuisineType: String,
  capacity: Number,
  tables: [tableSchema],
  status: { type: Number, default: 1 },
  created: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now }
});

restaurantSchema.pre('save', function (next) {
    this.updated = Date.now();
    next();
});

module.exports = mongoose.model('Restaurant', restaurantSchema);
