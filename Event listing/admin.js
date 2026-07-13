let isEditMode = false, editEventId = null, uploadedImageDataUrl = "";

document.addEventListener("DOMContentLoaded", () => {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== "admin") {
        document.body.className = "nice-try-active";
        document.body.innerHTML = `
            <div class="nice-try-container">
                <div class="nice-try-card">
                    <div class="nice-try-icon"><i class="fa-solid fa-user-shield"></i></div>
                    <h1>Nice Try! ✋</h1>
                    <p>You do not have administrative clearance to access the control deck.</p>
                    <button onclick="window.location.href='home.html'" class="nice-try-btn">
                        <i class="fa-solid fa-house"></i> Return Home
                    </button>
                </div>
            </div>`;
        return;
    }

    updateAdminProfileInfo(currentUser);
    renderAdminTable();

    document.getElementById("eventImageFile")?.addEventListener("change", e => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = evt => { uploadedImageDataUrl = evt.target.result; };
            reader.readAsDataURL(file);
        } else {
            uploadedImageDataUrl = "";
        }
    });

    const modal = document.getElementById("eventModal"), form = document.getElementById("eventForm");
    document.querySelector(".add-btn")?.addEventListener("click", () => {
        isEditMode = false;
        editEventId = null;
        form.reset();
        uploadedImageDataUrl = "";
        document.querySelector(".event-modal h2").innerText = "Add New Event";
        document.getElementById("saveBtn").innerText = "Create Event";
        modal.style.display = "flex";
    });

    document.querySelector(".close-event")?.addEventListener("click", () => modal.style.display = "none");
    window.addEventListener("click", e => { if (e.target === modal) modal.style.display = "none"; });
    form?.addEventListener("submit", e => { e.preventDefault(); handleEventSubmit(); });

    document.getElementById("dashboardLink")?.addEventListener("click", () => {
        document.getElementById("dashboardLink").classList.add("active");
        document.getElementById("eventsLink").classList.remove("active");
        document.getElementById("dashboardSection").scrollIntoView({ behavior: "smooth" });
    });

    document.getElementById("eventsLink")?.addEventListener("click", () => {
        document.getElementById("eventsLink").classList.add("active");
        document.getElementById("dashboardLink").classList.remove("active");
        document.getElementById("eventsSection").scrollIntoView({ behavior: "smooth" });
    });

    document.getElementById("logoutBtn")?.addEventListener("click", e => {
        e.preventDefault();
        setCurrentUser(null);
        showToast("Logging out...", "info");
        setTimeout(() => { window.location.href = "home.html"; }, 800);
    });
});

function updateAdminProfileInfo(admin) {
    const profileBtn = document.getElementById("profileBtn"), dropdown = document.getElementById("profileMenu");
    if (!profileBtn || !dropdown) return;
    const avatar = profileBtn.querySelector(".avatar");
    if (avatar && admin.name) {
        avatar.innerText = admin.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
    }
    const nameEl = profileBtn.querySelector("h4");
    if (nameEl) nameEl.innerText = admin.name;

    const ddAvatar = dropdown.querySelector(".avatar"), ddName = dropdown.querySelector("h4"), ddRole = dropdown.querySelector("p");
    if (ddAvatar && avatar) ddAvatar.innerText = avatar.innerText;
    if (ddName) ddName.innerText = admin.name;
    if (ddRole) ddRole.innerText = admin.designation || "Administrator";

    profileBtn.addEventListener("click", e => {
        e.stopPropagation();
        dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
    });
    document.addEventListener("click", () => { dropdown.style.display = "none"; });
}

