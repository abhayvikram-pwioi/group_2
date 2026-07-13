document.addEventListener("DOMContentLoaded", function () {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== "user") {
        alert("Access Denied. Please log in first.");
        window.location.href = "home.html";
        return;
    }

    updateUserProfileInfo(currentUser);
    renderUserEvents();
    renderMyRegistrations();
    setupTabSwitching();

    const searchInput = document.getElementById("searchInput");
    const dateFilter = document.getElementById("dateFilter");
    const categoryFilter = document.getElementById("categoryFilter");
    const resetBtn = document.getElementById("resetBtn");

    if (searchInput) searchInput.addEventListener("input", renderUserEvents);
    if (dateFilter) dateFilter.addEventListener("change", renderUserEvents);
    if (categoryFilter) categoryFilter.addEventListener("change", renderUserEvents);
    
    if (resetBtn) {
        resetBtn.addEventListener("click", function () {
            searchInput.value = "";
            dateFilter.value = "";
            categoryFilter.value = "";
            renderUserEvents();
            showToast("Filters reset", "info");
        });
    }

    // Initialize chatbot from db.js
    initChatbot();
});

/*==========================
      PROFILE VIEW RENDER
==========================*/
function updateUserProfileInfo(user) {
    const profileBtn = document.getElementById("profileBtn");
    if (!profileBtn) return;

    const avatar = profileBtn.querySelector(".avatar");
    if (avatar && user.name) {
        let nameParts = user.name.split(" ");
        let initials = "";
        if (nameParts.length > 0 && nameParts[0]) initials += nameParts[0][0];
        if (nameParts.length > 1 && nameParts[1]) initials += nameParts[1][0];
        avatar.innerText = initials.toUpperCase();
    }

    const nameEl = profileBtn.querySelector("h4");
    const detailsEl = profileBtn.querySelector("span");
    if (nameEl) nameEl.innerText = user.name;
    if (detailsEl) detailsEl.innerText = user.college || "Student";

    const dropdown = document.getElementById("profileMenu");
    if (dropdown) {
        const dropdownAvatar = dropdown.querySelector(".avatar");
        const dropdownName = dropdown.querySelector("h4");
        const dropdownRole = dropdown.querySelector("p");

        if (dropdownAvatar && user.name) dropdownAvatar.innerText = avatar.innerText;
        if (dropdownName) dropdownName.innerText = user.name;
        if (dropdownRole) dropdownRole.innerText = user.college || "Student";
    }
}

/*==========================
      TAB SWITCHING FLOW
==========================*/
function setupTabSwitching() {
    const eventsLink = document.getElementById("eventsLink");
    const registrationLink = document.getElementById("registrationLink");
    
    const filterSection = document.querySelector(".filter-section");
    const eventsSection = document.querySelector(".events-section");
    const registrationSection = document.getElementById("registrationSection");

    if (registrationSection) registrationSection.style.display = "none";

    eventsLink.addEventListener("click", function () {
        eventsLink.classList.add("active");
        registrationLink.classList.remove("active");
        
        if (filterSection) filterSection.style.display = "flex";
        if (eventsSection) eventsSection.style.display = "block";
        if (registrationSection) registrationSection.style.display = "none";
        
        document.querySelector("header h1").innerText = "Events";
        renderUserEvents();
    });

    registrationLink.addEventListener("click", function () {
        registrationLink.classList.add("active");
        eventsLink.classList.remove("active");
        
        if (filterSection) filterSection.style.display = "none";
        if (eventsSection) eventsSection.style.display = "none";
        if (registrationSection) registrationSection.style.display = "block";
        
        document.querySelector("header h1").innerText = "My Registrations";
        renderMyRegistrations();
    });
}

