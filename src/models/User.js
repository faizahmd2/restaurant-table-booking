const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: { type: String, unique: true,
        validate: {
            validator: function(v) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message: "Please enter a valid email"
        },
        required: [true, "Email required"]
    },
    password: { type: String, required: true },
    name: { type: String },
    phone: { type: String },
    role: { type: String, default: 'customer' }, // admin, customer
    status: { type: Number, default: 1 }, // 1: active, 0: inactive
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now },
});

userSchema.pre('save', function (next) {
    this.updated = Date.now();
    next();
});

module.exports = mongoose.model('User', userSchema);