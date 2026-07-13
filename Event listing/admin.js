document.addEventListener("DOMContentLoaded", function () {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== "admin") {
        alert("Access Denied. Admin privileges required.");
        window.location.href = "home.html";
        return;
    }

    updateAdminProfileInfo(currentUser);
    renderAdminTable();

    uploadedImageDataUrl = "";

    const imgFileInput = document.getElementById("eventImageFile");
    if (imgFileInput) {
        imgFileInput.addEventListener("change", function (e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (evt) {
                    uploadedImageDataUrl = evt.target.result;
                };
                reader.readAsDataURL(file);
            } else {
                uploadedImageDataUrl = "";
            }
        });
    }

    const addBtn = document.querySelector(".add-btn");
    const eventModal = document.getElementById("eventModal");
    const closeEvent = document.querySelector(".close-event");
    const saveBtn = document.getElementById("saveBtn");
    const eventForm = document.getElementById("eventForm");

    if (addBtn) {
        addBtn.addEventListener("click", function () {
            isEditMode = false;
            editEventId = null;
            eventForm.reset();
            uploadedImageDataUrl = "";
            document.querySelector(".event-modal h2").innerText = "Add New Event";
            saveBtn.innerText = "Create Event";
            eventModal.style.display = "flex";
        });
    }

    if (closeEvent) closeEvent.addEventListener("click", () => eventModal.style.display = "none");

    window.addEventListener("click", function (e) {
        if (e.target === eventModal) eventModal.style.display = "none";
    });

    if (eventForm) {
        eventForm.addEventListener("submit", function (e) {
            e.preventDefault();
            handleEventSubmit();
        });
    }

    setupSidebarNavigation();
    setupLogoutTrigger();
});

/*==========================
      GLOBAL VARIABLES
==========================*/
let isEditMode = false;
let editEventId = null;
let uploadedImageDataUrl = "";

/*==========================
      PROFILE VIEW RENDER
==========================*/
function updateAdminProfileInfo(admin) {
    const profileBtn = document.getElementById("profileBtn");
    if (!profileBtn) return;

    const avatar = profileBtn.querySelector(".avatar");
    if (avatar && admin.name) {
        let nameParts = admin.name.split(" ");
        let initials = "";
        if (nameParts.length > 0 && nameParts[0]) initials += nameParts[0][0];
        if (nameParts.length > 1 && nameParts[1]) initials += nameParts[1][0];
        avatar.innerText = initials.toUpperCase();
    }

    const nameEl = profileBtn.querySelector("h4");
    if (nameEl) nameEl.innerText = admin.name;

    const dropdown = document.getElementById("profileMenu");
    if (dropdown) {
        const dropdownAvatar = dropdown.querySelector(".avatar");
        const dropdownName = dropdown.querySelector("h4");
        const dropdownRole = dropdown.querySelector("p");

        if (dropdownAvatar && admin.name) dropdownAvatar.innerText = avatar.innerText;
        if (dropdownName) dropdownName.innerText = admin.name;
        if (dropdownRole) dropdownRole.innerText = admin.designation || "Administrator";
    }

    profileBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
    });

    document.addEventListener("click", () => { if (dropdown) dropdown.style.display = "none"; });
}

