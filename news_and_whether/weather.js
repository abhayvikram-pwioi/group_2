const locationInput = document.getElementById("location-input");
const weatherInfo = document.getElementById("weather-info");
const weatherStatus = document.getElementById("weather-status");
const yearEl = document.getElementById("year");
const getWeatherBtn = document.getElementById("get-weather-btn");
const geolocateBtn = document.getElementById("geolocate-btn");

const MAP = {0:"☀️",1:"🌤️",2:"⛅",3:"☁️",45:"🌫️",48:"🌫️",51:"🌦️",53:"🌦️",55:"🌧️",61:"🌧️",63:"🌧️",65:"⛈️",71:"🌨️",73:"❄️",75:"❄️",95:"⛈️",96:"⛈️",99:"⛈️"};
const LBL = {0:"Clear sky",1:"Mainly clear",2:"Partly cloudy",3:"Overcast",45:"Fog",48:"Rime fog",51:"Light drizzle",53:"Moderate drizzle",55:"Dense drizzle",61:"Light rain",63:"Moderate rain",65:"Heavy rain",71:"Light snow",73:"Moderate snow",75:"Heavy snow",95:"Thunderstorm",96:"Thunderstorm with hail",99:"Heavy thunderstorm"};

const getK = () => localStorage.getItem("openWeatherApiKey") || "";

const showLoad = () => {
    weatherInfo.innerHTML = `<div class="weather-main"><div class="weather-card"><div class="skeleton-card"><div class="skeleton skeleton-line medium"></div><div class="skeleton skeleton-line long"></div><div class="skeleton skeleton-line short"></div></div></div><div class="weather-grid">${Array(6).fill('<div class="stat-card"><div class="skeleton skeleton-line short"></div><div class="skeleton skeleton-line medium"></div></div>').join("")}</div></div>`;
    weatherStatus.textContent = "Loading weather";
};

const showErr = (msg) => {
    weatherInfo.innerHTML = `<div class="state-card error"><strong>Weather update unavailable.</strong><p>${msg}</p></div>`;
    weatherStatus.textContent = "Unavailable";
};

function renderCard(d) {
    const { name, temp, desc, humidity, wind, iconUrl, iconEmoji, feels, min, max, press } = d;
    const icon = iconUrl 
        ? `<img class="weather-icon-img" src="${iconUrl}" alt="${desc}" onerror="this.onerror=null;this.style.display='none';this.nextElementSibling.style.display='block';" style="width:80px;height:80px;filter:drop-shadow(0 8px 16px rgba(0,0,0,0.2));"><div class="weather-icon" style="display:none;font-size:3.6rem;">${iconEmoji || '🌦️'}</div>`
        : `<div class="weather-icon" style="font-size:3.6rem;">${iconEmoji || '🌦️'}</div>`;
    weatherInfo.innerHTML = `<div class="weather-main"><div class="weather-card"><div class="weather-hero"><div><h4 style="font-size:1.6rem;font-weight:700;margin:0 0 4px;">${name}</h4><p style="margin:0 0 16px;font-weight:500;text-transform:capitalize;">${desc}</p><div style="font-size:3.4rem;font-weight:800;background:linear-gradient(to right,#ffffff,#93c5fd);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">${temp}°C</div><div style="margin-top:10px;font-size:0.95rem;color:#bae6fd;">Humidity ${humidity}% • Wind ${wind} km/h</div><p style="margin:12px 0 0;font-size:0.8rem;color:var(--muted);">Last updated ${new Date().toLocaleString([],{hour:"numeric",minute:"2-digit"})}</p></div>${icon}</div></div><div class="weather-grid"><div class="stat-card"><span class="label">Feels Like</span><span class="value">${feels}°C</span></div><div class="stat-card"><span class="label">Humidity</span><span class="value">${humidity}%</span></div><div class="stat-card"><span class="label">Wind Speed</span><span class="value">${wind} km/h</span></div><div class="stat-card"><span class="label">Pressure</span><span class="value">${press} hPa</span></div><div class="stat-card"><span class="label">Min Temp</span><span class="value">${min}°C</span></div><div class="stat-card"><span class="label">Max Temp</span><span class="value">${max}°C</span></div></div></div>`;
    weatherStatus.textContent = getK() ? "OpenWeather" : "Live";
}