/*==========================
      RENDER USER EVENTS
==========================*/
function renderUserEvents() {
    const container = document.getElementById("eventContainer");
    if (!container) return;

    container.innerHTML = "";

    const events = getEvents();
    const currentUser = getCurrentUser();
    const registrations = getRegistrations();

    const searchQuery = document.getElementById("searchInput") ? document.getElementById("searchInput").value.toLowerCase().trim() : "";
    const dateQuery = document.getElementById("dateFilter") ? document.getElementById("dateFilter").value : "";
    const categoryQuery = document.getElementById("categoryFilter") ? document.getElementById("categoryFilter").value : "";

    let filteredEvents = [];
    for (let i = 0; i < events.length; i++) {
        let event = events[i];
        let matchesSearch = event.title.toLowerCase().includes(searchQuery);
        let matchesCategory = (categoryQuery === "") || (event.category === categoryQuery);
        let matchesDate = (dateQuery === "") || (event.date === dateQuery);

        if (matchesSearch && matchesCategory && matchesDate) {
            filteredEvents.push(event);
        }
    }

    if (filteredEvents.length === 0) {
        container.innerHTML = "<div class='no-events-msg'>No events found matching your filters.</div>";
        return;
    }

    for (let i = 0; i < filteredEvents.length; i++) {
        let event = filteredEvents[i];
        const card = document.createElement("div");
        card.className = "event-card";
        
        let isRegistered = false;
        for (let j = 0; j < registrations.length; j++) {
            if (registrations[j].userEmail === currentUser.email && registrations[j].eventId === event.id) {
                isRegistered = true;
                break;
            }
        }

        let isFull = (event.attendees || 0) >= (event.maxAttendees || 100);
        
        let buttonHTML = `<button class="register-btn user-reg-btn" data-id="${event.id}">Register</button>`;
        if (isRegistered) {
            buttonHTML = `<button class="register-btn user-reg-btn" style="background:#22C55E;" disabled>✓ Registered</button>`;
        } else if (isFull) {
            buttonHTML = `<button class="register-btn user-reg-btn" style="background:#ef4444;" disabled>Full</button>`;
        }

        let imgPath = event.image || getCategoryPlaceholder(event.category);

        card.innerHTML = `
            <img src="${imgPath}" alt="${event.title}" onerror="this.src='assets/workshop.jpeg'">
            <div class="event-content">
                <span class="details-badge">${event.category}</span>
                <h3>${event.title}</h3>
                <div class="event-info">
                    <p><i class="fa-solid fa-calendar"></i> ${formatDate(event.date)}</p>
                    <p><i class="fa-solid fa-clock"></i> ${event.time || '10:00 AM'}</p>
                    <p class="count"><i class="fa-solid fa-users"></i> <span class="registered-count">${event.attendees || 0}</span> / ${event.maxAttendees || 100} Registered</p>
                </div>
                <p class="location"><i class="fa-solid fa-location-dot"></i> ${event.location}</p>
                ${buttonHTML}
            </div>
        `;

        card.addEventListener("click", function (e) {
            if (!e.target.classList.contains("user-reg-btn")) {
                openDetailsModal(event.id);
            }
        });

        container.appendChild(card);
    }

    const regButtons = document.querySelectorAll(".user-reg-btn");
    for (let i = 0; i < regButtons.length; i++) {
        regButtons[i].addEventListener("click", function (e) {
            e.stopPropagation();
            let eventId = parseInt(this.getAttribute("data-id"));
            handleUserRegistrationTrigger(eventId);
        });
    }
}

