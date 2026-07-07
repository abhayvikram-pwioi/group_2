const newsGrid = document.getElementById("news-grid");
const locationInput = document.getElementById("location-input");
const weatherInfo = document.getElementById("weather-info");
const categorySelect = document.getElementById("category-select");
const newsStatus = document.getElementById("news-status");
const weatherStatus = document.getElementById("weather-status");
const yearEl = document.getElementById("year");
const getWeatherBtn = document.getElementById("get-weather-btn");

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

// Demo articles with REAL images
const DEMO_ARTICLES = {
    general: [
        {
            title: "India's Tech Boom: How Startups are Changing the Nation",
            description: "A comprehensive look at how Indian startups are revolutionizing technology and creating jobs across the country.",
            image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=300&fit=crop",
            source: "Tech Daily India",
            publishedAt: "2026-07-07T10:30:00Z",
            url: "https://example.com/india-tech"
        },
        {
            title: "New Delhi Infrastructure Projects Complete",
            description: "Major infrastructure development in India's capital brings modern facilities to millions.",
            image: "https://images.unsplash.com/photo-1486718448742-163732cd3d3e?w=500&h=300&fit=crop",
            source: "News India",
            publishedAt: "2026-07-07T09:15:00Z",
            url: "https://example.com/delhi-infra"
        },
        {
            title: "Monsoon Season Brings Relief to Farmers",
            description: "Good rainfall patterns this season promise improved agricultural yields across multiple states.",
            image: "https://images.unsplash.com/photo-1500382017468-7049fad16d13?w=500&h=300&fit=crop",
            source: "Agriculture Times",
            publishedAt: "2026-07-06T14:45:00Z",
            url: "https://example.com/monsoon"
        }
    ],
    technology: [
        {
            title: "AI Revolution: New Machine Learning Breakthroughs",
            description: "Latest developments in artificial intelligence are changing how we work and communicate.",
            image: "https://images.unsplash.com/photo-1677442d019cecf8c91d2c0a7f85e4e73?w=500&h=300&fit=crop",
            source: "Tech News",
            publishedAt: "2026-07-07T11:20:00Z",
            url: "https://example.com/ai-breakthroughs"
        },
        {
            title: "5G Networks Expand Across India",
            description: "Telecom providers rollout 5G services in major cities, promising faster internet speeds.",
            image: "https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=500&h=300&fit=crop",
            source: "Telecom India",
            publishedAt: "2026-07-07T08:00:00Z",
            url: "https://example.com/5g-expansion"
        },
        {
            title: "Cloud Computing Adoption Soars",
            description: "Businesses migrate to cloud infrastructure for better scalability and cost efficiency.",
            image: "https://images.unsplash.com/photo-1560949127-d38ca80aee91?w=500&h=300&fit=crop",
            source: "Cloud Tech Daily",
            publishedAt: "2026-07-06T16:30:00Z",
            url: "https://example.com/cloud-adoption"
        }
    ],
    sports: [
        {
            title: "India Cricket Team Wins Against Pakistan",
            description: "An exciting match ends with India securing victory in the final over.",
            image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=500&h=300&fit=crop",
            source: "Sports Today",
            publishedAt: "2026-07-07T12:00:00Z",
            url: "https://example.com/cricket-match"
        },
        {
            title: "Olympics 2026: India's Medal Count Rises",
            description: "Indian athletes continue to perform exceptionally well at the international games.",
            image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=500&h=300&fit=crop",
            source: "Olympic News",
            publishedAt: "2026-07-07T06:45:00Z",
            url: "https://example.com/olympics"
        },
        {
            title: "Tennis Star Advances to Finals",
            description: "Indian tennis player reaches the finals of a major international tournament.",
            image: "https://images.unsplash.com/photo-1554224311-beee415c201f?w=500&h=300&fit=crop",
            source: "Tennis Weekly",
            publishedAt: "2026-07-06T13:20:00Z",
            url: "https://example.com/tennis"
        }
    ],
    business: [
        {
            title: "Stock Market Reaches New Heights",
            description: "Indian stock market indices close at record levels amid positive economic indicators.",
            image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=500&h=300&fit=crop",
            source: "Business India",
            publishedAt: "2026-07-07T15:30:00Z",
            url: "https://example.com/stock-market"
        },
        {
            title: "Foreign Investment Floods Indian Startups",
            description: "Record venture capital funding for Indian tech companies in Q2 2026.",
            image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=500&h=300&fit=crop",
            source: "Finance Times",
            publishedAt: "2026-07-07T10:00:00Z",
            url: "https://example.com/startup-funding"
        },
        {
            title: "Manufacturing Sector Grows by 8%",
            description: "Industrial production increases, signaling a robust economic recovery.",
            image: "https://images.unsplash.com/photo-1581092163562-40460efbc3f0?w=500&h=300&fit=crop",
            source: "Economic Review",
            publishedAt: "2026-07-06T12:15:00Z",
            url: "https://example.com/manufacturing"
        }
    ],
    entertainment: [
        {
            title: "Bollywood Blockbuster Breaks Box Office Records",
            description: "Latest Hindi film becomes the highest-grossing film of the year.",
            image: "https://images.unsplash.com/photo-1489599849228-ed5169a458c7?w=500&h=300&fit=crop",
            source: "Entertainment Hub",
            publishedAt: "2026-07-07T13:45:00Z",
            url: "https://example.com/bollywood"
        },
        {
            title: "Music Festival Announces Star-Studded Lineup",
            description: "Major Indian and international artists set to perform at India's biggest music festival.",
            image: "https://images.unsplash.com/photo-1516450360452-9bde79d56369?w=500&h=300&fit=crop",
            source: "Music Today",
            publishedAt: "2026-07-07T11:00:00Z",
            url: "https://example.com/music-festival"
        },
        {
            title: "Web Series Wins International Award",
            description: "Indian production receives recognition at prestigious international film festival.",
            image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=500&h=300&fit=crop",
            source: "Digital Entertainment",
            publishedAt: "2026-07-06T09:30:00Z",
            url: "https://example.com/webseries"
        }
    ],
    health: [
        {
            title: "New Vaccine Development Shows Promising Results",
            description: "Medical breakthrough could prevent major disease affecting millions worldwide.",
            image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=500&h=300&fit=crop",
            source: "Health News",
            publishedAt: "2026-07-07T14:20:00Z",
            url: "https://example.com/vaccine"
        },
        {
            title: "Mental Health Awareness Campaign Launches",
            description: "Government and NGOs team up for nationwide mental wellness initiative.",
            image: "https://images.unsplash.com/photo-1512821777015-e82aa1a66a47?w=500&h=300&fit=crop",
            source: "Wellness India",
            publishedAt: "2026-07-07T10:50:00Z",
            url: "https://example.com/mental-health"
        },
        {
            title: "Fitness Trends Reshape Gym Industry",
            description: "Latest health and fitness trends are transforming how Indians approach wellness.",
            image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&h=300&fit=crop",
            source: "Fitness Daily",
            publishedAt: "2026-07-06T15:10:00Z",
            url: "https://example.com/fitness"
        }
    ]
};

