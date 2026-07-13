// Default data for the application
const defaultEvents = [
  {
    id: 1,
    title: "Tech Summit 2026",
    description: "Discover the latest trends in web development, cloud computing, and artificial intelligence from industry leaders. This summit includes interactive workshops and networking sessions.",
    category: "Technology",
    date: "2026-07-25",
    time: "10:00 AM",
    location: "Auditorium, Block A",
    image: "assets/techmeetup.jpeg",
    maxAttendees: 200,
    attendees: 120
  },
  {
    id: 2,
    title: "AI & ML Workshop",
    description: "A hands-on workshop focused on building and training machine learning models using popular open-source libraries. Perfect for beginners and intermediate developers.",
    category: "Workshop",
    date: "2026-08-28",
    time: "02:00 PM",
    location: "Online (Zoom)",
    image: "assets/workshop.jpeg",
    maxAttendees: 150,
    attendees: 80
  },
  {
    id: 3,
    title: "Music Fiesta",
    description: "An evening filled with acoustic performances, indie bands, and electronic music. Come join us for a celebration of music and culture.",
    category: "Music",
    date: "2026-07-27",
    time: "06:00 PM",
    location: "Mumbai, India",
    image: "assets/music.jpeg",
    maxAttendees: 500,
    attendees: 250
  },
  {
    id: 4,
    title: "Football Championship",
    description: "The annual inter-college soccer championship. Cheer for your favorite team as they battle it out for the trophy.",
    category: "Sports",
    date: "2026-08-05",
    time: "09:00 AM",
    location: "Delhi, India",
    image: "assets/footbal.jpeg",
    maxAttendees: 100,
    attendees: 60
  }
];

const defaultUsers = [
  {
    email: "user@connect.com",
    password: "password",
    role: "user",
    name: "John Doe",
    phone: "9876543210",
    college: "State College"
  },
  {
    email: "admin@connect.com",
    password: "password",
    role: "admin",
    name: "Admin Organizer",
    org: "Connect Events Inc.",
    phone: "9876543211",
    designation: "Event Coordinator"
  }
];

// Initialize localStorage
if (!localStorage.getItem("events")) {
  localStorage.setItem("events", JSON.stringify(defaultEvents));
} else {
  // Migrate existing events paths to assets/
  let events = JSON.parse(localStorage.getItem("events"));
  if (events) {
    let migrated = false;
    for (let i = 0; i < events.length; i++) {
      let ev = events[i];
      if (ev.image && ev.image.indexOf("assets/") !== 0 && ev.image.indexOf("data:") !== 0 && ev.image.indexOf("http") !== 0) {
        ev.image = "assets/" + ev.image;
        migrated = true;
      }
    }
    if (migrated) {
      localStorage.setItem("events", JSON.stringify(events));
    }
  }
}
if (!localStorage.getItem("users")) {
  localStorage.setItem("users", JSON.stringify(defaultUsers));
}
if (!localStorage.getItem("registrations")) {
  localStorage.setItem("registrations", JSON.stringify([]));
}

// Simple IndexedDB helper to persist DirectoryHandle
const DB_NAME = "EventHubWorkspaceDB";
const STORE_NAME = "workspaceStore";
const KEY_NAME = "directoryHandle";

function getDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);
  });
}

async function getSavedDirectoryHandle() {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(KEY_NAME);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    console.error("IndexedDB error:", e);
    return null;
  }
}

async function saveDirectoryHandle(handle) {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(handle, KEY_NAME);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    console.error("IndexedDB error:", e);
  }
}

async function syncWithConnectedWorkspace() {
  try {
    const dirHandle = await getSavedDirectoryHandle();
    if (!dirHandle) return false;
    
    if (await dirHandle.queryPermission({ mode: 'readwrite' }) !== 'granted') {
      return false;
    }
    
    const fileHandle = await dirHandle.getFileHandle("events.json", { create: false });
    const file = await fileHandle.getFile();
    const text = await file.text();
    const events = JSON.parse(text);
    if (Array.isArray(events)) {
      localStorage.setItem("events", JSON.stringify(events));
      window.dispatchEvent(new CustomEvent("events-synced"));
      return true;
    }
  } catch (e) {
    console.error("Error syncing with connected workspace:", e);
  }
  return false;
}