/*==========================
      RENDER MY REGISTRATIONS
==========================*/
function renderMyRegistrations() {
    const container = document.getElementById("registrationContainer");
    const emptyState = document.getElementById("emptyState");
    if (!container) return;

    const oldCards = container.querySelectorAll(".registered-card");
    for (let i = 0; i < oldCards.length; i++) {
        oldCards[i].remove();
    }

    const currentUser = getCurrentUser();
    const allRegistrations = getRegistrations();
    
    let userRegistrations = [];
    for (let i = 0; i < allRegistrations.length; i++) {
        if (allRegistrations[i].userEmail === currentUser.email) {
            userRegistrations.push(allRegistrations[i]);
        }
    }

    const events = getEvents();

    if (userRegistrations.length === 0) {
        if (emptyState) emptyState.style.display = "block";
        return;
    }

    if (emptyState) emptyState.style.display = "none";

    for (let i = 0; i < userRegistrations.length; i++) {
        let reg = userRegistrations[i];
        let event = null;
        for (let j = 0; j < events.length; j++) {
            if (events[j].id === reg.eventId) {
                event = events[j];
                break;
            }
        }
        if (!event) continue;

        const card = document.createElement("div");
        card.className = "registered-card";
        
        let imgPath = event.image || getCategoryPlaceholder(event.category);

        card.innerHTML = `
            <img src="${imgPath}" alt="${event.title}" onerror="this.src='assets/workshop.jpeg'">
            <div class="registered-content">
                <span class="details-badge">${event.category}</span>
                <h3>${event.title}</h3>
                <div class="event-info">
                    <p><i class="fa-solid fa-calendar"></i> ${formatDate(event.date)} at ${event.time || '10:00 AM'}</p>
                    <p><i class="fa-solid fa-location-dot"></i> ${event.location}</p>
                </div>
                <span class="registered-badge">✓ Registered</span>
            </div>
        `;

        card.addEventListener("click", function () {
            openDetailsModal(event.id);
        });

        container.appendChild(card);
    }
}

/*==========================
      EVENT DETAILS MODAL
==========================*/
const detailsModal = document.getElementById("detailsModal");
const closeDetails = document.getElementById("closeDetails");
const detailsCancelBtn = document.getElementById("detailsCancelBtn");
const detailsRegisterBtn = document.getElementById("detailsRegisterBtn");

function openDetailsModal(eventId) {
    const events = getEvents();
    let event = null;
    for (let i = 0; i < events.length; i++) {
        if (events[i].id === eventId) {
            event = events[i];
            break;
        }
    }
    if (!event) return;

    const detailsBody = document.getElementById("detailsBody");
    if (!detailsBody) return;

    let imgPath = event.image || getCategoryPlaceholder(event.category);
    
    detailsBody.innerHTML = `
        <img class="details-image" src="${imgPath}" alt="${event.title}" onerror="this.src='assets/workshop.jpeg'">
        <span class="details-badge">${event.category}</span>
        <h2 style="font-size: 24px; color: #1a202c; margin-bottom: 15px;">${event.title}</h2>
        <div class="details-meta">
            <div class="details-meta-item"><i class="fa-solid fa-calendar"></i> <span>${formatDate(event.date)}</span></div>
            <div class="details-meta-item"><i class="fa-solid fa-clock"></i> <span>${event.time || '10:00 AM'}</span></div>
            <div class="details-meta-item"><i class="fa-solid fa-location-dot"></i> <span>${event.location}</span></div>
            <div class="details-meta-item"><i class="fa-solid fa-users"></i> <span>${event.attendees || 0} / ${event.maxAttendees || 100} Attendees</span></div>
        </div>
        <p class="details-description">${event.description || 'No description provided.'}</p>
    `;

    detailsRegisterBtn.onclick = function () {
        detailsModal.style.display = "none";
        handleUserRegistrationTrigger(eventId);
    };

    const currentUser = getCurrentUser();
    const registrations = getRegistrations();
    let alreadyReg = false;
    for (let i = 0; i < registrations.length; i++) {
        if (registrations[i].userEmail === currentUser.email && registrations[i].eventId === eventId) {
            alreadyReg = true;
            break;
        }
    }
    let isFull = (event.attendees || 0) >= (event.maxAttendees || 100);

    if (alreadyReg) {
        detailsRegisterBtn.innerText = "✓ Registered";
        detailsRegisterBtn.disabled = true;
        detailsRegisterBtn.style.background = "#22C55E";
    } else if (isFull) {
        detailsRegisterBtn.innerText = "Full";
        detailsRegisterBtn.disabled = true;
        detailsRegisterBtn.style.background = "#ef4444";
    } else {
        detailsRegisterBtn.innerText = "Register";
        detailsRegisterBtn.disabled = false;
        detailsRegisterBtn.style.background = "#6C3EF4";
    }

    if (detailsModal) detailsModal.style.display = "flex";
}