/*==========================
      RENDER ADMIN TABLE
==========================*/
function renderAdminTable() {
    const tableBody = document.getElementById("eventTableBody");
    if (!tableBody) return;

    tableBody.innerHTML = "";

    const events = getEvents();

    if (events.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #718096;">No events created yet. Click "Add Event" to get started.</td></tr>`;
        return;
    }

    for (let i = 0; i < events.length; i++) {
        let event = events[i];
        const row = document.createElement("tr");
        row.innerHTML = `
            <td data-label="Event Name" style="font-weight: 500; color: #1a202c;">${event.title}</td>
            <td data-label="Category"><span class="details-badge">${event.category}</span></td>
            <td data-label="Date & Time">${formatDate(event.date)} at ${event.time || '10:00 AM'}</td>
            <td data-label="Location">${event.location}</td>
            <td data-label="Attendees">👥 ${event.attendees || 0} / ${event.maxAttendees || 100}</td>
            <td>
                <button class="edit-btn action-edit" data-id="${event.id}">
                    <i class="fa-solid fa-pen"></i> Edit
                </button>
                <button class="delete-btn action-delete" data-id="${event.id}">
                    <i class="fa-solid fa-trash"></i> Delete
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    }

    const editBtns = document.querySelectorAll(".action-edit");
    for (let i = 0; i < editBtns.length; i++) {
        editBtns[i].addEventListener("click", function () {
            let id = parseInt(this.getAttribute("data-id"));
            prepareEditForm(id);
        });
    }

    const deleteBtns = document.querySelectorAll(".action-delete");
    for (let i = 0; i < deleteBtns.length; i++) {
        deleteBtns[i].addEventListener("click", function () {
            let id = parseInt(this.getAttribute("data-id"));
            deleteEventInstantly(id);
        });
    }
}

/*==========================
      PREPARE EDIT FORM
==========================*/
function prepareEditForm(eventId) {
    const events = getEvents();
    let event = null;
    for (let i = 0; i < events.length; i++) {
        if (events[i].id === eventId) {
            event = events[i];
            break;
        }
    }
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
    
    let originalURL = event.image;
    if (originalURL && originalURL.indexOf("data:") === 0) originalURL = "";
    document.getElementById("eventImageURL").value = originalURL;
    document.getElementById("eventDescription").value = event.description || "";
    document.getElementById("eventImageFile").value = "";

    document.querySelector(".event-modal h2").innerText = "Edit Event";
    document.getElementById("saveBtn").innerText = "Update Event";
    document.getElementById("eventModal").style.display = "flex";
}

/*==========================
      HANDLE SUBMISSION
==========================*/
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

    let finalImage = "";
    if (uploadedImageDataUrl) {
        finalImage = uploadedImageDataUrl;
    } else if (imageURL) {
        finalImage = imageURL;
    } else {
        finalImage = getCategoryPlaceholder(category);
    }

    if (isEditMode) {
        let eventIndex = -1;
        for (let i = 0; i < events.length; i++) {
            if (events[i].id === editEventId) {
                eventIndex = i;
                break;
            }
        }
        if (eventIndex === -1) return;

        let originalEvent = events[eventIndex];
        if (seats < originalEvent.attendees) {
            showToast("Seats count cannot be less than registered attendees (" + originalEvent.attendees + ").", "error");
            return;
        }

        originalEvent.title = name;
        originalEvent.date = date;
        originalEvent.time = time;
        originalEvent.location = location;
        originalEvent.category = category;
        originalEvent.maxAttendees = seats;
        originalEvent.image = finalImage;
        originalEvent.description = description;

        saveEvents(events);
        showToast("Event updated successfully", "success");
    } else {
        let newId = 1;
        if (events.length > 0) {
            let maxId = events[0].id;
            for (let i = 1; i < events.length; i++) {
                if (events[i].id > maxId) maxId = events[i].id;
            }
            newId = maxId + 1;
        }
        
        events.push({
            id: newId,
            title: name,
            description: description,
            category: category,
            date: date,
            time: time,
            location: location,
            image: finalImage,
            maxAttendees: seats,
            attendees: 0
        });

        saveEvents(events);
        showToast("Event created successfully", "success");
    }

    document.getElementById("eventModal").style.display = "none";
    document.getElementById("eventForm").reset();
    uploadedImageDataUrl = "";
    renderAdminTable();
}

/*==========================
      DELETE HANDLER
==========================*/
function deleteEventInstantly(eventId) {
    let events = getEvents();
    let newEvents = [];
    for (let i = 0; i < events.length; i++) {
        if (events[i].id !== eventId) newEvents.push(events[i]);
    }
    saveEvents(newEvents);

    let registrations = getRegistrations();
    let newRegistrations = [];
    for (let i = 0; i < registrations.length; i++) {
        if (registrations[i].eventId !== eventId) newRegistrations.push(registrations[i]);
    }
    saveRegistrations(newRegistrations);

    showToast("Event deleted successfully", "success");
    renderAdminTable();
}

/*==========================
      LOGOUT HANDLER
==========================*/
function setupLogoutTrigger() {
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", function (e) {
            e.preventDefault();
            setCurrentUser(null);
            showToast("Logging out...", "info");
            setTimeout(function () {
                window.location.href = "home.html";
            }, 800);
        });
    }
}

/*==========================
      SIDEBAR NAVIGATION
==========================*/
function setupSidebarNavigation() {
    const dashboardLink = document.getElementById("dashboardLink");
    const eventsLink = document.getElementById("eventsLink");
    const dashboardSection = document.getElementById("dashboardSection");
    const eventsSection = document.getElementById("eventsSection");

    dashboardLink.addEventListener("click", function () {
        dashboardLink.classList.add("active");
        eventsLink.classList.remove("active");
        dashboardSection.scrollIntoView({ behavior: "smooth" });
    });

    eventsLink.addEventListener("click", function () {
        eventsLink.classList.add("active");
        dashboardLink.classList.remove("active");
        eventsSection.scrollIntoView({ behavior: "smooth" });
    });
}