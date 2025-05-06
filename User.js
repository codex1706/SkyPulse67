const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  phoneNumber: String,
  locations: [String], // e.g., ['Lagos', 'Abuja']
});

module.exports = mongoose.model('User', UserSchema);