async function loadEventsFromJSON() {
  try {
    const response = await fetch("events.json");
    if (response.ok) {
      const events = await response.json();
      if (Array.isArray(events) && events.length > 0) {
        localStorage.setItem("events", JSON.stringify(events));
        window.dispatchEvent(new CustomEvent("events-synced"));
      }
    }
  } catch (e) {
    console.warn("Unable to fetch events.json automatically (likely file:// protocol without a server). Using localStorage fallback.", e);
  }
}

// Database Helpers
function getEvents() {
  return JSON.parse(localStorage.getItem("events")) || [];
}

async function saveEvents(events) {
  localStorage.setItem("events", JSON.stringify(events));
  
  // Update UI immediately
  if (typeof renderHomeEvents === "function") renderHomeEvents();
  if (typeof renderAdminTable === "function") renderAdminTable();

  // Try to write to the connected workspace folder if we have it
  try {
    const dirHandle = await getSavedDirectoryHandle();
    if (dirHandle && await dirHandle.queryPermission({ mode: 'readwrite' }) === 'granted') {
      const fileHandle = await dirHandle.getFileHandle("events.json", { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(JSON.stringify(events, null, 2));
      await writable.close();
      showToast("Workspace events.json updated automatically!", "success");
      return;
    }
  } catch (e) {
    console.error("Failed to auto-write to events.json:", e);
  }
  
  showToast("Saved to browser storage! Set up workspace connection to auto-sync events.json.", "info");
}

function getUsers() {
  return JSON.parse(localStorage.getItem("users")) || [];
}

function saveUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

function getRegistrations() {
  return JSON.parse(localStorage.getItem("registrations")) || [];
}

function saveRegistrations(regs) {
  localStorage.setItem("registrations", JSON.stringify(regs));
}

function getCurrentUser() {
  return JSON.parse(localStorage.getItem("currentUser")) || null;
}

function setCurrentUser(user) {
  if (user) {
    localStorage.setItem("currentUser", JSON.stringify(user));
  } else {
    localStorage.removeItem("currentUser");
  }
}

// Toast Helper
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
  
  let icon = "fa-circle-check";
  if (type === "error") icon = "fa-circle-xmark";
  if (type === "info") icon = "fa-circle-info";
  
  toast.innerHTML = `
    <i class="fa-solid ${icon}"></i>
    <span>${message}</span>
  `;
  
  container.appendChild(toast);
  
  // Trigger entry animation
  setTimeout(() => toast.classList.add("show"), 10);
  
  // Dismiss toast
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Shared Formatting Helpers
function formatDate(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
      return dateStr;
  }
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return months[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear();
}

function getCategoryPlaceholder(category) {
  if (!category) return "assets/workshop.jpeg";
  let catLower = category.toLowerCase();
  if (catLower === "technology") return "assets/techmeetup.jpeg";
  if (catLower === "workshop") return "assets/workshop.jpeg";
  if (catLower === "music") return "assets/music.jpeg";
  if (catLower === "sports") return "assets/footbal.jpeg";
  return "assets/workshop.jpeg";
}

// Shared Chatbot setup
function initChatbot() {
  const chatbotBtn = document.getElementById("chatbotBtn");
  const chatbot = document.getElementById("chatbot");
  const closeChat = document.getElementById("closeChat");
  const sendBtn = document.getElementById("sendBtn");
  const userInput = document.getElementById("userInput");
  const chatBody = document.getElementById("chatBody");

  if (!chatbotBtn || !chatbot || !chatBody) return;

  chatbotBtn.addEventListener("click", function () {
      chatbot.style.display = "flex";
      chatBody.scrollTop = chatBody.scrollHeight;
  });

  if (closeChat) {
      closeChat.addEventListener("click", function () {
          chatbot.style.display = "none";
      });
  }

  function getFormattedTime() {
      const now = new Date();
      let hours = now.getHours();
      let minutes = now.getMinutes();
      if (minutes < 10) {
          minutes = "0" + minutes;
      }
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      if (hours === 0) {
          hours = 12;
      }
      return hours + ":" + minutes + " " + ampm;
  }

  function addChatMessage(message, sender) {
      const messageDiv = document.createElement("div");
      messageDiv.className = sender === "user" ? "user-msg" : "bot-msg";
      messageDiv.innerHTML = `
          <div>${message}</div>
          <span class="msg-time">${getFormattedTime()}</span>
      `;
      chatBody.appendChild(messageDiv);
      chatBody.scrollTop = chatBody.scrollHeight;
  }

  // Generate Chips
  let chipsDiv = chatbot.querySelector(".chat-chips");
  if (!chipsDiv) {
      chipsDiv = document.createElement("div");
      chipsDiv.className = "chat-chips";
      chipsDiv.innerHTML = `
          <div class="chat-chip" data-query="Show me tech events">💻 Tech</div>
          <div class="chat-chip" data-query="Any workshops this weekend?">🛠 Workshops</div>
          <div class="chat-chip" data-query="Music events available?">🎵 Music</div>
          <div class="chat-chip" data-query="List all events">📅 All Events</div>
      `;
      const inputDiv = chatbot.querySelector(".chat-input");
      chatbot.insertBefore(chipsDiv, inputDiv);
  }

  const chips = chipsDiv.querySelectorAll(".chat-chip");
  for (let i = 0; i < chips.length; i++) {
      chips[i].addEventListener("click", function () {
          userInput.value = this.getAttribute("data-query");
          sendChatMessage();
      });
  }

  function sendChatMessage() {
      const message = userInput.value.trim();
      if (message === "") return;

      addChatMessage(message, "user");
      userInput.value = "";

      const typingDiv = document.createElement("div");
      typingDiv.className = "bot-msg";
      typingDiv.id = "chat-typing";
      typingDiv.innerHTML = "✍️ Typing...";
      chatBody.appendChild(typingDiv);
      chatBody.scrollTop = chatBody.scrollHeight;

      setTimeout(function () {
          const indicator = document.getElementById("chat-typing");
          if (indicator) indicator.remove();

          const query = message.toLowerCase();
          let botResponse = "";
          const allEvents = getEvents();

          if (query.includes("tech") || query.includes("technology")) {
              let techEvents = [];
              for (let i = 0; i < allEvents.length; i++) {
                  if (allEvents[i].category.toLowerCase() === "technology") {
                      techEvents.push(allEvents[i]);
                  }
              }
              if (techEvents.length === 0) {
                  botResponse = "❌ No Technology events found.";
              } else {
                  let html = "💻 <b>Technology Events:</b><br><br>";
                  for (let i = 0; i < techEvents.length; i++) {
                      let e = techEvents[i];
                      html += "• <b>" + e.title + "</b><br>📅 " + formatDate(e.date) + " at " + (e.time || '10:00 AM') + "<br>📍 " + e.location + "<br><br>";
                  }
                  botResponse = html;
              }
          } 
          else if (query.includes("workshop")) {
              let workshopEvents = [];
              for (let i = 0; i < allEvents.length; i++) {
                  if (allEvents[i].category.toLowerCase() === "workshop") {
                      workshopEvents.push(allEvents[i]);
                  }
              }
              if (workshopEvents.length === 0) {
                  botResponse = "❌ No Workshops found.";
              } else {
                  let html = "🛠 <b>Workshop Events:</b><br><br>";
                  for (let i = 0; i < workshopEvents.length; i++) {
                      let e = workshopEvents[i];
                      html += "• <b>" + e.title + "</b><br>📅 " + formatDate(e.date) + " at " + (e.time || '02:00 PM') + "<br>📍 " + e.location + "<br><br>";
                  }
                  botResponse = html;
              }
          } 
          else if (query.includes("music")) {
              let musicEvents = [];
              for (let i = 0; i < allEvents.length; i++) {
                  if (allEvents[i].category.toLowerCase() === "music") {
                      musicEvents.push(allEvents[i]);
                  }
              }
              if (musicEvents.length === 0) {
                  botResponse = "❌ No Music events found.";
              } else {
                  let html = "🎵 <b>Music Events:</b><br><br>";
                  for (let i = 0; i < musicEvents.length; i++) {
                      let e = musicEvents[i];
                      html += "• <b>" + e.title + "</b><br>📅 " + formatDate(e.date) + " at " + (e.time || '06:00 PM') + "<br>📍 " + e.location + "<br><br>";
                  }
                  botResponse = html;
              }
          } 
          else if (query.includes("sport")) {
              let sportsEvents = [];
              for (let i = 0; i < allEvents.length; i++) {
                  if (allEvents[i].category.toLowerCase() === "sports") {
                      sportsEvents.push(allEvents[i]);
                  }
              }
              if (sportsEvents.length === 0) {
                  botResponse = "❌ No Sports events found.";
              } else {
                  let html = "⚽ <b>Sports Events:</b><br><br>";
                  for (let i = 0; i < sportsEvents.length; i++) {
                      let e = sportsEvents[i];
                      html += "• <b>" + e.title + "</b><br>📅 " + formatDate(e.date) + " at " + (e.time || '09:00 AM') + "<br>📍 " + e.location + "<br><br>";
                  }
                  botResponse = html;
              }
          } 
          else if (query.includes("weekend")) {
              let weekendEvents = [];
              for (let i = 0; i < allEvents.length; i++) {
                  let day = new Date(allEvents[i].date).getDay();
                  if (day === 0 || day === 6) {
                      weekendEvents.push(allEvents[i]);
                  }
              }
              if (weekendEvents.length === 0) {
                  botResponse = "📅 No events scheduled for this weekend.";
              } else {
                  let html = "✨ <b>Upcoming Weekend Activities:</b><br><br>";
                  for (let i = 0; i < weekendEvents.length; i++) {
                      let e = weekendEvents[i];
                      html += "• <b>" + e.title + "</b> (" + e.category + ")<br>📅 " + formatDate(e.date) + " at " + (e.time || '10:00 AM') + "<br>📍 " + e.location + "<br><br>";
                  }
                  botResponse = html;
              }
          } 
          else if (query.includes("list") || query.includes("all") || query.includes("event")) {
              let html = "📅 <b>All Scheduled Events:</b><br><br>";
              for (let i = 0; i < allEvents.length; i++) {
                  let e = allEvents[i];
                  html += "• <b>" + e.title + "</b> (" + e.category + ") - " + formatDate(e.date) + "<br>";
              }
              botResponse = html;
          } 
          else if (query.includes("hello") || query.includes("hi") || query.includes("hey")) {
              botResponse = "👋 Hello there! How can I help you find events or plan your schedule today?";
          } 
          else if (query.includes("help")) {
              botResponse = "🎯 Ask me about categories like <b>'tech events'</b>, <b>'workshops'</b>, <b>'music'</b>, or <b>'weekend activities'</b>. You can also type <b>'list events'</b> to see everything scheduled.";
          } 
          else {
              botResponse = "🤔 I didn't quite catch that. You can ask me to list events, show tech events, workshops, music, or see what's happening this weekend!";
          }
          addChatMessage(botResponse, "bot");
      }, 800);
  }

  if (sendBtn) sendBtn.addEventListener("click", sendChatMessage);
  if (userInput) {
      userInput.addEventListener("keypress", function (e) {
          if (e.key === "Enter") sendChatMessage();
      });
  }
}

// Database initialization on script load
async function initDatabase() {
  const synced = await syncWithConnectedWorkspace();
  if (!synced) {
    await loadEventsFromJSON();
  }
}
initDatabase();

// Workspace sync UI Widget
async function initWorkspaceSync() {
  // Inject widget CSS
  const style = document.createElement("style");
  style.innerHTML = `
    .workspace-widget {
      position: fixed;
      bottom: 110px;
      right: 30px;
      z-index: 9998;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      font-family: 'Outfit', 'Poppins', sans-serif;
    }
    .workspace-btn {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: #1a202c;
      color: #fff;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 22px;
      cursor: pointer;
      box-shadow: 0 8px 24px rgba(0,0,0,0.25);
      transition: all 0.3s ease;
      position: relative;
    }
    .workspace-btn:hover {
      transform: scale(1.08);
      background: #2d3748;
    }
    .workspace-status-dot {
      position: absolute;
      top: 2px;
      right: 2px;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: #a0aec0;
      border: 2px solid #1a202c;
      transition: background 0.3s;
    }
    .workspace-status-dot.connected {
      background: #48bb78;
    }
    .workspace-status-dot.pending {
      background: #ecc94b;
    }
    .workspace-status-dot.error {
      background: #f56565;
    }
    .workspace-panel {
      position: absolute;
      bottom: 75px;
      right: 0;
      width: 320px;
      background: #fff;
      border-radius: 16px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.15);
      border: 1px solid #e2e8f0;
      padding: 20px;
      display: none;
      flex-direction: column;
      gap: 12px;
      z-index: 9999;
      color: #2d3748;
    }
    .workspace-panel h4 {
      font-size: 16px;
      margin: 0;
      color: #1a202c;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .workspace-panel p {
      font-size: 13px;
      color: #718096;
      margin: 0;
      line-height: 1.5;
    }
    .workspace-panel-btn {
      width: 100%;
      height: 40px;
      border-radius: 8px;
      border: none;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;
    }
    .workspace-panel-btn-primary {
      background: #6C3EF4;
      color: #fff;
    }
    .workspace-panel-btn-primary:hover {
      background: #5527d9;
    }
    .workspace-panel-btn-secondary {
      background: #edf2f7;
      color: #4a5568;
    }
    .workspace-panel-btn-secondary:hover {
      background: #e2e8f0;
    }
  `;
  document.head.appendChild(style);

  // Create widget container
  const widget = document.createElement("div");
  widget.className = "workspace-widget";
  widget.innerHTML = `
    <div class="workspace-btn" id="workspaceBtn" title="Sync Local JSON File">
      <i class="fa-solid fa-folder-open"></i>
      <div class="workspace-status-dot" id="workspaceStatusDot"></div>
    </div>
    <div class="workspace-panel" id="workspacePanel">
      <h4><i class="fa-solid fa-rotate"></i> Workspace Sync</h4>
      <p id="workspaceInfo">Connect your project's local directory to enable automatic events.json saving and real-time synchronization.</p>
      <button class="workspace-panel-btn workspace-panel-btn-primary" id="workspaceActionBtn">
        <i class="fa-solid fa-link"></i> Connect Folder
      </button>
      <button class="workspace-panel-btn workspace-panel-btn-secondary" id="workspaceManualBtn" style="display:none;">
        <i class="fa-solid fa-download"></i> Download events.json
      </button>
    </div>
  `;
  document.body.appendChild(widget);

  const workspaceBtn = document.getElementById("workspaceBtn");
  const workspacePanel = document.getElementById("workspacePanel");
  const workspaceStatusDot = document.getElementById("workspaceStatusDot");
  const workspaceInfo = document.getElementById("workspaceInfo");
  const workspaceActionBtn = document.getElementById("workspaceActionBtn");
  const workspaceManualBtn = document.getElementById("workspaceManualBtn");

  // Toggle Panel
  workspaceBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    const isShowing = workspacePanel.style.display === "flex";
    workspacePanel.style.display = isShowing ? "none" : "flex";
  });

  // Close panel on outside click
  document.addEventListener("click", function (e) {
    if (!widget.contains(e.target)) {
      workspacePanel.style.display = "none";
    }
  });

  // Update Status UI
  async function updateStatusUI() {
    const handle = await getSavedDirectoryHandle();
    if (!handle) {
      workspaceStatusDot.className = "workspace-status-dot";
      workspaceInfo.innerHTML = "Connect your project's local directory to enable automatic <b>events.json</b> saving and real-time synchronization.";
      workspaceActionBtn.innerHTML = '<i class="fa-solid fa-link"></i> Connect Folder';
      workspaceManualBtn.style.display = "none";
      return;
    }

    try {
      const permission = await handle.queryPermission({ mode: 'readwrite' });
      if (permission === 'granted') {
        workspaceStatusDot.className = "workspace-status-dot connected";
        workspaceInfo.innerHTML = `Connected to: <b>${handle.name}</b><br>✓ events.json is automatically synchronized.`;
        workspaceActionBtn.innerHTML = '<i class="fa-solid fa-unlink"></i> Disconnect Folder';
        workspaceManualBtn.style.display = "none";
      } else {
        workspaceStatusDot.className = "workspace-status-dot pending";
        workspaceInfo.innerHTML = `Connected to: <b>${handle.name}</b><br>⚠️ Awaiting folder write permission.`;
        workspaceActionBtn.innerHTML = '<i class="fa-solid fa-key"></i> Grant Permission';
        workspaceManualBtn.style.display = "flex";
      }
    } catch (e) {
      workspaceStatusDot.className = "workspace-status-dot error";
      workspaceInfo.innerHTML = "Error verifying folder permission.";
      workspaceActionBtn.innerHTML = '<i class="fa-solid fa-link"></i> Connect Folder';
      workspaceManualBtn.style.display = "flex";
    }
  }

  // Handle Action Button click
  workspaceActionBtn.addEventListener("click", async function () {
    const handle = await getSavedDirectoryHandle();
    if (!handle) {
      // Connect new folder
      try {
        const newHandle = await window.showDirectoryPicker();
        await saveDirectoryHandle(newHandle);
        const permission = await newHandle.requestPermission({ mode: 'readwrite' });
        if (permission === 'granted') {
          showToast("Workspace folder connected successfully!", "success");
          // Sync immediately
          const synced = await syncWithConnectedWorkspace();
          if (synced) {
            showToast("Loaded events from workspace events.json!", "success");
            if (typeof renderHomeEvents === "function") renderHomeEvents();
            if (typeof renderAdminTable === "function") renderAdminTable();
          }
        }
      } catch (e) {
        console.error(e);
        showToast("Failed to connect workspace folder.", "error");
      }
    } else {
      const permission = await handle.queryPermission({ mode: 'readwrite' });
      if (permission !== 'granted') {
        // Request permission
        try {
          const req = await handle.requestPermission({ mode: 'readwrite' });
          if (req === 'granted') {
            showToast("Workspace permission granted!", "success");
            const synced = await syncWithConnectedWorkspace();
            if (synced) {
              if (typeof renderHomeEvents === "function") renderHomeEvents();
              if (typeof renderAdminTable === "function") renderAdminTable();
            }
          }
        } catch (e) {
          console.error(e);
          showToast("Failed to obtain workspace permission.", "error");
        }
      } else {
        // Disconnect
        if (confirm("Disconnect workspace folder? Automatic events.json saves will stop.")) {
          await saveDirectoryHandle(null);
          showToast("Workspace folder disconnected.", "info");
        }
      }
    }
    updateStatusUI();
  });

  // Handle Manual Download click
  workspaceManualBtn.addEventListener("click", function () {
    const events = getEvents();
    const blob = new Blob([JSON.stringify(events, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "events.json";
    link.click();
    showToast("Downloaded events.json. Please save it to your project folder.", "success");
  });

  // Initial Status update
  updateStatusUI();
}

// Automatically initialize workspace connection UI on page load
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initWorkspaceSync);
} else {
  initWorkspaceSync();
}
