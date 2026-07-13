document.addEventListener("DOMContentLoaded", () => {
    const user = getCurrentUser();
    if (!user || user.role !== "user") {
        alert("Access Denied. Please log in first.");
        window.location.href = "home.html";
        return;
    }

    updateUserProfileInfo(user);
    renderUserEvents();
    renderMyRegistrations();
    setupTabSwitching();

    ["searchInput", "dateFilter", "categoryFilter"].forEach(id => {
        document.getElementById(id)?.addEventListener(id === "searchInput" ? "input" : "change", renderUserEvents);
    });
    
    document.getElementById("resetBtn")?.addEventListener("click", () => {
        document.getElementById("searchInput").value = "";
        document.getElementById("dateFilter").value = "";
        document.getElementById("categoryFilter").value = "";
        renderUserEvents();
        showToast("Filters reset", "info");
    });

    initChatbot();
});

function updateUserProfileInfo(user) {
    const btn = document.getElementById("profileBtn"), menu = document.getElementById("profileMenu");
    if (!btn || !menu) return;
    const avatar = btn.querySelector(".avatar");
    if (avatar && user.name) {
        avatar.innerText = user.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
    }
    const nameEl = btn.querySelector("h4"), detailsEl = btn.querySelector("span");
    if (nameEl) nameEl.innerText = user.name;
    if (detailsEl) detailsEl.innerText = user.college || "Student";

    const mmAvatar = menu.querySelector(".avatar"), mmName = menu.querySelector("h4"), mmRole = menu.querySelector("p");
    if (mmAvatar && avatar) mmAvatar.innerText = avatar.innerText;
    if (mmName) mmName.innerText = user.name;
    if (mmRole) mmRole.innerText = user.college || "Student";

    btn.addEventListener("click", e => { e.stopPropagation(); menu.style.display = menu.style.display === "block" ? "none" : "block"; });
    document.addEventListener("click", () => menu.style.display = "none");
}

function setupTabSwitching() {
    const evLink = document.getElementById("eventsLink"), regLink = document.getElementById("registrationLink");
    const filters = document.querySelector(".filter-section"), evSec = document.querySelector(".events-section"), regSec = document.getElementById("registrationSection");

    if (regSec) regSec.style.display = "none";

    evLink?.addEventListener("click", () => {
        evLink.classList.add("active"); regLink.classList.remove("active");
        if (filters) filters.style.display = "flex";
        if (evSec) evSec.style.display = "block";
        if (regSec) regSec.style.display = "none";
        document.querySelector("header h1").innerText = "Events";
        renderUserEvents();
    });

    regLink?.addEventListener("click", () => {
        regLink.classList.add("active"); evLink.classList.remove("active");
        if (filters) filters.style.display = "none";
        if (evSec) evSec.style.display = "none";
        if (regSec) regSec.style.display = "block";
        document.querySelector("header h1").innerText = "My Registrations";
        renderMyRegistrations();
    });
}

function renderUserEvents() {
    const container = document.getElementById("eventContainer");
    if (!container) return;
    container.innerHTML = "";

    const user = getCurrentUser(), events = getEvents(), regs = getRegistrations();
    const search = document.getElementById("searchInput")?.value.toLowerCase().trim() || "";
    const date = document.getElementById("dateFilter")?.value || "";
    const cat = document.getElementById("categoryFilter")?.value || "";

    const filtered = events.filter(e => 
        e.title.toLowerCase().includes(search) &&
        (!cat || e.category === cat) &&
        (!date || e.date === date)
    );

    if (!filtered.length) {
        container.innerHTML = "<div class='no-events-msg'>No events found matching your filters.</div>";
        return;
    }

    filtered.forEach(e => {
        const card = document.createElement("div");
        card.className = "event-card";
        const registered = regs.some(r => r.userEmail === user.email && r.eventId === e.id);
        const full = (e.attendees || 0) >= (e.maxAttendees || 100);
        const btnHTML = registered ? `<button class="register-btn user-reg-btn" style="background:#22C55E;" disabled>✓ Registered</button>`
            : full ? `<button class="register-btn user-reg-btn" style="background:#ef4444;" disabled>Full</button>`
            : `<button class="register-btn user-reg-btn" data-id="${e.id}">Register</button>`;

        card.innerHTML = `<img src="${e.image || getCategoryPlaceholder(e.category)}" alt="${e.title}" onerror="this.src='assets/workshop.jpeg'">
            <div class="event-content">
                <span class="details-badge">${e.category}</span><h3>${e.title}</h3>
                <div class="event-info">
                    <p><i class="fa-solid fa-calendar"></i> ${formatDate(e.date)}</p>
                    <p><i class="fa-solid fa-clock"></i> ${e.time || '10:00 AM'}</p>
                    <p class="count"><i class="fa-solid fa-users"></i> <span>${e.attendees || 0}</span> / ${e.maxAttendees || 100} Registered</p>
                </div><p class="location"><i class="fa-solid fa-location-dot"></i> ${e.location}</p>${btnHTML}
            </div>`;

        card.addEventListener("click", ev => { if (!ev.target.classList.contains("user-reg-btn")) openDetailsModal(e.id); });
        container.appendChild(card);
    });

    container.querySelectorAll(".user-reg-btn:not([disabled])").forEach(btn => {
        btn.addEventListener("click", ev => { ev.stopPropagation(); handleUserRegistrationTrigger(parseInt(btn.getAttribute("data-id"))); });
    });
}

