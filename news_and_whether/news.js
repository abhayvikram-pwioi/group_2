const newsGrid = document.getElementById("news-grid");
const countrySelect = document.getElementById("country-select");
const categorySelect = document.getElementById("category-select");
const newsStatus = document.getElementById("news-status");
const yearEl = document.getElementById("year");

const DEMO_ARTICLES = {
    general: [
        { title: "India's Tech Boom: How Startups are Changing the Nation", description: "A comprehensive look at how Indian startups are revolutionizing technology and creating jobs.", image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=300&fit=crop", source: "Tech Daily India", publishedAt: "2026-07-07T10:30:00Z", url: "https://example.com/india-tech" },
        { title: "New Delhi Infrastructure Projects Complete", description: "Major infrastructure development in India's capital brings modern facilities to millions.", image: "https://images.unsplash.com/photo-1486718448742-163732cd3d3e?w=500&h=300&fit=crop", source: "News India", publishedAt: "2026-07-07T09:15:00Z", url: "https://example.com/delhi-infra" },
        { title: "Monsoon Season Brings Relief to Farmers", description: "Good rainfall patterns this season promise improved agricultural yields.", image: "https://images.unsplash.com/photo-1500382017468-7049fad16d13?w=500&h=300&fit=crop", source: "Agriculture Times", publishedAt: "2026-07-06T14:45:00Z", url: "https://example.com/monsoon" }
    ],
    technology: [
        { title: "AI Revolution: New Machine Learning Breakthroughs", description: "Latest developments in artificial intelligence are changing how we work.", image: "https://images.unsplash.com/photo-1677442d019cecf8c91d2c0a7f85e4e73?w=500&h=300&fit=crop", source: "Tech News", publishedAt: "2026-07-07T11:20:00Z", url: "https://example.com/ai" },
        { title: "5G Networks Expand Across India", description: "Telecom providers rollout 5G services in major cities, promising faster speeds.", image: "https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=500&h=300&fit=crop", source: "Telecom India", publishedAt: "2026-07-07T08:00:00Z", url: "https://example.com/5g" },
        { title: "Cloud Computing Adoption Soars", description: "Businesses migrate to cloud infrastructure for better scalability.", image: "https://images.unsplash.com/photo-1560949127-d38ca80aee91?w=500&h=300&fit=crop", source: "Cloud Tech Daily", publishedAt: "2026-07-06T16:30:00Z", url: "https://example.com/cloud" }
    ],
    sports: [
        { title: "India Cricket Team Wins Against Pakistan", description: "An exciting match ends with India securing victory in the final over.", image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=500&h=300&fit=crop", source: "Sports Today", publishedAt: "2026-07-07T12:00:00Z", url: "https://example.com/cricket" },
        { title: "Olympics 2026: India's Medal Count Rises", description: "Indian athletes continue to perform exceptionally well at the international games.", image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=500&h=300&fit=crop", source: "Olympic News", publishedAt: "2026-07-07T06:45:00Z", url: "https://example.com/olympics" }
    ],
    business: [
        { title: "Stock Market Reaches New Heights", description: "Indian stock market indices close at record levels.", image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=500&h=300&fit=crop", source: "Business India", publishedAt: "2026-07-07T15:30:00Z", url: "https://example.com/stocks" },
        { title: "Foreign Investment Floods Indian Startups", description: "Record venture capital funding for Indian tech companies in Q2 2026.", image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=500&h=300&fit=crop", source: "Finance Times", publishedAt: "2026-07-07T10:00:00Z", url: "https://example.com/startups" }
    ],
    entertainment: [
        { title: "Bollywood Blockbuster Breaks Box Office Records", description: "Latest Hindi film becomes the highest-grossing film of the year.", image: "https://images.unsplash.com/photo-1489599849228-ed5169a458c7?w=500&h=300&fit=crop", source: "Entertainment Hub", publishedAt: "2026-07-07T13:45:00Z", url: "https://example.com/bollywood" }
    ],
    health: [
        { title: "New Vaccine Development Shows Promising Results", description: "Medical breakthrough could prevent major disease affecting millions.", image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=500&h=300&fit=crop", source: "Health News", publishedAt: "2026-07-07T14:20:00Z", url: "https://example.com/vaccine" }
    ]
};

const getK = () => localStorage.getItem("newsApiKey") || "";

const formatDate = (v) => v ? new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(v)) : "Recently published";

const showSkeletons = () => {
    newsGrid.innerHTML = Array(6).fill('<div class="skeleton-card"><div class="skeleton skeleton-image"></div><div class="skeleton skeleton-line medium"></div><div class="skeleton skeleton-line long"></div><div class="skeleton skeleton-line short"></div></div>').join("");
    newsStatus.textContent = "Loading headlines";
};

const showErr = (msg) => {
    newsGrid.innerHTML = `<div class="state-card error"><strong>Unable to load stories.</strong><p>${msg}</p></div>`;
    newsStatus.textContent = "Unavailable";
};

function renderCards(arts) {
    if (!arts || arts.length === 0) return showErr("No articles found for this selection.");
    const fbImg = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MDAiIGhlaWdodD0iMzAwIiB2aWV3Qm94PSIwIDAgNTAwIDMwMCI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iIzFlMjkzYiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ic3lzdGVtLXVpLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTRhM2I4IiBmb250LXdlaWdodD0iNjAwIj5Ob3J0aHN0YXIgSW50ZWxsaWdlbmNlPC90ZXh0Pjwvc3ZnPg==`;
    newsGrid.innerHTML = arts.map(art => {
        const img = art.image || art.urlToImage || "";
        const src = art.source || art.sourceName || "Global News";
        const desc = art.description?.replace(/<[^>]+>/g, "").trim() || "Read the full article to discover the complete coverage.";
        return `<article class="news-card" role="listitem" tabindex="0" data-url="${art.url}">${img ? `<img class="news-card-image" src="${img}" alt="${art.title}" loading="lazy" onerror="this.onerror=null;this.src='${fbImg}';">` : `<div class="news-image-fallback">No Image Available</div>`}<div class="news-card-content"><div class="meta-row"><span class="source-badge">${src}</span><span>${formatDate(art.publishedAt)}</span></div><h4 style="font-weight:700;margin:0 0 6px;">${art.title}</h4><p style="font-size:0.92rem;color:#cbd5e1;line-height:1.6;">${desc}</p><button type="button" class="read-link">Read full article</button></div></article>`;
    }).join("");
    newsStatus.textContent = `${categorySelect.value.charAt(0).toUpperCase()}${categorySelect.value.slice(1)} (${countrySelect.options[countrySelect.selectedIndex].text.split(" ")[1]})`;
}

async function fetchNewsAPI(cat, ctry, key) {
    const r = await fetch(`https://newsapi.org/v2/top-headlines?country=${ctry}&category=${cat}&apiKey=${key}`);
    if (!r.ok) throw new Error("NewsAPI error");
    const d = await r.json();
    return (d.articles || []).map(a => ({ title: a.title, description: a.description || a.content, image: a.urlToImage, source: a.source?.name, publishedAt: a.publishedAt, url: a.url }));
}

async function fetchGNews(cat, ctry, key) {
    const r = await fetch(`https://gnews.io/api/v4/top-headlines?lang=en&country=${ctry}&max=10&topic=${cat}&apikey=${key}`);
    if (!r.ok) throw new Error("GNews error");
    const d = await r.json();
    return (d.articles || []).map(a => ({ title: a.title, description: a.description, image: a.image, source: a.source?.name, publishedAt: a.publishedAt, url: a.url }));
}

async function fetchNews() {
    const cat = categorySelect.value, ctry = countrySelect.value, key = getK();
    showSkeletons();
    if (key) {
        try {
            return renderCards(await fetchNewsAPI(cat, ctry, key));
        } catch (e) {
            try {
                return renderCards(await fetchGNews(cat, ctry, key));
            } catch (ge) { console.warn("Fallbacks active."); }
        }
    }
    setTimeout(() => renderCards(DEMO_ARTICLES[cat] || DEMO_ARTICLES.general), 400);
}

function detectUserCountry() {
    try {
        const lang = navigator.language || "";
        const code = lang.split("-")[1]?.toLowerCase() || "";
        countrySelect.value = ["in","us","gb","ca","au","sg"].includes(code) ? code : "in";
    } catch (e) { countrySelect.value = "in"; }
}

const openUrl = (e) => {
    const card = e.target.closest(".news-card");
    if (card?.dataset.url) window.open(card.dataset.url, "_blank", "noopener");
};

newsGrid.onclick = openUrl;
newsGrid.onkeydown = (e) => { if (e.key === "Enter" || e.key === " ") openUrl(e); };
categorySelect.onchange = fetchNews;
countrySelect.onchange = fetchNews;

yearEl.textContent = new Date().getFullYear();
detectUserCountry();
fetchNews();
