document.addEventListener("DOMContentLoaded", function () {
    updateNavbar();
    renderHomeEvents();

    const searchInput = document.getElementById("homeSearchInput");
    const dateFilter = document.getElementById("homeDateFilter");
    const categoryFilter = document.getElementById("homeCategoryFilter");
    const resetBtn = document.getElementById("homeResetBtn");

    if (searchInput) searchInput.addEventListener("input", renderHomeEvents);
    if (dateFilter) dateFilter.addEventListener("change", renderHomeEvents);
    if (categoryFilter) categoryFilter.addEventListener("change", renderHomeEvents);
    
    if (resetBtn) {
        resetBtn.addEventListener("click", function () {
            searchInput.value = "";
            dateFilter.value = "";
            categoryFilter.value = "";
            renderHomeEvents();
            showToast("Filters reset", "info");
        });
    }

    // Initialize shared chatbot from db.js
    initChatbot();
});

/*==========================
      DYNAMIC EVENT RENDER
==========================*/
function renderHomeEvents() {
    const container = document.getElementById("eventContainer");
    if (!container) return;

    container.innerHTML = "";

    const events = getEvents();
    const searchQuery = document.getElementById("homeSearchInput") ? document.getElementById("homeSearchInput").value.toLowerCase().trim() : "";
    const dateQuery = document.getElementById("homeDateFilter") ? document.getElementById("homeDateFilter").value : "";
    const categoryQuery = document.getElementById("homeCategoryFilter") ? document.getElementById("homeCategoryFilter").value : "";

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
        container.innerHTML = "<div class='no-events-msg'>No events found matching your criteria.</div>";
        return;
    }

    for (let i = 0; i < filteredEvents.length; i++) {
        let event = filteredEvents[i];
        const card = document.createElement("div");
        card.className = "event-card";

        let imgPath = event.image || getCategoryPlaceholder(event.category);

        card.innerHTML = `
            <div class="event-image">
                <img src="${imgPath}" alt="${event.title}" onerror="this.src='assets/workshop.jpeg'">
            </div>
            <div class="event-content">
                <span class="details-badge">${event.category}</span>
                <h3>${event.title}</h3>
                <div class="event-info">
                    <p><i class="fa-solid fa-calendar"></i> ${formatDate(event.date)}</p>
                    <p><i class="fa-solid fa-clock"></i> ${event.time || '10:00 AM'}</p>
                </div>
                <p class="location"><i class="fa-solid fa-location-dot"></i> ${event.location}</p>
                <div class="bottom">
                    <span>👥 ${event.attendees || 0} / ${event.maxAttendees || 100}</span>
                    <button class="reg-btn-action" data-id="${event.id}">Register</button>
                </div>
            </div>
        `;

        card.addEventListener("click", function (e) {
            if (!e.target.classList.contains("reg-btn-action")) {
                openDetailsModal(event.id);
            }
        });

        container.appendChild(card);
    }

    const regButtons = document.querySelectorAll(".reg-btn-action");
    for (let i = 0; i < regButtons.length; i++) {
        regButtons[i].addEventListener("click", function (e) {
            e.stopPropagation();
            let eventId = parseInt(this.getAttribute("data-id"));
            handleRegistrationTrigger(eventId);
        });
    }
}

/*==========================
      DYNAMIC NAVBAR STATE
==========================*/
function updateNavbar() {
    const navRight = document.getElementById("navRight");
    if (!navRight) return;

    const user = getCurrentUser();
    if (user) {
        let dashboardUrl = user.role === "admin" ? "admin.html" : "user.html";
        navRight.innerHTML = `
            <span style="font-weight: 500; color: #4a5568; margin-right: 10px;">Hi, ${user.name}</span>
            <a href="${dashboardUrl}" class="login-btn" style="width: auto; padding: 0 15px;">Dashboard</a>
            <a href="#" id="navLogoutBtn" class="signup-btn">Log Out</a>
        `;
        document.getElementById("navLogoutBtn").addEventListener("click", function (e) {
            e.preventDefault();
            if (confirm("Are you sure you want to log out?")) {
                setCurrentUser(null);
                showToast("Logged out successfully", "info");
                window.location.reload();
            }
        });
    } else {
        navRight.innerHTML = `
            <a href="#" id="loginBtn" class="login-btn">Log In</a>
            <a href="#" id="signupBtn" class="signup-btn">Sign Up</a>
        `;
        bindAuthModalTriggers();
    }
}