function renderMyRegistrations() {
    const container = document.getElementById("registrationContainer"), empty = document.getElementById("emptyState");
    if (!container) return;
    container.querySelectorAll(".registered-card").forEach(c => c.remove());

    const user = getCurrentUser(), events = getEvents();
    const userRegs = getRegistrations().filter(r => r.userEmail === user.email);

    if (!userRegs.length) {
        if (empty) empty.style.display = "block";
        return;
    }
    if (empty) empty.style.display = "none";

    userRegs.forEach(reg => {
        const ev = events.find(e => e.id === reg.eventId);
        if (!ev) return;
        const card = document.createElement("div");
        card.className = "registered-card";
        card.innerHTML = `<img src="${ev.image || getCategoryPlaceholder(ev.category)}" alt="${ev.title}" onerror="this.src='assets/workshop.jpeg'">
            <div class="registered-content">
                <span class="details-badge">${ev.category}</span><h3>${ev.title}</h3>
                <div class="event-info">
                    <p><i class="fa-solid fa-calendar"></i> ${formatDate(ev.date)} at ${ev.time || '10:00 AM'}</p>
                    <p><i class="fa-solid fa-location-dot"></i> ${ev.location}</p>
                </div><span class="registered-badge">✓ Registered</span>
            </div>`;
        card.addEventListener("click", () => openDetailsModal(ev.id));
        container.appendChild(card);
    });
}

const detailsModal = document.getElementById("detailsModal"), dRegisterBtn = document.getElementById("detailsRegisterBtn");
function openDetailsModal(eventId) {
    const event = getEvents().find(e => e.id === eventId);
    if (!event) return;
    const body = document.getElementById("detailsBody");
    if (!body) return;

    body.innerHTML = `<img class="details-image" src="${event.image || getCategoryPlaceholder(event.category)}" alt="${event.title}" onerror="this.src='assets/workshop.jpeg'">
        <span class="details-badge">${event.category}</span><h2 style="font-size: 24px; color: #1a202c; margin-bottom: 15px;">${event.title}</h2>
        <div class="details-meta">
            <div class="details-meta-item"><i class="fa-solid fa-calendar"></i> <span>${formatDate(event.date)}</span></div>
            <div class="details-meta-item"><i class="fa-solid fa-clock"></i> <span>${event.time || '10:00 AM'}</span></div>
            <div class="details-meta-item"><i class="fa-solid fa-location-dot"></i> <span>${event.location}</span></div>
            <div class="details-meta-item"><i class="fa-solid fa-users"></i> <span>${event.attendees || 0} / ${event.maxAttendees || 100} Attendees</span></div>
        </div><p class="details-description">${event.description || 'No description.'}</p>`;

    dRegisterBtn.onclick = () => { detailsModal.style.display = "none"; handleUserRegistrationTrigger(eventId); };

    const registered = getRegistrations().some(r => r.userEmail === getCurrentUser().email && r.eventId === eventId);
    const full = (event.attendees || 0) >= (event.maxAttendees || 100);

    dRegisterBtn.innerText = registered ? "✓ Registered" : full ? "Full" : "Register";
    dRegisterBtn.disabled = registered || full;
    dRegisterBtn.style.background = registered ? "#22C55E" : full ? "#ef4444" : "#6C3EF4";

    if (detailsModal) detailsModal.style.display = "flex";
}

["closeDetails", "detailsCancelBtn"].forEach(id => document.getElementById(id)?.addEventListener("click", () => { detailsModal.style.display = "none"; }));

const confirmModal = document.getElementById("confirmRegModal"), confirmBtn = document.getElementById("confirmRegConfirmBtn");
function handleUserRegistrationTrigger(eventId) {
    const user = getCurrentUser(), event = getEvents().find(e => e.id === eventId), regs = getRegistrations();
    if (!event) return;

    if (regs.some(r => r.userEmail === user.email && r.eventId === eventId)) return showToast("Already registered.", "info");
    if ((event.attendees || 0) >= (event.maxAttendees || 100)) return showToast("Event is full.", "error");

    document.getElementById("confirmRegTitle").innerText = `Register for: ${event.title}`;
    document.getElementById("confirmUserName").innerText = user.name;
    document.getElementById("confirmUserEmail").innerText = user.email;
    document.getElementById("confirmEventDate").innerText = `${formatDate(event.date)} at ${event.time || '10:00 AM'}`;

    if (confirmModal) confirmModal.style.display = "flex";

    confirmBtn.onclick = () => {
        const events = getEvents(), e = events.find(x => x.id === eventId);
        if (e.attendees >= e.maxAttendees) return showToast("Event is full.", "error");

        regs.push({ userEmail: user.email, eventId, registeredAt: new Date().toISOString() });
        saveRegistrations(regs);
        e.attendees = (e.attendees || 0) + 1;
        saveEvents(events);

        confirmModal.style.display = "none";
        showToast("Successfully registered!", "success");
        renderUserEvents(); renderMyRegistrations();
    };
}

["closeConfirmReg", "confirmRegCancelBtn"].forEach(id => document.getElementById(id)?.addEventListener("click", () => { confirmModal.style.display = "none"; }));

document.getElementById("logoutBtn")?.addEventListener("click", () => {
    if (confirm("Are you sure you want to log out?")) {
        setCurrentUser(null);
        showToast("Logged out successfully", "info");
        setTimeout(() => { window.location.href = "home.html"; }, 500);
    }
});

window.addEventListener("events-synced", () => { renderUserEvents(); renderMyRegistrations(); });