let currentCategory = categorySelect.value;

function formatDate(value) {
    if (!value) {
        return "Recently published";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return "Recently published";
    }

    return new Intl.DateTimeFormat("en", {
        month: "short",
        day: "numeric",
        year: "numeric"
    }).format(date);
}

function showNewsSkeletons() {
    newsGrid.innerHTML = Array.from({ length: 4 }, () => `
        <div class="skeleton-card">
            <div class="skeleton skeleton-image"></div>
            <div class="skeleton skeleton-line medium"></div>
            <div class="skeleton skeleton-line long"></div>
            <div class="skeleton skeleton-line short"></div>
        </div>
    `).join("");
    newsStatus.textContent = "Loading headlines";
}

function showNewsError(message) {
    newsGrid.innerHTML = `
        <div class="state-card error" role="alert">
            <strong>We hit a snag.</strong>
            <p>${message}</p>
        </div>
    `;
    newsStatus.textContent = "Unavailable";
}

function getImageFromArticle(article) {
    return article.image || article.urlToImage || "";
}

function renderNewsCards(articles) {
    if (!articles || articles.length === 0) {
        showNewsError("There are no articles for this category at the moment.");
        return;
    }

    const cards = articles
        .map((article) => {
            const image = getImageFromArticle(article);
            const source = article.source || "Breaking News";
            const published = formatDate(article.publishedAt || article.publishedDate);
            const description = article.description?.replace(/<[^>]+>/g, "").trim() || "Read the full story to learn more.";
            const imageMarkup = image
                ? `<img class="news-card-image" src="${image}" alt="${article.title}" loading="lazy">`
                : `<div class="news-image-fallback">No Image Available</div>`;

            return `
                <article class="news-card" role="listitem" tabindex="0" data-url="${article.url}">
                    ${imageMarkup}
                    <div class="news-card-content">
                        <div class="meta-row">
                            <span class="source-badge">${source}</span>
                            <span>${published}</span>
                        </div>
                        <h4>${article.title}</h4>
                        <p>${description}</p>
                        <button type="button" class="read-link" aria-label="Read full article about ${article.title}">Read full article</button>
                    </div>
                </article>
            `;
        })
        .join("");

    newsGrid.innerHTML = cards;
    newsStatus.textContent = `${currentCategory.charAt(0).toUpperCase()}${currentCategory.slice(1)}`;
}

