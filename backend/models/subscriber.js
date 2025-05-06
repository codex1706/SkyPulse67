const mongoose = require('mongoose');

const subscriberSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  city: String
});

module.exports = mongoose.model('Subscriber', subscriberSchema);
