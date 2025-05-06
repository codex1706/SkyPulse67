const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const twilio = require('twilio');
const cron = require('node-cron');
const bodyParser = require('body-parser');
require('dotenv').config();

const { router, sendWeatherAlerts } = require('./routes/subscribeHandler');


const app = express();
const User = require('./models/User');
const path = require('path');

// Serve static frontend files from the main project folder
app.use(express.static(path.join(__dirname, '..')));

// Route for root URL
app.get('/test', (req, res) => {
  res.send('🧪 Test route is working!');
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/', router);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err));


app.post('/api/register', async (req, res) => {
  const { phoneNumber, locations } = req.body;
  try {
    const user = new User({ phoneNumber, locations });
    await user.save();
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Twilio client
const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);


// Cron job: runs every 30 minutes
cron.schedule('0 */3 * * *', async () => {
  console.log("⏰ Running updated severe weather alert job...");
  await sendWeatherAlerts();
});


// Start the server
app.get('/', (req, res) => {
  console.log("🔥 / route was hit");
  res.status(200).send('✅ Weather Alert Backend is running.');
});
// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