async function getNewsArticles(category) {
    try {
        const apiKey = localStorage.getItem("newsApiKey") || "";
        const categoryMap = {
            general: "general",
            technology: "technology",
            sports: "sports",
            business: "business",
            entertainment: "entertainment",
            health: "health"
        };
        const topic = categoryMap[category] || "general";

        // If user has API key, use it
        if (apiKey) {
            try {
                const response = await fetch(
                    `https://gnews.io/api/v4/top-headlines?lang=en&country=in&max=10&topic=${topic}&apikey=${apiKey}`
                );

                if (response.ok) {
                    const data = await response.json();
                    if (!data.errors) {
                        console.log("Using GNews API with real data");
                        return (data.articles || []).slice(0, 8).map((article) => ({
                            title: article.title,
                            description: article.description,
                            image: article.image || article.urlToImage || "",
                            source: article.source?.name || "News",
                            publishedAt: article.publishedAt,
                            url: article.url
                        }));
                    }
                }
            } catch (error) {
                console.log("API key invalid, using demo articles");
            }
        }

        // Always fall back to demo articles
        console.log("Using demo articles with real images");
        return DEMO_ARTICLES[category] || DEMO_ARTICLES.general;
    } catch (error) {
        console.error("News error:", error);
        throw error;
    }
}

