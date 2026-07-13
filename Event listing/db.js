const defaultEvents = [
  { id: 1, title: "Tech Summit 2026", description: "Discover latest web trends.", category: "Technology", date: "2026-07-25", time: "10:00 AM", location: "Auditorium, Block A", image: "assets/techmeetup.jpeg", maxAttendees: 200, attendees: 120 },
  { id: 2, title: "AI & ML Workshop", description: "Hands-on machine learning.", category: "Workshop", date: "2026-08-28", time: "02:00 PM", location: "Online (Zoom)", image: "assets/workshop.jpeg", maxAttendees: 150, attendees: 80 }
];

const defaultUsers = [
  { email: "user@connect.com", password: "password", role: "user", name: "John Doe", college: "State College" },
  { email: "admin@connect.com", password: "password", role: "admin", name: "Admin Organizer" }
];

if (!localStorage.getItem("events")) localStorage.setItem("events", JSON.stringify(defaultEvents));
if (!localStorage.getItem("users")) localStorage.setItem("users", JSON.stringify(defaultUsers));
if (!localStorage.getItem("registrations")) localStorage.setItem("registrations", JSON.stringify([]));

async function dbOp(mode, op, value, key = "directoryHandle") {
  const db = await new Promise((res, rej) => {
    const req = indexedDB.open("WorkspaceDB", 1);
    req.onupgradeneeded = e => { if (!e.target.result.objectStoreNames.contains("store")) e.target.result.createObjectStore("store"); };
    req.onsuccess = e => res(e.target.result);
    req.onerror = e => rej(e.target.error);
  });
  return new Promise((res, rej) => {
    const store = db.transaction("store", mode).objectStore("store");
    const req = op === "get" ? store.get(key) : store.put(value, key);
    req.onsuccess = () => res(req.result);
    req.onerror = () => rej(req.error);
  });
}

const getSavedDirectoryHandle = () => dbOp("readonly", "get", null);
const saveDirectoryHandle = handle => dbOp("readwrite", "put", handle);

async function syncWithConnectedWorkspace() {
  try {
    const dirHandle = await getSavedDirectoryHandle();
    if (!dirHandle || await dirHandle.queryPermission({ mode: "readwrite" }) !== "granted") return false;
    const fileHandle = await dirHandle.getFileHandle("events.json", { create: false });
    const file = await fileHandle.getFile();
    const events = JSON.parse(await file.text());
    if (Array.isArray(events)) {
      localStorage.setItem("events", JSON.stringify(events));
      window.dispatchEvent(new CustomEvent("events-synced"));
      return true;
    }
  } catch (e) { console.error("Workspace sync error:", e); }
  return false;
}

