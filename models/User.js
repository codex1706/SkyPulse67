const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  phoneNumber: String,
  locations: [String]
});

module.exports = mongoose.model('User', UserSchema);