async function fetchOW(city, coords) {
    const k = getK();
    const url = coords ? `https://api.openweathermap.org/data/2.5/weather?lat=${coords.lat}&lon=${coords.lon}&units=metric&appid=${k}` : `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${k}`;
    const r = await fetch(url);
    if (!r.ok) throw new Error(r.status === 401 ? "Invalid API Key" : "City not found");
    const d = await r.json();
    const c = d.weather[0].icon;
    let emoji = "🌦️";
    if (c.startsWith("01")) emoji = "☀️";
    else if (c.startsWith("02")) emoji = "⛅";
    else if (c.startsWith("03") || c.startsWith("04")) emoji = "☁️";
    else if (c.startsWith("09") || c.startsWith("10")) emoji = "🌧️";
    else if (c.startsWith("11")) emoji = "⛈️";
    else if (c.startsWith("13")) emoji = "❄️";
    else if (c.startsWith("50")) emoji = "🌫️";
    return { name: `${d.name}, ${d.sys.country}`, temp: d.main.temp.toFixed(1), desc: d.weather[0].description, humidity: d.main.humidity, wind: (d.wind.speed * 3.6).toFixed(1), iconUrl: `https://openweathermap.org/img/wn/${c}@2x.png`, iconEmoji: emoji, feels: d.main.feels_like.toFixed(1), min: d.main.temp_min.toFixed(1), max: d.main.temp_max.toFixed(1), press: d.main.pressure };
}

async function fetchOM(city, coords) {
    let lat = 28.6139, lon = 77.2090, name = "Delhi, IN";
    if (coords) {
        lat = coords.lat; lon = coords.lon;
        try {
            const gr = await fetch(`https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}&language=en&count=1&format=json`);
            const gd = gr.ok ? await gr.json() : null;
            const res = gd?.results?.[0];
            if (res) name = `${res.name}${res.country ? `, ${res.country}` : ""}`;
        } catch (e) { name = "Current Location"; }
    } else {
        const gr = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&format=json`);
        const gd = gr.ok ? await gr.json() : null;
        if (!gd?.results?.[0]) throw new Error(`City "${city}" not found`);
        const res = gd.results[0];
        lat = res.latitude; lon = res.longitude;
        name = `${res.name}${res.country ? `, ${res.country}` : ""}`;
    }
    const wr = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,apparent_temperature,pressure_msl&timezone=auto`);
    if (!wr.ok) throw new Error("Weather request failed");
    const wd = await wr.json();
    const cur = wd.current;
    return { name, temp: cur.temperature_2m.toFixed(1), desc: LBL[cur.weather_code] || "Partly cloudy", humidity: cur.relative_humidity_2m, wind: cur.wind_speed_10m.toFixed(1), iconUrl: null, iconEmoji: MAP[cur.weather_code] || "🌤️", feels: cur.apparent_temperature.toFixed(1), min: (cur.temperature_2m - 2).toFixed(1), max: (cur.temperature_2m + 2).toFixed(1), press: Math.round(cur.pressure_msl) };
}

async function fetchWeather(city = locationInput.value.trim(), coords = null) {
    if (!city && !coords) return showErr("Please enter a city name to search.");
    showLoad();
    try {
        const k = getK();
        if (k) {
            try {
                renderCard(await fetchOW(city, coords));
            } catch (err) {
                renderCard(await fetchOM(city, coords));
            }
        } else {
            renderCard(await fetchOM(city, coords));
        }
    } catch (e) { showErr(e.message || "Failed to load weather data."); }
}

function requestLocation() {
    weatherStatus.textContent = "Locating...";
    if (!navigator.geolocation) { fetchWeather("Delhi"); return; }
    navigator.geolocation.getCurrentPosition(
        p => fetchWeather(null, { lat: p.coords.latitude, lon: p.coords.longitude }),
        () => fetchWeather(locationInput.value.trim() || "Delhi"),
        { timeout: 8000 }
    );
}

getWeatherBtn.onclick = () => fetchWeather();
locationInput.onkeydown = e => { if (e.key === "Enter") fetchWeather(); };
geolocateBtn.onclick = () => requestLocation();
yearEl.textContent = new Date().getFullYear();
requestLocation();
