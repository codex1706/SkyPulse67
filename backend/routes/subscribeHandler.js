const express = require('express');
const router = express.Router();
const Subscriber = require('../models/subscriber');
const axios = require('axios');

// Utility: fetch severe weather alert
async function getSevereWeatherAlert(city) {
  const apiKey = process.env.WEATHER_API_KEY;
  const url = `http://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&days=1`;

  try {
    const response = await axios.get(url);
    const forecast = response.data.forecast.forecastday[0].day;
    const condition = forecast.condition.text.toLowerCase();

    if (condition.includes("rain") || condition.includes("thunder")) {
      return `🌧️ Heavy rain or thunder expected today in ${city}. Stay dry and safe.`;
    } else if (condition.includes("sunny") && forecast.uv >= 7) {
      return `☀️ It's very sunny in ${city} with a high UV index. Stay hydrated and use sun protection.`;
    } else if (condition.includes("storm") || forecast.maxwind_kph >= 30) {
      return `🌪️ High winds or storm expected in ${city}. Take precautions.`;
    } else {
      return null;
    }
  } catch (err) {
    console.error("❌ Weather API error:", err.message);
    return null;
  }
}

// WhatsApp via Ultramsg
async function sendWhatsApp(to, body) {
  const instanceId = process.env.ULTRAMSG_INSTANCE_ID;
  const token = process.env.ULTRAMSG_TOKEN;
  const url = `https://api.ultramsg.com/${instanceId}/messages/chat`;

  const payload = {
    token: token,
    to: to,
    body: body
  };

  try {
    const response = await axios.get(url, { params: payload });
    console.log("📤 WhatsApp sent:", response.data);
  } catch (err) {
    console.error("❌ Ultramsg WhatsApp error:", err.message);
  }
}

// POST /subscribe route
router.post('/subscribe', async (req, res) => {
  const { name, email, phone, city } = req.body;

  try {
    await Subscriber.create({ name, email, phone, city });

    const welcomeMessage = `Hi ${name}, you're subscribed to SkyPulse weather alerts for ${city}. You'll receive WhatsApp alerts when severe weather is expected.`;
    await sendWhatsApp(phone, welcomeMessage);

    res.redirect('/Subscribe.html');
  } catch (err) {
    console.error("❌ Subscription error:", err.message);
    res.status(500).send("Something went wrong");
  }
});

// Periodic alert sender (to be scheduled in server.js)
async function sendWeatherAlerts() {
  try {
    const subscribers = await Subscriber.find();
    for (const user of subscribers) {
      const alert = await getSevereWeatherAlert(user.city);
      if (alert) {
        await sendWhatsApp(user.phone, `⚠️ Severe Weather Alert:
${alert}`);
      } else {
        console.log(`ℹ️ No severe alert for ${user.city}`);
      }
    }
  } catch (err) {
    console.error("❌ Error sending alerts:", err.message);
  }
}

module.exports = {
  router,
  sendWeatherAlerts
};

