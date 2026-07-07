const newsGrid = document.getElementById("news-grid");
const locationInput = document.getElementById("location-input");
const weatherInfo = document.getElementById("weather-info");
const categorySelect = document.getElementById("category-select");
const newsStatus = document.getElementById("news-status");
const weatherStatus = document.getElementById("weather-status");
const yearEl = document.getElementById("year");
const getWeatherBtn = document.getElementById("get-weather-btn");

const MAP = {0:"☀️",1:"🌤️",2:"⛅",3:"☁️",45:"🌫️",48:"🌫️",51:"🌦️",53:"🌦️",55:"🌧️",61:"🌧️",63:"🌧️",65:"⛈️",71:"🌨️",73:"❄️",75:"❄️",95:"⛈️",96:"⛈️",99:"⛈️"};
const LBL = {0:"Clear sky",1:"Mainly clear",2:"Partly cloudy",3:"Overcast",45:"Fog",48:"Rime fog",51:"Light drizzle",53:"Moderate drizzle",55:"Dense drizzle",61:"Light rain",63:"Moderate rain",65:"Heavy rain",71:"Light snow",73:"Moderate snow",75:"Heavy snow",95:"Thunderstorm",96:"Thunderstorm with hail",99:"Heavy thunderstorm"};

const DEMO_ARTICLES = {
    general: [
        { title: "India's Tech Boom: How Startups are Changing the Nation", description: "A comprehensive look at how Indian startups are revolutionizing technology and creating jobs.", image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=300&fit=crop", source: "Tech Daily India", publishedAt: "2026-07-07T10:30:00Z", url: "https://example.com/india-tech" },
        { title: "New Delhi Infrastructure Projects Complete", description: "Major infrastructure development in India's capital brings modern facilities to millions.", image: "https://images.unsplash.com/photo-1486718448742-163732cd3d3e?w=500&h=300&fit=crop", source: "News India", publishedAt: "2026-07-07T09:15:00Z", url: "https://example.com/delhi-infra" },
        { title: "Monsoon Season Brings Relief to Farmers", description: "Good rainfall patterns this season promise improved agricultural yields.", image: "https://images.unsplash.com/photo-1500382017468-7049fad16d13?w=500&h=300&fit=crop", source: "Agriculture Times", publishedAt: "2026-07-06T14:45:00Z", url: "https://example.com/monsoon" }
    ],
    technology: [
        { title: "AI Revolution: New Machine Learning Breakthroughs", description: "Latest developments in artificial intelligence are changing how we work.", image: "https://images.unsplash.com/photo-1677442d019cecf8c91d2c0a7f85e4e73?w=500&h=300&fit=crop", source: "Tech News", publishedAt: "2026-07-07T11:20:00Z", url: "https://example.com/ai" },
        { title: "5G Networks Expand Across India", description: "Telecom providers rollout 5G services in major cities, promising faster speeds.", image: "https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=500&h=300&fit=crop", source: "Telecom India", publishedAt: "2026-07-07T08:00:00Z", url: "https://example.com/5g" }
    ],
    sports: [
        { title: "India Cricket Team Wins Against Pakistan", description: "An exciting match ends with India securing victory in the final over.", image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=500&h=300&fit=crop", source: "Sports Today", publishedAt: "2026-07-07T12:00:00Z", url: "https://example.com/cricket" }
    ],
    business: [
        { title: "Stock Market Reaches New Heights", description: "Indian stock market indices close at record levels.", image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=500&h=300&fit=crop", source: "Business India", publishedAt: "2026-07-07T15:30:00Z", url: "https://example.com/stocks" }
    ],
    entertainment: [
        { title: "Bollywood Blockbuster Breaks Box Office Records", description: "Latest Hindi film becomes the highest-grossing film of the year.", image: "https://images.unsplash.com/photo-1489599849228-ed5169a458c7?w=500&h=300&fit=crop", source: "Entertainment Hub", publishedAt: "2026-07-07T13:45:00Z", url: "https://example.com/bollywood" }
    ],
    health: [
        { title: "New Vaccine Development Shows Promising Results", description: "Medical breakthrough could prevent major disease affecting millions.", image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=500&h=300&fit=crop", source: "Health News", publishedAt: "2026-07-07T14:20:00Z", url: "https://example.com/vaccine" }
    ]
};

let currentCat = categorySelect.value;
const formatDate = (v) => v ? new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(v)) : "Recently published";

const showNewsLoad = () => {
    newsGrid.innerHTML = Array(4).fill('<div class="skeleton-card"><div class="skeleton skeleton-image"></div><div class="skeleton skeleton-line medium"></div><div class="skeleton skeleton-line long"></div><div class="skeleton skeleton-line short"></div></div>').join("");
    newsStatus.textContent = "Loading headlines";
};

const showNewsErr = (msg) => {
    newsGrid.innerHTML = `<div class="state-card error"><strong>We hit a snag.</strong><p>${msg}</p></div>`;
    newsStatus.textContent = "Unavailable";
};

function renderNews(arts) {
    if (!arts || arts.length === 0) return showNewsErr("There are no articles at the moment.");
    const fbImg = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MDAiIGhlaWdodD0iMzAwIiB2aWV3Qm94PSIwIDAgNTAwIDMwMCI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iIzFlMjkzYiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ic3lzdGVtLXVpLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTRhM2I4IiBmb250LXdlaWdodD0iNjAwIj5Ob3J0aHN0YXIgSW50ZWxsaWdlbmNlPC90ZXh0Pjwvc3ZnPg==`;
    newsGrid.innerHTML = arts.map(art => {
        const img = art.image || art.urlToImage || "";
        const desc = art.description?.replace(/<[^>]+>/g, "").trim() || "Read the full story to learn more.";
        return `<article class="news-card" role="listitem" tabindex="0" data-url="${art.url}">${img ? `<img class="news-card-image" src="${img}" alt="${art.title}" loading="lazy" onerror="this.onerror=null;this.src='${fbImg}';">` : `<div class="news-image-fallback">No Image Available</div>`}<div class="news-card-content"><div class="meta-row"><span class="source-badge">${art.source || 'News'}</span><span>${formatDate(art.publishedAt)}</span></div><h4>${art.title}</h4><p>${desc}</p><button type="button" class="read-link">Read full article</button></div></article>`;
    }).join("");
    newsStatus.textContent = `${currentCat.charAt(0).toUpperCase()}${currentCat.slice(1)}`;
}

async function fetchNews(cat = currentCat) {
    currentCat = cat;
    showNewsLoad();
    try {
        const k = localStorage.getItem("newsApiKey") || "";
        if (k) {
            try {
                const r = await fetch(`https://gnews.io/api/v4/top-headlines?lang=en&country=in&max=10&topic=${cat}&apikey=${k}`);
                if (r.ok) {
                    const d = await r.json();
                    return renderNews((d.articles || []).slice(0, 8).map(a => ({ title: a.title, description: a.description, image: a.image || a.urlToImage, source: a.source?.name, publishedAt: a.publishedAt, url: a.url })));
                }
            } catch (e) { console.log("Fallback to demo"); }
        }
        renderNews(DEMO_ARTICLES[cat] || DEMO_ARTICLES.general);
    } catch (err) { showNewsErr("Unavailable."); }
}

