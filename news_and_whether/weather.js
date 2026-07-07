const locationInput = document.getElementById("location-input");
const weatherInfo = document.getElementById("weather-info");
const weatherStatus = document.getElementById("weather-status");
const yearEl = document.getElementById("year");
const getWeatherBtn = document.getElementById("get-weather-btn");
const geolocateBtn = document.getElementById("geolocate-btn");

const apiKeyInput = document.getElementById("api-key-input");
const saveKeyBtn = document.getElementById("save-key-btn");
const clearKeyBtn = document.getElementById("clear-key-btn");
const keyStatus = document.getElementById("key-status");

// Open-Meteo Weather Codes Map (Fallback)
const WEATHER_CODE_MAP = {
    0: { icon: "☀️", label: "Clear sky" },
    1: { icon: "🌤️", label: "Mainly clear" },
    2: { icon: "⛅", label: "Partly cloudy" },
    3: { icon: "☁️", label: "Overcast" },
    45: { icon: "🌫️", label: "Fog" },
    48: { icon: "🌫️", label: "Rime fog" },
    51: { icon: "🌦️", label: "Light drizzle" },
    53: { icon: "🌦️", label: "Moderate drizzle" },
    55: { icon: "🌧️", label: "Dense drizzle" },
    61: { icon: "🌧️", label: "Light rain" },
    63: { icon: "🌧️", label: "Moderate rain" },
    65: { icon: "⛈️", label: "Heavy rain" },
    71: { icon: "🌨️", label: "Light snow" },
    73: { icon: "❄️", label: "Moderate snow" },
    75: { icon: "❄️", label: "Heavy snow" },
    95: { icon: "⛈️", label: "Thunderstorm" },
    96: { icon: "⛈️", label: "Thunderstorm with hail" },
    99: { icon: "⛈️", label: "Heavy thunderstorm" }
};

// Handle API Key Management
function getApiKey() {
    return localStorage.getItem("openWeatherApiKey") || "";
}

function updateKeyStatusUI() {
    const key = getApiKey();
    if (key) {
        keyStatus.textContent = "Key Set (Using OpenWeather)";
        keyStatus.style.background = "rgba(56, 189, 248, 0.16)";
        keyStatus.style.color = "#bae6fd";
        apiKeyInput.value = "••••••••••••••••••••";
    } else {
        keyStatus.textContent = "No Key Set (Using Fallback)";
        keyStatus.style.background = "rgba(255, 255, 255, 0.08)";
        keyStatus.style.color = "#cbd5e1";
        apiKeyInput.value = "";
    }
}

saveKeyBtn.addEventListener("click", () => {
    const key = apiKeyInput.value.trim();
    if (key && key !== "••••••••••••••••••••") {
        localStorage.setItem("openWeatherApiKey", key);
        updateKeyStatusUI();
        fetchWeather();
    }
});

clearKeyBtn.addEventListener("click", () => {
    localStorage.removeItem("openWeatherApiKey");
    updateKeyStatusUI();
    fetchWeather();
});

// UI Skeleton States
function showWeatherLoading() {
    weatherInfo.innerHTML = `
        <div class="weather-main">
            <div class="weather-card">
                <div class="skeleton-card">
                    <div class="skeleton skeleton-line medium"></div>
                    <div class="skeleton skeleton-line long"></div>
                    <div class="skeleton skeleton-line short"></div>
                </div>
            </div>
            <div class="weather-grid">
                ${Array.from({ length: 4 }, () => `
                    <div class="stat-card">
                        <div class="skeleton skeleton-line short"></div>
                        <div class="skeleton skeleton-line medium"></div>
                    </div>
                `).join("")}
            </div>
        </div>
    `;
    weatherStatus.textContent = "Loading weather";
}

function showWeatherError(message) {
    weatherInfo.innerHTML = `
        <div class="state-card error" role="alert">
            <strong>Weather update unavailable.</strong>
            <p>${message}</p>
        </div>
    `;
    weatherStatus.textContent = "Unavailable";
}

