const newsGrid = document.getElementById("news-grid");
const countrySelect = document.getElementById("country-select");
const categorySelect = document.getElementById("category-select");
const newsStatus = document.getElementById("news-status");
const yearEl = document.getElementById("year");

const apiKeyInput = document.getElementById("api-key-input");
const saveKeyBtn = document.getElementById("save-key-btn");
const clearKeyBtn = document.getElementById("clear-key-btn");
const keyStatus = document.getElementById("key-status");

// Demo articles with high-resolution Unsplash images
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

// Handle API Key Management
function getApiKey() {
    return localStorage.getItem("newsApiKey") || "";
}

function updateKeyStatusUI() {
    const key = getApiKey();
    if (key) {
        keyStatus.textContent = "Key Set (Using NewsAPI)";
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
        localStorage.setItem("newsApiKey", key);
        updateKeyStatusUI();
        fetchNews();
    }
});

clearKeyBtn.addEventListener("click", () => {
    localStorage.removeItem("newsApiKey");
    updateKeyStatusUI();
    fetchNews();
});

// UI formatting & loading
function formatDate(value) {
    if (!value) return "Recently published";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Recently published";
    return new Intl.DateTimeFormat("en", {
        month: "short",
        day: "numeric",
        year: "numeric"
    }).format(date);
}

function showNewsSkeletons() {
    newsGrid.innerHTML = Array.from({ length: 6 }, () => `
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
            <strong>Unable to load stories.</strong>
            <p>${message}</p>
        </div>
    `;
    newsStatus.textContent = "Unavailable";
}

// Render Articles
function renderNewsCards(articles) {
    if (!articles || articles.length === 0) {
        showNewsError("No articles found for this selection.");
        return;
    }

    newsGrid.innerHTML = articles
        .map((article) => {
            const image = article.image || article.urlToImage || "";
            const source = article.source || article.sourceName || "Global News";
            const published = formatDate(article.publishedAt);
            const description = article.description?.replace(/<[^>]+>/g, "").trim() || "Read the full article to discover the complete coverage.";
            const title = article.title;
            const fallbackImage = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MDAiIGhlaWdodD0iMzAwIiB2aWV3Qm94PSIwIDAgNTAwIDMwMCI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iIzFlMjkzYiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ic3lzdGVtLXVpLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTRhM2I4IiBmb250LXdlaWdodD0iNjAwIj5Ob3J0aHN0YXIgSW50ZWxsaWdlbmNlPC90ZXh0Pjwvc3ZnPg==`;
            const imageMarkup = image
                ? `<img class="news-card-image" src="${image}" alt="${title}" loading="lazy" onerror="this.onerror=null; this.src='${fallbackImage}';">`
                : `<div class="news-image-fallback">No Image Available</div>`;

            return `
                <article class="news-card" role="listitem" tabindex="0" data-url="${article.url}">
                    ${imageMarkup}
                    <div class="news-card-content">
                        <div class="meta-row">
                            <span class="source-badge">${source}</span>
                            <span>${published}</span>
                        </div>
                        <h4 style="font-weight: 700; margin: 0 0 6px;">${title}</h4>
                        <p style="font-size: 0.92rem; color: #cbd5e1; line-height: 1.6;">${description}</p>
                        <button type="button" class="read-link" aria-label="Read full article about ${title}">Read full article</button>
                    </div>
                </article>
            `;
        })
        .join("");

    const category = categorySelect.value;
    const country = countrySelect.options[countrySelect.selectedIndex].text.split(" ")[1];
    newsStatus.textContent = `${category.charAt(0).toUpperCase()}${category.slice(1)} (${country})`;
}

// Fetch via NewsAPI
async function fetchNewsAPI(category, country, apiKey) {
    // NewsAPI category mappings match standard selections
    const response = await fetch(`https://newsapi.org/v2/top-headlines?country=${country}&category=${category}&apiKey=${apiKey}`);
    if (!response.ok) {
        throw new Error("NewsAPI rejected credentials or request format");
    }
    const data = await response.json();
    if (data.status !== "ok") {
        throw new Error(data.message || "NewsAPI error");
    }
    return (data.articles || []).map((art) => ({
        title: art.title,
        description: art.description || art.content,
        image: art.urlToImage,
        source: art.source?.name || "NewsAPI",
        publishedAt: art.publishedAt,
        url: art.url
    }));
}

// Fetch via GNews API (Second fallback)
async function fetchGNewsFallback(category, country, apiKey) {
    const topicMap = {
        general: "general",
        technology: "technology",
        sports: "sports",
        business: "business",
        entertainment: "entertainment",
        health: "health"
    };
    const topic = topicMap[category] || "general";
    const res = await fetch(`https://gnews.io/api/v4/top-headlines?lang=en&country=${country}&max=10&topic=${topic}&apikey=${apiKey}`);
    if (!res.ok) {
        throw new Error("GNews API request failed");
    }
    const data = await res.json();
    return (data.articles || []).map((art) => ({
        title: art.title,
        description: art.description,
        image: art.image,
        source: art.source?.name || "GNews",
        publishedAt: art.publishedAt,
        url: art.url
    }));
}

// Fetch Controller
async function fetchNews() {
    const category = categorySelect.value;
    const country = countrySelect.value;
    const key = getApiKey();

    showNewsSkeletons();

    try {
        if (key) {
            try {
                // Try NewsAPI first
                console.log("Fetching NewsAPI with key...");
                const articles = await fetchNewsAPI(category, country, key);
                renderNewsCards(articles);
                return;
            } catch (err) {
                console.warn("NewsAPI failed (likely CORS or Key issue), trying GNews fallback...", err);
                try {
                    // Try GNews with the same key (in case it's a GNews key)
                    const articles = await fetchGNewsFallback(category, country, key);
                    renderNewsCards(articles);
                    return;
                } catch (gerr) {
                    console.warn("GNews fallback failed too, using demo data.");
                }
            }
        }
        
        // Final fallback: local high-quality mock data
        console.log("Using local premium demo articles...");
        setTimeout(() => {
            renderNewsCards(DEMO_ARTICLES[category] || DEMO_ARTICLES.general);
        }, 400);
    } catch (err) {
        console.error("News flow error:", err);
        showNewsError("An error occurred while building your news feed. Please try again.");
    }
}

// Browser location locale country detection
function detectUserCountry() {
    try {
        const lang = navigator.language || navigator.userLanguage || "";
        const countryCode = lang.split("-")[1]?.toLowerCase() || "";
        const supported = ["in", "us", "gb", "ca", "au", "sg"];
        if (supported.includes(countryCode)) {
            countrySelect.value = countryCode;
        } else {
            countrySelect.value = "in"; // default
        }
    } catch (e) {
        countrySelect.value = "in";
    }
}

// Click to open link
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

categorySelect.addEventListener("change", fetchNews);
countrySelect.addEventListener("change", fetchNews);

// Init
yearEl.textContent = new Date().getFullYear();
detectUserCountry();
updateKeyStatusUI();
fetchNews();
