const defaultEvents = [
  { id: 1, title: "Tech Summit 2026", description: "Discover latest web trends.", category: "Technology", date: "2026-07-25", time: "10:00 AM", location: "Auditorium, Block A", image: "assets/techmeetup.jpeg", maxAttendees: 200, attendees: 120 },
  { id: 2, title: "AI & ML Workshop", description: "Hands-on machine learning.", category: "Workshop", date: "2026-08-28", time: "02:00 PM", location: "Online (Zoom)", image: "assets/workshop.jpeg", maxAttendees: 150, attendees: 80 }
];

const defaultUsers = [
  { email: "user@connect.com", password: "password", role: "user", name: "John Doe", college: "State College" },
  { email: "admin@connect.com", password: "password", role: "admin", name: "Admin Organizer" }
];
if (!localStorage.getItem("users")) localStorage.setItem("users", JSON.stringify(defaultUsers));
if (!localStorage.getItem("registrations")) localStorage.setItem("registrations", JSON.stringify([]));

async function initDatabase() {
  if (!localStorage.getItem("events")) {
    try {
      const res = await fetch("events.json");
      if (res.ok) {
        const events = await res.json();
        if (Array.isArray(events) && events.length) {
          localStorage.setItem("events", JSON.stringify(events));
          window.dispatchEvent(new CustomEvent("events-synced"));
          return;
        }
      }
    } catch (e) { console.warn("Fetch events.json fallback to defaultEvents", e); }
    localStorage.setItem("events", JSON.stringify(defaultEvents));
  }
}

const getEvents = () => JSON.parse(localStorage.getItem("events")) || [];
const getUsers = () => JSON.parse(localStorage.getItem("users")) || [];
const getRegistrations = () => JSON.parse(localStorage.getItem("registrations")) || [];
const saveUsers = users => localStorage.setItem("users", JSON.stringify(users));
const saveRegistrations = regs => localStorage.setItem("registrations", JSON.stringify(regs));
const getCurrentUser = () => JSON.parse(localStorage.getItem("currentUser")) || null;
const setCurrentUser = user => user ? localStorage.setItem("currentUser", JSON.stringify(user)) : localStorage.removeItem("currentUser");

async function saveEvents(events) {
  localStorage.setItem("events", JSON.stringify(events));
  if (typeof renderHomeEvents === "function") renderHomeEvents();
  if (typeof renderAdminTable === "function") renderAdminTable();
  showToast("Saved successfully!", "success");
}