// Render Weather
function renderWeatherCard(data) {
    const { cityName, temp, condition, humidity, windSpeed, iconUrl, iconEmoji, feelsLike, tempMin, tempMax, pressure } = data;
    
    const iconMarkup = iconUrl 
        ? `<img class="weather-icon-img" src="${iconUrl}" alt="${condition}" onerror="this.onerror=null; this.style.display='none'; this.nextElementSibling.style.display='block';" style="width: 80px; height: 80px; filter: drop-shadow(0 8px 16px rgba(0,0,0,0.2));"><div class="weather-icon" style="display: none; font-size: 3.6rem;">${iconEmoji || '🌦️'}</div>`
        : `<div class="weather-icon" aria-hidden="true" style="font-size: 3.6rem;">${iconEmoji || '🌦️'}</div>`;

    const updatedAt = new Date().toLocaleString([], {
        hour: "numeric",
        minute: "2-digit"
    });

    weatherInfo.innerHTML = `
        <div class="weather-main">
            <div class="weather-card">
                <div class="weather-hero">
                    <div>
                        <h4 style="font-size: 1.6rem; font-weight: 700; margin: 0 0 4px;">${cityName}</h4>
                        <p class="location-sub" style="margin: 0 0 16px; font-weight: 500; text-transform: capitalize;">${condition}</p>
                        <div class="weather-temp" style="font-size: 3.4rem; font-weight: 800; background: linear-gradient(to right, #ffffff, #93c5fd); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">${temp}°C</div>
                        <div class="weather-condition" style="margin-top: 10px; font-size: 0.95rem; color: #bae6fd;">Humidity ${humidity}% • Wind ${windSpeed} km/h</div>
                        <p class="weather-updated" style="margin: 12px 0 0; font-size: 0.8rem; color: var(--muted);">Last updated ${updatedAt}</p>
                    </div>
                    ${iconMarkup}
                </div>
            </div>
            <div class="weather-grid">
                <div class="stat-card">
                    <span class="label">Feels Like</span>
                    <span class="value">${feelsLike}°C</span>
                </div>
                <div class="stat-card">
                    <span class="label">Humidity</span>
                    <span class="value">${humidity}%</span>
                </div>
                <div class="stat-card">
                    <span class="label">Wind Speed</span>
                    <span class="value">${windSpeed} km/h</span>
                </div>
                <div class="stat-card">
                    <span class="label">Pressure</span>
                    <span class="value">${pressure} hPa</span>
                </div>
                <div class="stat-card">
                    <span class="label">Min Temp</span>
                    <span class="value">${tempMin}°C</span>
                </div>
                <div class="stat-card">
                    <span class="label">Max Temp</span>
                    <span class="value">${tempMax}°C</span>
                </div>
            </div>
        </div>
    `;
    weatherStatus.textContent = getApiKey() ? "OpenWeather" : "Fallback";
}