async function loadEventsFromJSON() {
  try {
    const res = await fetch("events.json");
    if (res.ok) {
      const events = await res.json();
      if (Array.isArray(events) && events.length) {
        localStorage.setItem("events", JSON.stringify(events));
        window.dispatchEvent(new CustomEvent("events-synced"));
      }
    }
  } catch (e) { console.warn("Fetch events.json fallback to localStorage", e); }
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
  try {
    const dirHandle = await getSavedDirectoryHandle();
    if (dirHandle && await dirHandle.queryPermission({ mode: "readwrite" }) === "granted") {
      const fileHandle = await dirHandle.getFileHandle("events.json", { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(JSON.stringify(events, null, 2));
      await writable.close();
      showToast("Workspace events.json updated automatically!", "success");
      return;
    }
  } catch (e) { console.error("Failed to write to events.json:", e); }
  showToast("Saved to browser storage! Connect workspace to auto-sync events.json.", "info");
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

async function initWorkspaceSync() {
  const widget = document.createElement("div");
  widget.className = "workspace-widget";
  widget.innerHTML = `
    <div class="workspace-btn" id="workspaceBtn" title="Sync Local JSON File">
      <i class="fa-solid fa-folder-open"></i>
      <div class="workspace-status-dot" id="workspaceStatusDot"></div>
    </div>
    <div class="workspace-panel" id="workspacePanel">
      <h4><i class="fa-solid fa-rotate"></i> Workspace Sync</h4>
      <p id="workspaceInfo">Connect project local directory to auto-sync events.json.</p>
      <button class="workspace-panel-btn workspace-panel-btn-primary" id="workspaceActionBtn"><i class="fa-solid fa-link"></i> Connect Folder</button>
      <button class="workspace-panel-btn workspace-panel-btn-secondary" id="workspaceManualBtn" style="display:none;"><i class="fa-solid fa-download"></i> Download events.json</button>
    </div>`;
  document.body.appendChild(widget);

  const btn = document.getElementById("workspaceBtn"), panel = document.getElementById("workspacePanel");
  const statusDot = document.getElementById("workspaceStatusDot"), info = document.getElementById("workspaceInfo");
  const actionBtn = document.getElementById("workspaceActionBtn"), manualBtn = document.getElementById("workspaceManualBtn");

  btn.addEventListener("click", e => { e.stopPropagation(); panel.style.display = panel.style.display === "flex" ? "none" : "flex"; });
  document.addEventListener("click", e => { if (!widget.contains(e.target)) panel.style.display = "none"; });

  async function updateStatusUI() {
    const handle = await getSavedDirectoryHandle();
    if (!handle) {
      statusDot.className = "workspace-status-dot";
      info.innerHTML = "Connect your project's local directory to enable automatic <b>events.json</b> saving and real-time synchronization.";
      actionBtn.innerHTML = '<i class="fa-solid fa-link"></i> Connect Folder';
      manualBtn.style.display = "none";
      return;
    }
    try {
      if (await handle.queryPermission({ mode: "readwrite" }) === "granted") {
        statusDot.className = "workspace-status-dot connected";
        info.innerHTML = `Connected to: <b>${handle.name}</b><br>✓ events.json auto-sync enabled.`;
        actionBtn.innerHTML = '<i class="fa-solid fa-unlink"></i> Disconnect Folder';
        manualBtn.style.display = "none";
      } else {
        statusDot.className = "workspace-status-dot pending";
        info.innerHTML = `Connected to: <b>${handle.name}</b><br>⚠️ Awaiting folder permission.`;
        actionBtn.innerHTML = '<i class="fa-solid fa-key"></i> Grant Permission';
        manualBtn.style.display = "flex";
      }
    } catch (e) {
      statusDot.className = "workspace-status-dot error";
      info.innerHTML = "Error verifying folder permission.";
      actionBtn.innerHTML = '<i class="fa-solid fa-link"></i> Connect Folder';
      manualBtn.style.display = "flex";
    }
  }

  actionBtn.addEventListener("click", async () => {
    const handle = await getSavedDirectoryHandle();
    if (!handle) {
      try {
        const newHandle = await window.showDirectoryPicker();
        await saveDirectoryHandle(newHandle);
        if (await newHandle.requestPermission({ mode: "readwrite" }) === "granted") {
          showToast("Workspace folder connected successfully!", "success");
          if (await syncWithConnectedWorkspace()) {
            showToast("Loaded events from workspace events.json!", "success");
            if (typeof renderHomeEvents === "function") renderHomeEvents();
            if (typeof renderAdminTable === "function") renderAdminTable();
          }
        }
      } catch (e) { showToast("Failed to connect workspace folder.", "error"); }
    } else if (await handle.queryPermission({ mode: "readwrite" }) !== "granted") {
      try {
        if (await handle.requestPermission({ mode: "readwrite" }) === "granted") {
          showToast("Workspace permission granted!", "success");
          if (await syncWithConnectedWorkspace()) {
            if (typeof renderHomeEvents === "function") renderHomeEvents();
            if (typeof renderAdminTable === "function") renderAdminTable();
          }
        }
      } catch (e) { showToast("Failed to obtain workspace permission.", "error"); }
    } else {
      if (confirm("Disconnect workspace folder? Automatic events.json saves will stop.")) {
        await saveDirectoryHandle(null);
        showToast("Workspace folder disconnected.", "info");
      }
    }
    updateStatusUI();
  });

  manualBtn.addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(getEvents(), null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "events.json";
    a.click();
    showToast("Downloaded events.json.", "success");
  });

  updateStatusUI();
}

async function initDatabase() {
  if (!await syncWithConnectedWorkspace()) await loadEventsFromJSON();
}

initDatabase();
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initWorkspaceSync);
else initWorkspaceSync();