/*==========================
      AUTH MODAL TRIGGERS
==========================*/
const loginModal = document.getElementById("loginModal");
const roleModal = document.getElementById("roleModal");
const closeLogin = document.getElementById("closeLogin");
const closeRole = document.querySelector(".close-role");
const goLoginBtn = document.getElementById("goLoginBtn");

function bindAuthModalTriggers() {
    const loginBtn = document.getElementById("loginBtn");
    const signupBtn = document.getElementById("signupBtn");

    if (loginBtn) {
        loginBtn.addEventListener("click", function (e) {
            e.preventDefault();
            if (loginModal) loginModal.style.display = "flex";
        });
    }
    if (signupBtn) {
        signupBtn.addEventListener("click", function (e) {
            e.preventDefault();
            if (roleModal) {
                roleModal.style.display = "flex";
                document.getElementById("roleStep").style.display = "block";
                document.getElementById("userStep").style.display = "none";
                document.getElementById("adminStep").style.display = "none";
                document.getElementById("successStep").style.display = "none";
            }
        });
    }
}

if (closeLogin) closeLogin.addEventListener("click", () => loginModal.style.display = "none");
if (closeRole) closeRole.addEventListener("click", () => roleModal.style.display = "none");

window.addEventListener("click", function (e) {
    if (e.target === loginModal) loginModal.style.display = "none";
    if (e.target === roleModal) roleModal.style.display = "none";
});

/*==========================
      ROLE SIGNUP FLOW
==========================*/
const userCard = document.getElementById("userCard");
const adminCard = document.getElementById("adminCard");
const continueBtn = document.getElementById("continueBtn");
const roleStep = document.getElementById("roleStep");
const userStep = document.getElementById("userStep");
const adminStep = document.getElementById("adminStep");
const userBackBtn = document.getElementById("userBackBtn");
const adminBackBtn = document.getElementById("adminBackBtn");

let selectedRole = "";

if (userCard) {
    userCard.addEventListener("click", function () {
        selectedRole = "user";
        userCard.classList.add("active");
        if (adminCard) adminCard.classList.remove("active");
    });
}
if (adminCard) {
    adminCard.addEventListener("click", function () {
        selectedRole = "admin";
        adminCard.classList.add("active");
        if (userCard) userCard.classList.remove("active");
    });
}
if (continueBtn) {
    continueBtn.addEventListener("click", function () {
        if (selectedRole === "") {
            showToast("Please select your role.", "error");
            return;
        }
        roleStep.style.display = "none";
        if (selectedRole === "user") {
            userStep.style.display = "block";
        } else {
            adminStep.style.display = "block";
        }
    });
}

if (userBackBtn) userBackBtn.addEventListener("click", () => { userStep.style.display = "none"; roleStep.style.display = "block"; });
if (adminBackBtn) adminBackBtn.addEventListener("click", () => { adminStep.style.display = "none"; roleStep.style.display = "block"; });

// User Signup Submission
const userForm = document.getElementById("userForm");
if (userForm) {
    userForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const inputs = userForm.querySelectorAll("input");
        const fullName = inputs[0].value.trim();
        const email = inputs[1].value.trim().toLowerCase();
        const phone = inputs[2].value.trim();
        const college = inputs[3].value.trim();
        const password = inputs[4].value;
        const confirmPassword = inputs[5].value;

        if (!fullName || !email || !phone || !college || !password || !confirmPassword) {
            showToast("Please fill all fields.", "error");
            return;
        }
        if (password !== confirmPassword) {
            showToast("Passwords do not match.", "error");
            return;
        }

        const users = getUsers();
        let emailExists = false;
        for (let i = 0; i < users.length; i++) {
            if (users[i].email === email) {
                emailExists = true;
                break;
            }
        }
        if (emailExists) {
            showToast("Email already registered.", "error");
            return;
        }

        users.push({ name: fullName, email: email, phone: phone, college: college, password: password, role: "user" });
        saveUsers(users);

        userStep.style.display = "none";
        document.getElementById("successStep").style.display = "block";
        userForm.reset();
    });
}

