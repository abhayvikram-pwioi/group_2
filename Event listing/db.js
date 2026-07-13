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

// Database Helpers
function getEvents() {
  return JSON.parse(localStorage.getItem("events")) || [];
}

function saveEvents(events) {
  localStorage.setItem("events", JSON.stringify(events));
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