function renderAdminTable() {
    const tableBody = document.getElementById("eventTableBody");
    if (!tableBody) return;
    const events = getEvents();

    if (!events.length) {
        tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #718096;">No events created yet. Click "Add Event" to get started.</td></tr>`;
        return;
    }

    tableBody.innerHTML = events.map(e => `
        <tr>
            <td data-label="Event Name" style="font-weight: 500; color: #1a202c;">${e.title}</td>
            <td data-label="Category"><span class="details-badge">${e.category}</span></td>
            <td data-label="Date & Time">${formatDate(e.date)} at ${e.time || '10:00 AM'}</td>
            <td data-label="Location">${e.location}</td>
            <td data-label="Attendees">👥 ${e.attendees || 0} / ${e.maxAttendees || 100}</td>
            <td>
                <button class="edit-btn action-edit" data-id="${e.id}"><i class="fa-solid fa-pen"></i> Edit</button>
                <button class="delete-btn action-delete" data-id="${e.id}"><i class="fa-solid fa-trash"></i> Delete</button>
            </td>
        </tr>`).join("");

    tableBody.querySelectorAll(".action-edit").forEach(btn => {
        btn.addEventListener("click", () => prepareEditForm(parseInt(btn.getAttribute("data-id"))));
    });

    tableBody.querySelectorAll(".action-delete").forEach(btn => {
        btn.addEventListener("click", () => deleteEventInstantly(parseInt(btn.getAttribute("data-id"))));
    });
}

function prepareEditForm(eventId) {
    const event = getEvents().find(e => e.id === eventId);
    if (!event) return;

    isEditMode = true;
    editEventId = eventId;
    uploadedImageDataUrl = "";

    document.getElementById("eventName").value = event.title;
    document.getElementById("eventDate").value = event.date;
    document.getElementById("eventTime").value = event.time || "10:00 AM";
    document.getElementById("eventLocation").value = event.location;
    document.getElementById("eventCategory").value = event.category;
    document.getElementById("eventSeats").value = event.maxAttendees;
    document.getElementById("eventImageURL").value = event.image?.indexOf("data:") === 0 ? "" : event.image || "";
    document.getElementById("eventDescription").value = event.description || "";
    document.getElementById("eventImageFile").value = "";

    document.querySelector(".event-modal h2").innerText = "Edit Event";
    document.getElementById("saveBtn").innerText = "Update Event";
    document.getElementById("eventModal").style.display = "flex";
}

function handleEventSubmit() {
    const name = document.getElementById("eventName").value.trim();
    const date = document.getElementById("eventDate").value;
    const time = document.getElementById("eventTime").value.trim();
    const location = document.getElementById("eventLocation").value.trim();
    const category = document.getElementById("eventCategory").value;
    const seats = parseInt(document.getElementById("eventSeats").value);
    const imageURL = document.getElementById("eventImageURL").value.trim();
    const description = document.getElementById("eventDescription").value.trim();

    if (!name || !date || !time || !location || !category || isNaN(seats) || seats <= 0 || !description) {
        showToast("Please fill all required fields correctly.", "error");
        return;
    }

    const events = getEvents();
    const finalImage = uploadedImageDataUrl || imageURL || getCategoryPlaceholder(category);

    if (isEditMode) {
        const ev = events.find(e => e.id === editEventId);
        if (!ev) return;
        if (seats < ev.attendees) {
            showToast(`Seats count cannot be less than registered attendees (${ev.attendees}).`, "error");
            return;
        }
        Object.assign(ev, { title: name, date, time, location, category, maxAttendees: seats, image: finalImage, description });
        showToast("Event updated successfully", "success");
    } else {
        const nextId = events.length ? Math.max(...events.map(e => e.id)) + 1 : 1;
        events.push({ id: nextId, title: name, description, category, date, time, location, image: finalImage, maxAttendees: seats, attendees: 0 });
        showToast("Event created successfully", "success");
    }

    saveEvents(events);
    document.getElementById("eventModal").style.display = "none";
    document.getElementById("eventForm").reset();
    uploadedImageDataUrl = "";
    renderAdminTable();
}

function deleteEventInstantly(eventId) {
    saveEvents(getEvents().filter(e => e.id !== eventId));
    saveRegistrations(getRegistrations().filter(r => r.eventId !== eventId));
    showToast("Event deleted successfully", "success");
    renderAdminTable();
}

window.addEventListener("events-synced", renderAdminTable);