async function fetchNews(category = currentCategory) {
    currentCategory = category;
    showNewsSkeletons();

    try {
        const articles = await getNewsArticles(category);
        renderNewsCards(articles);
    } catch (error) {
        console.error(error);
        showNewsError("The news service is temporarily unavailable. Please try again shortly.");
    }
}

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
                ${Array.from({ length: 2 }, () => `
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

function getWeatherCondition(code) {
    return WEATHER_CODE_MAP[code] || { icon: "🌤️", label: "Weather update" };
}

function renderWeatherCard(weatherData, cityName) {
    const current = weatherData.current;
    const condition = getWeatherCondition(current.weather_code);
    const temp = Number(current.temperature_2m).toFixed(1);
    const humidity = current.relative_humidity_2m;
    const wind = current.wind_speed_10m;
    const updatedAt = new Date(current.time).toLocaleString([], {
        hour: "numeric",
        minute: "2-digit"
    });

    weatherInfo.innerHTML = `
        <div class="weather-main">
            <div class="weather-card">
                <div class="weather-hero">
                    <div>
                        <h4>${cityName}</h4>
                        <p class="location-sub">${condition.label}</p>
                        <div class="weather-temp">${temp}°C</div>
                        <div class="weather-condition">Humidity ${humidity}% • Wind ${wind} km/h</div>
                        <p class="weather-updated">Last updated ${updatedAt}</p>
                    </div>
                    <div class="weather-icon" aria-hidden="true">${condition.icon}</div>
                </div>
            </div>
            <div class="weather-grid">
                <div class="stat-card">
                    <span class="label">Temperature</span>
                    <span class="value">${temp}°C</span>
                </div>
                <div class="stat-card">
                    <span class="label">Humidity</span>
                    <span class="value">${humidity}%</span>
                </div>
                <div class="stat-card">
                    <span class="label">Wind</span>
                    <span class="value">${wind} km/h</span>
                </div>
                <div class="stat-card">
                    <span class="label">Condition</span>
                    <span class="value">${condition.label}</span>
                </div>
            </div>
        </div>
    `;
    weatherStatus.textContent = "Live";
}

async function getCityNameFromCoordinates(latitude, longitude) {
    try {
        const response = await fetch(`https://geocoding-api.open-meteo.com/v1/reverse?latitude=${latitude}&longitude=${longitude}&language=en&count=1&format=json`);
        if (!response.ok) {
            return "Current location";
        }

        const data = await response.json();
        const result = data.results?.[0];
        if (!result) {
            return "Current location";
        }

        return `${result.name}${result.country ? `, ${result.country}` : ""}`;
    } catch (error) {
        console.error(error);
        return "Current location";
    }
}

async function fetchWeather(city = locationInput.value.trim(), coords = null) {
    if (!city && !coords) {
        showWeatherError("Enter a city name to inspect the forecast.");
        return;
    }

    showWeatherLoading();

    try {
        let lat;
        let lon;
        let cityName = city;

        if (coords) {
            lat = coords.latitude;
            lon = coords.longitude;
            cityName = coords.cityName || (await getCityNameFromCoordinates(lat, lon));
        } else {
            const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
            if (!geoResponse.ok) {
                throw new Error("Geocoding request failed");
            }

            const geoData = await geoResponse.json();
            if (!geoData.results || geoData.results.length === 0) {
                showWeatherError(`We could not find "${city}". Please try another city.`);
                return;
            }

            const result = geoData.results[0];
            lat = result.latitude;
            lon = result.longitude;
            cityName = `${result.name}${result.country ? `, ${result.country}` : ""}`;
        }

        const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=auto`);
        if (!weatherResponse.ok) {
            throw new Error("Weather request failed");
        }

        const weatherData = await weatherResponse.json();
        renderWeatherCard(weatherData, cityName);
    } catch (error) {
        console.error(error);
        showWeatherError("Unable to retrieve weather data. Please try a different city.");
    }
}

function requestLocation() {
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
        () => {
            fetchWeather(locationInput.value.trim() || "Delhi");
        },
        { timeout: 8000 }
    );
}

// Event listeners
newsGrid.addEventListener("click", (event) => {
    const card = event.target.closest(".news-card");
    if (card) {
        const url = card.getAttribute("data-url");
        if (url) {
            window.open(url, "_blank", "noopener");
        }
    }
});

newsGrid.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
        const card = event.target.closest(".news-card");
        if (card) {
            const url = card.getAttribute("data-url");
            if (url) {
                window.open(url, "_blank", "noopener");
            }
        }
    }
});

categorySelect.addEventListener("change", (event) => {
    fetchNews(event.target.value);
});

getWeatherBtn.addEventListener("click", () => {
    fetchWeather();
});

locationInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        fetchWeather();
    }
});

// Initialize
yearEl.textContent = new Date().getFullYear();
fetchNews(currentCategory);
requestLocation();
