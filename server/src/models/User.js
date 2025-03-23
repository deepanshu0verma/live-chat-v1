const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  age: { type: Number, required: true, min: 13 },
  avatar: { type: Number, required: true, min: 1, max: 6 }, // Avatar index (1-6)
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);