function showToast(message, type = "success") {
  let container = document.getElementById("toastContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "toastContainer";
    container.className = "toast-container";
    document.body.appendChild(container);
  }
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  const icon = type === "error" ? "fa-circle-xmark" : type === "info" ? "fa-circle-info" : "fa-circle-check";
  toast.innerHTML = `<i class="fa-solid ${icon}"></i><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => toast.classList.add("show"), 10);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

function getCategoryPlaceholder(category) {
  const placeholders = { technology: "assets/techmeetup.jpeg", workshop: "assets/workshop.jpeg", music: "assets/music.jpeg", sports: "assets/footbal.jpeg" };
  return placeholders[category?.toLowerCase()] || "assets/workshop.jpeg";
}

function initChatbot() {
  const btn = document.getElementById("chatbotBtn"), chatbot = document.getElementById("chatbot");
  const close = document.getElementById("closeChat"), send = document.getElementById("sendBtn");
  const input = document.getElementById("userInput"), body = document.getElementById("chatBody");
  if (!btn || !chatbot || !body) return;

  btn.addEventListener("click", () => { chatbot.style.display = "flex"; body.scrollTop = body.scrollHeight; });
  if (close) close.addEventListener("click", () => chatbot.style.display = "none");

  const getFormattedTime = () => {
    const now = new Date();
    const hours = now.getHours(), mins = now.getMinutes();
    return `${hours % 12 || 12}:${mins < 10 ? "0" + mins : mins} ${hours >= 12 ? "PM" : "AM"}`;
  };

  const addChatMessage = (msg, sender) => {
    const div = document.createElement("div");
    div.className = sender === "user" ? "user-msg" : "bot-msg";
    div.innerHTML = `<div>${msg}</div><span class="msg-time">${getFormattedTime()}</span>`;
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
  };

  let chips = chatbot.querySelector(".chat-chips");
  if (!chips) {
    chips = document.createElement("div");
    chips.className = "chat-chips";
    chips.innerHTML = `
      <div class="chat-chip" data-query="Show me tech events">💻 Tech</div>
      <div class="chat-chip" data-query="Any workshops this weekend?">🛠 Workshops</div>
      <div class="chat-chip" data-query="Music events available?">🎵 Music</div>
      <div class="chat-chip" data-query="List all events">📅 All Events</div>`;
    chatbot.insertBefore(chips, chatbot.querySelector(".chat-input"));
  }
  chips.querySelectorAll(".chat-chip").forEach(c => {
    c.addEventListener("click", () => { input.value = c.getAttribute("data-query"); sendChatMessage(); });
  });

  function sendChatMessage() {
    const msg = input.value.trim();
    if (!msg) return;
    addChatMessage(msg, "user");
    input.value = "";

    const typing = document.createElement("div");
    typing.className = "bot-msg";
    typing.id = "chat-typing";
    typing.innerHTML = "✍️ Typing...";
    body.appendChild(typing);
    body.scrollTop = body.scrollHeight;

    setTimeout(() => {
      document.getElementById("chat-typing")?.remove();
      const query = msg.toLowerCase(), events = getEvents();
      let res = "";

      const categories = ["technology", "workshop", "music", "sports"];
      const matched = categories.find(cat => query.includes(cat) || (cat === "technology" && query.includes("tech")) || (cat === "sports" && query.includes("sport")));

      if (matched) {
        const matches = events.filter(e => e.category.toLowerCase() === matched);
        if (!matches.length) res = `❌ No ${matched} events found.`;
        else {
          const icons = { technology: "💻", workshop: "🛠", music: "🎵", sports: "⚽" };
          res = `${icons[matched]} <b>${matched.charAt(0).toUpperCase() + matched.slice(1)} Events:</b><br><br>` +
            matches.map(e => `• <b>${e.title}</b><br>📅 ${formatDate(e.date)} at ${e.time || "10:00 AM"}<br>📍 ${e.location}<br><br>`).join("");
        }
      } else if (query.includes("weekend")) {
        const wk = events.filter(e => [0, 6].includes(new Date(e.date).getDay()));
        res = !wk.length ? "📅 No weekend events found." : "✨ <b>Upcoming Weekend:</b><br><br>" +
          wk.map(e => `• <b>${e.title}</b> (${e.category})<br>📅 ${formatDate(e.date)} at ${e.time || "10:00 AM"}<br>📍 ${e.location}<br><br>`).join("");
      } else if (query.includes("list") || query.includes("all") || query.includes("event")) {
        res = "📅 <b>All Events:</b><br><br>" + events.map(e => `• <b>${e.title}</b> (${e.category}) - ${formatDate(e.date)}<br>`).join("");
      } else if (query.includes("hello") || query.includes("hi") || query.includes("hey")) {
        res = "👋 Hello there! How can I help you find events or plan your schedule today?";
      } else if (query.includes("help")) {
        res = "🎯 Ask me about 'tech events', 'workshops', 'music', 'weekend activities', or 'list events'.";
      } else {
        res = "🤔 I didn't quite catch that. Try asking to list events or show tech events!";
      }
      addChatMessage(res, "bot");
    }, 800);
  }

  if (send) send.addEventListener("click", sendChatMessage);
  if (input) input.addEventListener("keypress", e => { if (e.key === "Enter") sendChatMessage(); });
}

initDatabase();

window.addEventListener("storage", e => {
  if (e.key === "events") {
    window.dispatchEvent(new CustomEvent("events-synced"));
  }
});