const showWeatherLoad = () => {
    weatherInfo.innerHTML = `<div class="weather-main"><div class="weather-card"><div class="skeleton-card"><div class="skeleton skeleton-line medium"></div><div class="skeleton skeleton-line long"></div><div class="skeleton skeleton-line short"></div></div></div><div class="weather-grid">${Array(4).fill('<div class="stat-card"><div class="skeleton skeleton-line short"></div><div class="skeleton skeleton-line medium"></div></div>').join("")}</div></div>`;
    weatherStatus.textContent = "Loading weather";
};

const showWeatherErr = (msg) => {
    weatherInfo.innerHTML = `<div class="state-card error"><strong>Weather update unavailable.</strong><p>${msg}</p></div>`;
    weatherStatus.textContent = "Unavailable";
};

function renderWeather(d, name) {
    const cur = d.current, cond = MAP[cur.weather_code] || "🌤️", desc = LBL[cur.weather_code] || "Weather update", temp = Number(cur.temperature_2m).toFixed(1);
    weatherInfo.innerHTML = `<div class="weather-main"><div class="weather-card"><div class="weather-hero"><div><h4>${name}</h4><p class="location-sub">${desc}</p><div class="weather-temp">${temp}°C</div><div class="weather-condition">Humidity ${cur.relative_humidity_2m}% • Wind ${cur.wind_speed_10m} km/h</div><p class="weather-updated">Last updated ${new Date(cur.time).toLocaleString([],{hour:"numeric",minute:"2-digit"})}</p></div><div class="weather-icon" aria-hidden="true">${cond}</div></div></div><div class="weather-grid"><div class="stat-card"><span class="label">Temperature</span><span class="value">${temp}°C</span></div><div class="stat-card"><span class="label">Humidity</span><span class="value">${cur.relative_humidity_2m}%</span></div><div class="stat-card"><span class="label">Wind</span><span class="value">${cur.wind_speed_10m} km/h</span></div><div class="stat-card"><span class="label">Condition</span><span class="value">${desc}</span></div></div></div>`;
    weatherStatus.textContent = "Live";
}

