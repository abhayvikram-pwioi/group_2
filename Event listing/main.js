document.addEventListener("DOMContentLoaded", () => {
    updateNavbar();
    renderHomeEvents();
    ["homeSearchInput", "homeDateFilter", "homeCategoryFilter"].forEach(id => {
        document.getElementById(id)?.addEventListener(id === "homeSearchInput" ? "input" : "change", renderHomeEvents);
    });
    document.getElementById("homeResetBtn")?.addEventListener("click", () => {
        ["homeSearchInput", "homeDateFilter", "homeCategoryFilter"].forEach(id => document.getElementById(id).value = "");
        renderHomeEvents();
        showToast("Filters reset", "info");
    });
    initChatbot();
});
function renderHomeEvents() {
    const container = document.getElementById("eventContainer");
    if (!container) return;
    container.innerHTML = "";
    const events = getEvents();
    const search = document.getElementById("homeSearchInput")?.value.toLowerCase().trim() || "";
    const date = document.getElementById("homeDateFilter")?.value || "";
    const cat = document.getElementById("homeCategoryFilter")?.value || "";
    const filtered = events.filter(e => 
        e.title.toLowerCase().includes(search) &&
        (!cat || e.category === cat) &&
        (!date || e.date === date)
    );
    if (!filtered.length) {
        container.innerHTML = "<div class='no-events-msg'>No events found matching your criteria.</div>";
        return;
    }
    filtered.forEach(e => {
        const card = document.createElement("div");
        card.className = "event-card";
        card.innerHTML = `
            <div class="event-image"><img src="${e.image || getCategoryPlaceholder(e.category)}" alt="${e.title}" onerror="this.src='assets/workshop.jpeg'"></div>
            <div class="event-content">
                <span class="details-badge">${e.category}</span><h3>${e.title}</h3>
                <div class="event-info">
                    <p><i class="fa-solid fa-calendar"></i> ${formatDate(e.date)}</p>
                    <p><i class="fa-solid fa-clock"></i> ${e.time || '10:00 AM'}</p>
                </div><p class="location"><i class="fa-solid fa-location-dot"></i> ${e.location}</p>
                <div class="bottom"><span>👥 ${e.attendees || 0} / ${e.maxAttendees || 100}</span>
                    <button class="reg-btn-action" data-id="${e.id}">Register</button>
                </div>
            </div>`;
        card.addEventListener("click", ev => { if (!ev.target.classList.contains("reg-btn-action")) openDetailsModal(e.id); });
        container.appendChild(card);
    });
    container.querySelectorAll(".reg-btn-action").forEach(btn => {
        btn.addEventListener("click", ev => { ev.stopPropagation(); handleRegistrationTrigger(parseInt(btn.getAttribute("data-id"))); });
    });
}
function updateNavbar() {
    const navRight = document.getElementById("navRight");
    if (!navRight) return;
    const user = getCurrentUser();
    if (user) {
        navRight.innerHTML = `<span style="font-weight: 500; color: #4a5568; margin-right: 10px;">Hi, ${user.name}</span>
            <a href="${user.role === 'admin' ? 'admin.html' : 'user.html'}" class="login-btn" style="width: auto; padding: 0 15px;">Dashboard</a>
            <a href="#" id="navLogoutBtn" class="signup-btn">Log Out</a>`;
        document.getElementById("navLogoutBtn").addEventListener("click", e => {
            e.preventDefault();
            if (confirm("Are you sure you want to log out?")) {
                setCurrentUser(null); showToast("Logged out successfully", "info"); window.location.reload();
            }
        });
    } else {
        navRight.innerHTML = `<a href="#" id="loginBtn" class="login-btn">Log In</a>
            <a href="#" id="signupBtn" class="signup-btn">Sign Up</a>`;
        document.getElementById("loginBtn")?.addEventListener("click", e => { e.preventDefault(); loginModal.style.display = "flex"; });
        document.getElementById("signupBtn")?.addEventListener("click", e => {
            e.preventDefault(); roleModal.style.display = "flex";
            ["roleStep", "userStep", "adminStep", "successStep"].forEach((id, i) => document.getElementById(id).style.display = i === 0 ? "block" : "none");
        });
    }
}
const loginModal = document.getElementById("loginModal"), roleModal = document.getElementById("roleModal");
const detailsModal = document.getElementById("detailsModal"), dRegisterBtn = document.getElementById("detailsRegisterBtn");
const confirmModal = document.getElementById("confirmRegModal"), confirmBtn = document.getElementById("confirmRegConfirmBtn");
const close = (id, el, isCls) => (isCls ? document.querySelector("." + id) : document.getElementById(id))?.addEventListener("click", () => el.style.display = "none");
close("closeLogin", loginModal); close("close-role", roleModal, true);
close("closeDetails", detailsModal); close("detailsCancelBtn", detailsModal);
close("closeConfirmReg", confirmModal); close("closeConfirmReg", confirmModal);
window.addEventListener("click", e => { [loginModal, roleModal].forEach(m => { if (e.target === m) m.style.display = "none"; }); });
const userCard = document.getElementById("userCard"), adminCard = document.getElementById("adminCard"), continueBtn = document.getElementById("continueBtn"), roleStep = document.getElementById("roleStep"), userStep = document.getElementById("userStep"), adminStep = document.getElementById("adminStep");
let selectedRole = "";
userCard?.addEventListener("click", () => { selectedRole = "user"; userCard.classList.add("active"); adminCard?.classList.remove("active"); });
adminCard?.addEventListener("click", () => { selectedRole = "admin"; adminCard.classList.add("active"); userCard?.classList.remove("active"); });
continueBtn?.addEventListener("click", () => {
    if (!selectedRole) return showToast("Please select your role.", "error");
    roleStep.style.display = "none"; (selectedRole === "user" ? userStep : adminStep).style.display = "block";
});
["userBackBtn", "adminBackBtn"].forEach(id => document.getElementById(id)?.addEventListener("click", () => {
    (id === "userBackBtn" ? userStep : adminStep).style.display = "none"; roleStep.style.display = "block";
}));
document.getElementById("goLoginBtn")?.addEventListener("click", () => { roleModal.style.display = "none"; loginModal.style.display = "flex"; });
function handleSignupSubmit(form, role, getFields) {
    form?.addEventListener("submit", e => {
        e.preventDefault();
        const data = getFields(form.querySelectorAll("input")), users = getUsers();
        if (Object.values(data).some(v => !v)) return showToast("Please fill all fields.", "error");
        if (data.password !== data.confirmPassword) return showToast("Passwords do not match.", "error");
        if (users.some(u => u.email === data.email)) return showToast("Email already registered.", "error");
        users.push({ role, ...data });
        saveUsers(users);
        (role === "user" ? userStep : adminStep).style.display = "none";
        document.getElementById("successStep").style.display = "block";
        form.reset();
    });
}
const fVal = (f, idx) => f[idx].value.trim();
handleSignupSubmit(document.getElementById("userForm"), "user", inputs => ({
    name: fVal(inputs, 0), email: fVal(inputs, 1).toLowerCase(),
    phone: fVal(inputs, 2), college: fVal(inputs, 3),
    password: inputs[4].value, confirmPassword: inputs[5].value
}));
handleSignupSubmit(document.getElementById("adminForm"), "admin", inputs => ({
    org: fVal(inputs, 0), name: fVal(inputs, 1), email: fVal(inputs, 2).toLowerCase(),
    phone: fVal(inputs, 3), designation: fVal(inputs, 4),
    password: inputs[5].value, confirmPassword: inputs[6].value
}));
document.querySelector("#loginModal form")?.addEventListener("submit", e => {
    e.preventDefault();
    const inputs = e.target.querySelectorAll("input"), email = inputs[0].value.trim().toLowerCase(), password = inputs[1].value;
    if (!email || !password) return showToast("Please enter email and password.", "error");
    const found = getUsers().find(u => u.email === email && u.password === password);
    if (!found) return showToast("Invalid email or password.", "error");
    setCurrentUser(found);
    showToast("Login successful! Redirecting...", "success");
    setTimeout(() => { loginModal.style.display = "none"; window.location.href = found.role === "admin" ? "admin.html" : "user.html"; }, 1000);
});
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
        </div><p class="details-description">${event.description || 'No description provided.'}</p>`;
    dRegisterBtn.onclick = () => { detailsModal.style.display = "none"; handleRegistrationTrigger(eventId); };
    const user = getCurrentUser();
    const registered = user && getRegistrations().some(r => r.userEmail === user.email && r.eventId === eventId);
    dRegisterBtn.innerText = registered ? "✓ Registered" : "Register";
    dRegisterBtn.disabled = !!registered;
    dRegisterBtn.style.background = registered ? "#22C55E" : "#6C3EF4";
    if (detailsModal) detailsModal.style.display = "flex";
}
function handleRegistrationTrigger(eventId) {
    const user = getCurrentUser();
    if (!user) {
        showToast("Please log in to register for events.", "info");
        if (loginModal) loginModal.style.display = "flex";
        return;
    }
    if (user.role === "admin") return showToast("Admins cannot register for events.", "error");
    const event = getEvents().find(e => e.id === eventId), regs = getRegistrations();
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
        renderHomeEvents();
    };
}
window.addEventListener("events-synced", renderHomeEvents);