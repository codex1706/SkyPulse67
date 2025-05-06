const apiKey = "e6ec16098dc54d6a89a145147250205"; // Replace this with your WeatherAPI key

async function fetchWeather(location) {
  const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(location)}`;
  const response = await fetch(url);
  const data = await response.json();
  return data;
}

function displayWeatherAlert(data) {
  const container = document.getElementById("weather-alerts");
  container.innerHTML = `
    <div class="weather-alert-card">
      <div class="alert-date">${data.location.localtime.split(" ")[0]}</div>
      <div class="alert-title">Weather in ${data.location.name}, ${data.location.country}</div>
     <div class="alert-description">
  <strong>Condition:</strong> ${data.current.condition.text}<br>
  <strong>Feels Like:</strong> ${data.current.feelslike_c} °C<br>
  <strong>Temperature:</strong> ${data.current.temp_c} °C<br>
  <strong>Humidity:</strong> ${data.current.humidity}%<br>
  <strong>Cloud Cover:</strong> ${data.current.cloud}%<br>
  <strong>UV Index:</strong> ${data.current.uv}<br>
  <strong>Wind:</strong> ${data.current.wind_kph} kph (${data.current.wind_dir})<br>
  <strong>Visibility:</strong> ${data.current.vis_km} km
</div>

      <div class="alert-link">
        <img src="https:${data.current.condition.icon}" alt="icon">
      </div>
    </div>`;
}

// Auto-fetch by geolocation
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(async pos => {
    const { latitude, longitude } = pos.coords;
    const weather = await fetchWeather(`${latitude},${longitude}`);
    displayWeatherAlert(weather);
  });
}

// Search by city
document.getElementById("location-form").addEventListener("submit", async e => {
  e.preventDefault();
  const city = document.getElementById("location-input").value.trim();
  if (city) {
    const weather = await fetchWeather(city);
    displayWeatherAlert(weather);
  }
});