// Admin Signup Submission
const adminForm = document.getElementById("adminForm");
if (adminForm) {
    adminForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const inputs = adminForm.querySelectorAll("input");
        const orgName = inputs[0].value.trim();
        const adminName = inputs[1].value.trim();
        const email = inputs[2].value.trim().toLowerCase();
        const phone = inputs[3].value.trim();
        const designation = inputs[4].value.trim();
        const password = inputs[5].value;
        const confirmPassword = inputs[6].value;

        if (!orgName || !adminName || !email || !phone || !designation || !password || !confirmPassword) {
            showToast("Please fill all fields.", "error");
            return;
        }
        if (password !== confirmPassword) {
            showToast("Passwords do not match.", "error");
            return;
        }

        const users = getUsers();
        let emailExists = false;
        for (let i = 0; i < users.length; i++) {
            if (users[i].email === email) {
                emailExists = true;
                break;
            }
        }
        if (emailExists) {
            showToast("Email already registered.", "error");
            return;
        }

        users.push({ name: adminName, org: orgName, email: email, phone: phone, designation: designation, password: password, role: "admin" });
        saveUsers(users);

        adminStep.style.display = "none";
        document.getElementById("successStep").style.display = "block";
        adminForm.reset();
    });
}

if (goLoginBtn) goLoginBtn.addEventListener("click", () => { roleModal.style.display = "none"; loginModal.style.display = "flex"; });

/*==========================
      LOGIN FLOW
==========================*/
const loginForm = document.querySelector("#loginModal form");
if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const inputs = loginForm.querySelectorAll("input");
        const email = inputs[0].value.trim().toLowerCase();
        const password = inputs[1].value;

        if (!email || !password) {
            showToast("Please enter email and password.", "error");
            return;
        }

        const users = getUsers();
        let foundUser = null;
        for (let i = 0; i < users.length; i++) {
            if (users[i].email === email && users[i].password === password) {
                foundUser = users[i];
                break;
            }
        }

        if (foundUser) {
            setCurrentUser(foundUser);
            showToast("Login successful! Redirecting...", "success");
            setTimeout(() => {
                loginModal.style.display = "none";
                window.location.href = foundUser.role === "admin" ? "admin.html" : "user.html";
            }, 1000);
        } else {
            showToast("Invalid email or password.", "error");
        }
    });
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
        handleRegistrationTrigger(eventId);
    };

    const currentUser = getCurrentUser();
    if (currentUser) {
        const registrations = getRegistrations();
        let alreadyReg = false;
        for (let i = 0; i < registrations.length; i++) {
            if (registrations[i].userEmail === currentUser.email && registrations[i].eventId === eventId) {
                alreadyReg = true;
                break;
            }
        }
        if (alreadyReg) {
            detailsRegisterBtn.innerText = "✓ Registered";
            detailsRegisterBtn.disabled = true;
            detailsRegisterBtn.style.background = "#22C55E";
        } else {
            detailsRegisterBtn.innerText = "Register";
            detailsRegisterBtn.disabled = false;
            detailsRegisterBtn.style.background = "#6C3EF4";
        }
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

function handleRegistrationTrigger(eventId) {
    const user = getCurrentUser();
    if (!user) {
        showToast("Please log in to register for events.", "info");
        if (loginModal) loginModal.style.display = "flex";
        return;
    }
    if (user.role === "admin") {
        showToast("Admins cannot register for events.", "error");
        return;
    }

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
        renderHomeEvents();
    };
}

if (closeConfirmReg) closeConfirmReg.addEventListener("click", () => confirmRegModal.style.display = "none");
if (confirmRegCancelBtn) confirmRegCancelBtn.addEventListener("click", () => confirmRegModal.style.display = "none");