if (closeDetails) closeDetails.addEventListener("click", () => detailsModal.style.display = "none");
if (detailsCancelBtn) detailsCancelBtn.addEventListener("click", () => detailsModal.style.display = "none");

/*==========================
      REGISTRATION HANDLER
==========================*/
const confirmRegModal = document.getElementById("confirmRegModal");
const closeConfirmReg = document.getElementById("closeConfirmReg");
const confirmRegCancelBtn = document.getElementById("confirmRegCancelBtn");
const confirmRegConfirmBtn = document.getElementById("confirmRegConfirmBtn");

function handleUserRegistrationTrigger(eventId) {
    const user = getCurrentUser();
    const events = getEvents();
    let event = null;
    for (let i = 0; i < events.length; i++) {
        if (events[i].id === eventId) {
            event = events[i];
            break;
        }
    }
    if (!event) return;

    const registrations = getRegistrations();
    let alreadyReg = false;
    for (let i = 0; i < registrations.length; i++) {
        if (registrations[i].userEmail === user.email && registrations[i].eventId === eventId) {
            alreadyReg = true;
            break;
        }
    }

    if (alreadyReg) {
        showToast("You are already registered.", "info");
        return;
    }
    if ((event.attendees || 0) >= (event.maxAttendees || 100)) {
        showToast("Event is full.", "error");
        return;
    }

    document.getElementById("confirmRegTitle").innerText = "Register for: " + event.title;
    document.getElementById("confirmUserName").innerText = user.name;
    document.getElementById("confirmUserEmail").innerText = user.email;
    document.getElementById("confirmEventDate").innerText = formatDate(event.date) + " at " + (event.time || '10:00 AM');

    if (confirmRegModal) confirmRegModal.style.display = "flex";

    confirmRegConfirmBtn.onclick = function () {
        const currentEvents = getEvents();
        let dbEvent = null;
        for (let i = 0; i < currentEvents.length; i++) {
            if (currentEvents[i].id === eventId) {
                dbEvent = currentEvents[i];
                break;
            }
        }
        
        if (dbEvent.attendees >= dbEvent.maxAttendees) {
            showToast("Event is full.", "error");
            confirmRegModal.style.display = "none";
            return;
        }

        registrations.push({ userEmail: user.email, eventId: eventId, registeredAt: new Date().toISOString() });
        saveRegistrations(registrations);

        dbEvent.attendees = (dbEvent.attendees || 0) + 1;
        saveEvents(currentEvents);

        confirmRegModal.style.display = "none";
        showToast("Successfully registered!", "success");
        renderUserEvents();
        renderMyRegistrations();
    };
}

if (closeConfirmReg) closeConfirmReg.addEventListener("click", () => confirmRegModal.style.display = "none");
if (confirmRegCancelBtn) confirmRegCancelBtn.addEventListener("click", () => confirmRegModal.style.display = "none");

/*==========================
      PROFILE MENU
==========================*/
const profileBtn = document.getElementById("profileBtn");
const profileMenu = document.getElementById("profileMenu");

if (profileBtn) {
    profileBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        profileMenu.style.display = profileMenu.style.display === "block" ? "none" : "block";
    });
}

document.addEventListener("click", () => { if (profileMenu) profileMenu.style.display = "none"; });

/*==========================
      LOGOUT FLOW
==========================*/
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
        if (confirm("Are you sure you want to log out?")) {
            setCurrentUser(null);
            showToast("Logged out successfully", "info");
            setTimeout(() => { window.location.href = "home.html"; }, 500);
        }
    });
}

// Listen for workspace JSON synchronization event
window.addEventListener("events-synced", function () {
    renderUserEvents();
    renderMyRegistrations();
});