async function fetchWeather(city = locationInput.value.trim(), coords = null) {
    if (!city && !coords) return showWeatherErr("Enter a city name.");
    showWeatherLoad();
    try {
        let lat, lon, name = city;
        if (coords) {
            lat = coords.lat; lon = coords.lon;
            try {
                const gr = await fetch(`https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}&language=en&count=1&format=json`);
                const gd = gr.ok ? await gr.json() : null;
                const res = gd?.results?.[0];
                name = res ? `${res.name}${res.country ? `, ${res.country}` : ""}` : "Current Location";
            } catch (e) { name = "Current Location"; }
        } else {
            const gr = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&format=json`);
            if (!gr.ok) throw new Error();
            const gd = await gr.json();
            if (!gd.results?.[0]) return showWeatherErr(`We could not find "${city}".`);
            const res = gd.results[0];
            lat = res.latitude; lon = res.longitude;
            name = `${res.name}${res.country ? `, ${res.country}` : ""}`;
        }
        const wr = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=auto`);
        if (!wr.ok) throw new Error();
        renderWeather(await wr.json(), name);
    } catch (e) { showWeatherErr("Unable to retrieve weather data."); }
}

function requestLocation() {
    if (!navigator.geolocation) { fetchWeather("Delhi"); return; }
    navigator.geolocation.getCurrentPosition(
        p => fetchWeather(null, { lat: p.coords.latitude, lon: p.coords.longitude }),
        () => fetchWeather(locationInput.value.trim() || "Delhi"),
        { timeout: 8000 }
    );
}

const openUrl = (e) => {
    const card = e.target.closest(".news-card");
    if (card?.dataset.url) window.open(card.dataset.url, "_blank", "noopener");
};

newsGrid.onclick = openUrl;
newsGrid.onkeydown = (e) => { if (e.key === "Enter" || e.key === " ") openUrl(e); };
categorySelect.onchange = (e) => fetchNews(e.target.value);
getWeatherBtn.onclick = () => fetchWeather();
locationInput.onkeydown = (e) => { if (e.key === "Enter") fetchWeather(); };

yearEl.textContent = new Date().getFullYear();
fetchNews(currentCat);
requestLocation();
