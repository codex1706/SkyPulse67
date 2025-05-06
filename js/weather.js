
const apiKey = "f8e682dd2c444167db57646c4fd8f87b";

document.addEventListener("DOMContentLoaded", () => {
    // ✅ Format and display date
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = today.toLocaleString('en-US', { month: 'short' });
    const formattedDate = `${day} / ${month}`;
  
    const dateEl = document.querySelector(".date");
    if (dateEl) {
      dateEl.textContent = formattedDate;
    }
  // Load weather by geolocation
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(fetchWeatherFromCoords, handleGeoError);
  }

  // Search by city
  const form = document.getElementById("searchForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const city = document.getElementById("manualLocation").value.trim();
      if (!city) return alert("Please enter a city");
      fetchCoordsByCity(city);
    });
  }
});

function handleGeoError(err) {
  console.warn("Geolocation error:", err.message);
}

function fetchWeatherFromCoords(position) {
  const lat = position.coords.latitude;
  const lon = position.coords.longitude;
  fetchWeatherByCoords(lat, lon);
}

async function fetchCoordsByCity(city) {
  const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`;
  try {
    const res = await fetch(geoUrl);
    const geo = await res.json();
    if (!geo.length) return alert("City not found");
    fetchWeatherByCoords(geo[0].lat, geo[0].lon);
  } catch (err) {
    console.error("Geo fetch failed:", err);
  }
}

async function fetchWeatherByCoords(lat, lon) {

  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;


  try {
    const res = await fetch(url);
    const data = await res.json();
    updateTodayWeather(data);
    updateForecast(data);
  } catch (err) {
    console.error("Failed to fetch forecast:", err);
  }
}

function updateTodayWeather(data) {
  const today = data.list[0];
  document.getElementById("locationName").textContent = data.city.name;
  document.getElementById("temperature").textContent = Math.round(today.main.temp) + "°C";
  document.getElementById("condition").textContent = today.weather[0].main;
  document.getElementById("humidity").textContent = today.main.humidity + "%";
  document.getElementById("windSpeed").textContent = today.wind.speed + " km/h";

  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const dirIndex = Math.round(today.wind.deg / 45) % 8;
  document.getElementById("direction").textContent = directions[dirIndex];

  const iconUrl = `https://openweathermap.org/img/wn/${today.weather[0].icon}@2x.png`;
  const iconImg = document.getElementById("todayIcon");

  if (iconImg) iconImg.src = iconUrl;

  const dayName = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const dayEl = document.getElementById("dayName");
  if (dayEl) dayEl.textContent = dayName;
}

function updateForecast(data) {
  const container = document.querySelector(".day-forecast-row");
  if (!container) return;

  container.innerHTML = "";

  const forecastsByDay = {};
  data.list.forEach(item => {
    const date = new Date(item.dt * 1000);
    const key = date.toDateString(); // unique per day

    if (!forecastsByDay[key]) {
      forecastsByDay[key] = {
        day: date.toLocaleDateString("en-US", { weekday: "long" }),
        icon: item.weather[0].icon,
        temp: Math.round(item.main.temp)
      };
    }
  });
  async function fetchWeatherAlerts(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,daily,current&appid=${apiKey}`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      const alerts = data.alerts || [];
  
      for (let i = 0; i < 3; i++) {
        const alert = alerts[i];
        const dateEl = document.getElementById("alert-date-" + (i + 1));
        const descEl = document.getElementById("alert-desc-" + (i + 1));
        const titleEl = document.querySelector("#alert-" + (i + 1) + " .alert-title");
  
        if (alert) {
          const date = new Date(alert.start * 1000);
          const formatted = String(date.getDate()).padStart(2, "0") + "." +
                            String(date.getMonth() + 1).padStart(2, "0");
  
          if (dateEl) dateEl.textContent = formatted;
          if (titleEl) titleEl.textContent = alert.event || "Weather Alert";
          if (descEl) descEl.textContent = alert.description.slice(0, 160) + "...";
        } else {
          if (dateEl) dateEl.textContent = "--.--";
          if (titleEl) titleEl.textContent = "No active alerts";
          if (descEl) descEl.textContent = "No severe weather alerts for this location currently.";
        }
      }
    } catch (err) {
      console.error("Failed to fetch weather alerts:", err);
    }
  }
  
  const dailyForecasts = Object.values(forecastsByDay).slice(1, 7); // skip today, get next 6

  dailyForecasts.forEach(forecast => {
    const card = document.createElement("div");
    card.className = "day-card";
    card.innerHTML = `
      <div class="day-card-header">
        <div class="day">${forecast.day}</div>
      </div>
      <div class="day-card-icon">
        <img src="https://openweathermap.org/img/wn/${forecast.icon}@2x.png" alt="${forecast.day}" />
      </div>
      <div class="degree">${forecast.temp}°C</div>
    `;
    container.appendChild(card);
  });
}