// Fetch via OpenWeather Map
async function fetchOpenWeather(city = null, coords = null) {
    const apiKey = getApiKey();
    let url = "";
    if (coords) {
        url = `https://api.openweathermap.org/data/2.5/weather?lat=${coords.latitude}&lon=${coords.longitude}&units=metric&appid=${apiKey}`;
    } else {
        url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}`;
    }

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(response.status === 401 ? "Invalid API Key" : "City not found in OpenWeather");
    }
    const data = await response.json();
    
    const iconCode = data.weather[0].icon;
    let iconEmoji = "🌦️";
    if (iconCode.startsWith("01")) iconEmoji = "☀️";
    else if (iconCode.startsWith("02")) iconEmoji = "⛅";
    else if (iconCode.startsWith("03") || iconCode.startsWith("04")) iconEmoji = "☁️";
    else if (iconCode.startsWith("09") || iconCode.startsWith("10")) iconEmoji = "🌧️";
    else if (iconCode.startsWith("11")) iconEmoji = "⛈️";
    else if (iconCode.startsWith("13")) iconEmoji = "❄️";
    else if (iconCode.startsWith("50")) iconEmoji = "🌫️";

    return {
        cityName: `${data.name}, ${data.sys.country}`,
        temp: data.main.temp.toFixed(1),
        condition: data.weather[0].description,
        humidity: data.main.humidity,
        windSpeed: (data.wind.speed * 3.6).toFixed(1), // Convert m/s to km/h
        iconUrl: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
        iconEmoji: iconEmoji,
        feelsLike: data.main.feels_like.toFixed(1),
        tempMin: data.main.temp_min.toFixed(1),
        tempMax: data.main.temp_max.toFixed(1),
        pressure: data.main.pressure
    };
}

// Fetch via Open-Meteo (Fallback)
async function fetchOpenMeteoFallback(city = null, coords = null) {
    let lat = 28.6139; // Delhi defaults
    let lon = 77.2090;
    let cityName = "Delhi, IN";

    if (coords) {
        lat = coords.latitude;
        lon = coords.longitude;
        // Get name
        try {
            const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}&language=en&count=1&format=json`);
            if (geoRes.ok) {
                const geoData = await geoRes.json();
                const res = geoData.results?.[0];
                if (res) {
                    cityName = `${res.name}${res.country ? `, ${res.country}` : ""}`;
                }
            }
        } catch (e) {
            cityName = "Current Location";
        }
    } else {
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
        if (!geoRes.ok) {
            throw new Error("Geocoding failed");
        }
        const geoData = await geoRes.json();
        if (!geoData.results || geoData.results.length === 0) {
            throw new Error(`City "${city}" not found`);
        }
        const result = geoData.results[0];
        lat = result.latitude;
        lon = result.longitude;
        cityName = `${result.name}${result.country ? `, ${result.country}` : ""}`;
    }

    const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,apparent_temperature,pressure_msl&timezone=auto`);
    if (!weatherRes.ok) {
        throw new Error("Weather request failed");
    }
    const wData = await weatherRes.json();
    const current = wData.current;
    
    // Map code to condition
    const conditionObj = WEATHER_CODE_MAP[current.weather_code] || { icon: "🌤️", label: "Partly cloudy" };

    return {
        cityName,
        temp: current.temperature_2m.toFixed(1),
        condition: conditionObj.label,
        humidity: current.relative_humidity_2m,
        windSpeed: current.wind_speed_10m.toFixed(1),
        iconUrl: null,
        iconEmoji: conditionObj.icon,
        feelsLike: current.apparent_temperature.toFixed(1),
        tempMin: (current.temperature_2m - 2).toFixed(1), // estimate for min/max
        tempMax: (current.temperature_2m + 2).toFixed(1),
        pressure: Math.round(current.pressure_msl)
    };
}

// Controller
async function fetchWeather(city = locationInput.value.trim(), coords = null) {
    if (!city && !coords) {
        showWeatherError("Please enter a city name to search.");
        return;
    }

    showWeatherLoading();
    const key = getApiKey();

    try {
        if (key) {
            try {
                const weatherData = await fetchOpenWeather(city, coords);
                renderWeatherCard(weatherData);
            } catch (err) {
                console.warn("OpenWeather failed, attempting Open-Meteo fallback:", err);
                const fallbackData = await fetchOpenMeteoFallback(city, coords);
                renderWeatherCard(fallbackData);
                // Inform user OpenWeather failed
                weatherStatus.textContent = "Fallback (OpenWeather Key Error)";
            }
        } else {
            const fallbackData = await fetchOpenMeteoFallback(city, coords);
            renderWeatherCard(fallbackData);
        }
    } catch (error) {
        console.error("General weather error:", error);
        showWeatherError(error.message || "Failed to load weather data.");
    }
}

// Geolocation triggers
function requestLocation() {
    weatherStatus.textContent = "Locating...";
    if (!navigator.geolocation) {
        fetchWeather("Delhi");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            fetchWeather(null, {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            });
        },
        (error) => {
            console.warn("Geolocation denied or timed out:", error);
            fetchWeather(locationInput.value.trim() || "Delhi");
        },
        { timeout: 8000 }
    );
}

// Event Listeners
getWeatherBtn.addEventListener("click", () => {
    fetchWeather();
});

locationInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        fetchWeather();
    }
});

geolocateBtn.addEventListener("click", () => {
    requestLocation();
});

// Initialize
yearEl.textContent = new Date().getFullYear();
updateKeyStatusUI();
requestLocation();
