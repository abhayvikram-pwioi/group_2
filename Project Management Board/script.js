// ==========================================
// STATE MANAGEMENT & LOCAL STORAGE
// ==========================================
let columns = [], tasks = [], activities = [], teamMembers = [];
let currentUser = "Ishika";
let editingTaskId = null, currentDragTaskId = null;

function initData() {
    columns = JSON.parse(localStorage.getItem("trello_columns")) || [
        { id: "backlog", title: "Backlog" }, { id: "todo", title: "To Do" },
        { id: "progress", title: "In Progress" }, { id: "review", title: "Review" }, { id: "done", title: "Done" }
    ];
    tasks = JSON.parse(localStorage.getItem("trello_tasks")) || [
        { id: "task-1", title: "Setup Project Structure", description: "Initialize git repository, HTML skeleton, CSS styling structure and basic app routes.", assignee: "Hasan", priority: "High", dueDate: "2026-07-18", columnId: "todo" },
        { id: "task-2", title: "Design Homepage Mockups", description: "Create visual mocks for the landing page hero section, features list, and call-to-actions.", assignee: "Ishika", priority: "Medium", dueDate: "2026-07-20", columnId: "progress" },
        { id: "task-3", title: "Validate Requirements document", description: "Review current PRD against development capabilities and write implementation plan.", assignee: "Utkarsh", priority: "High", dueDate: "2026-07-15", columnId: "review" },
        { id: "task-4", title: "Create User Personas", description: "Interview target users to identify core requirements and map workflow behaviors.", assignee: "Ishika", priority: "Low", dueDate: "2026-07-14", columnId: "done" }
    ];
    teamMembers = JSON.parse(localStorage.getItem("trello_members")) || [
        { name: "Ishika", role: "Product Manager", color: "purple" },
        { name: "Hasan", role: "Frontend Developer", color: "blue" },
        { name: "Utkarsh", role: "UI Designer", color: "green" }
    ];
    currentUser = localStorage.getItem("trello_current_user") || "Ishika";
    if (!teamMembers.some(m => m.name === currentUser)) currentUser = teamMembers[0]?.name || "Ishika";

    activities = JSON.parse(localStorage.getItem("trello_activities")) || [
        { text: "Ishika moved 'Landing Page Design' to Review", time: "10:30 (July 16)" },
        { text: "Hasan assigned task 'Fix Navbar Bug' to Utkarsh", time: "11:15 (July 16)" },
        { text: "Utkarsh updated deadline for 'Client Dashboard'", time: "14:20 (July 16)" }
    ];
    saveAll();
    renderUserSelector();
    renderAssigneeOptions();
}

const saveAll = () => {
    localStorage.setItem("trello_columns", JSON.stringify(columns));
    localStorage.setItem("trello_tasks", JSON.stringify(tasks));
    localStorage.setItem("trello_activities", JSON.stringify(activities));
    localStorage.setItem("trello_members", JSON.stringify(teamMembers));
    localStorage.setItem("trello_current_user", currentUser);
};

function logActivity(text) {
    const time = `${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (${new Date().toLocaleDateString([], { month: 'short', day: 'numeric' })})`;
    const fullText = text.startsWith(currentUser) ? text : `${currentUser} ${text}`;
    activities.unshift({ text: fullText, time });
    saveAll();
    renderActivities();
}

// HELPERS & SELECTORS
const getInitials = n => n ? n.trim().split(" ").map(p => p[0]).join("").substring(0, 2).toUpperCase() : "?";
const getMemberColor = n => (teamMembers.find(m => m.name === n) || { color: "purple" }).color;
const parseLocalDate = d => d ? new Date(d.split("-")[0], d.split("-")[1] - 1, d.split("-")[2]) : new Date();

function getDeadlineClass(dueDateStr) {
    const diff = Math.ceil((parseLocalDate(dueDateStr).setHours(0,0,0,0) - new Date().setHours(0,0,0,0)) / 86400000);
    return diff < 0 ? "overdue" : diff <= 2 ? "warning" : "safe";
}

const formatDateDisplay = d => d ? parseLocalDate(d).toLocaleDateString("en-US", { day: 'numeric', month: 'short' }) : "";

function showToast(message) {
    const t = document.getElementById("toast");
    t.innerText = message; t.classList.add("show");
    setTimeout(() => t.classList.remove("show"), 2500);
}

function renderUserSelector() {
    const select = document.getElementById("currentUserSelect");
    if (!select) return;
    select.innerHTML = teamMembers.map(m => `<option value="${m.name}" ${m.name === currentUser ? 'selected' : ''}>${m.name}</option>`).join("");
    document.getElementById("currentUserAvatar").innerText = getInitials(currentUser);
}

function renderAssigneeOptions() {
    const filterSel = document.getElementById("filterAssignee");
    const taskSel = document.getElementById("taskAssignee");
    const options = teamMembers.map(m => `<option value="${m.name}">${m.name}</option>`).join("");
    if (filterSel) filterSel.innerHTML = `<option value="">All Assignees</option>${options}`;
    if (taskSel) taskSel.innerHTML = `<option value="">Choose Member</option>${options}`;
}

function changeCurrentUser(name) {
    currentUser = name;
    saveAll();
    renderUserSelector();
    showToast(`Active user: ${currentUser}`);
}

// ==========================================
// RENDERING FUNCTIONS
// ==========================================
function renderMembers() {
    document.getElementById("teamMembersList").innerHTML = teamMembers.map(m => `
        <div class="member-card">
            <div class="member-avatar ${m.color}">${getInitials(m.name)}<span class="online"></span></div>
            <div class="member-details">
                <h4>${m.name}</h4><p>${m.role}</p>
                <span>${tasks.filter(t => t.assignee === m.name).length} Tasks</span>
            </div>
        </div>`).join("");
}

function renderActivities() {
    document.getElementById("activityList").innerHTML = activities.slice(0, 10).map(act => {
        const text = act.text.toLowerCase();
        const type = text.includes("move") ? "move" : text.includes("delete") ? "delete" : text.includes("edit") || text.includes("update") ? "edit" : "create";
        const icon = type === "move" ? "fa-arrow-right" : type === "delete" ? "fa-trash" : type === "edit" ? "fa-pen" : "fa-plus";
        return `
            <div class="activity-card">
                <div class="activity-icon ${type}"><i class="fa-solid ${icon}"></i></div>
                <div class="activity-content"><h4>${act.text}</h4><span>${act.time}</span></div>
            </div>`;
    }).join("");
}

function renderBoard() {
    const q = document.getElementById("searchBar").value.toLowerCase().trim();
    const fAsg = document.getElementById("filterAssignee").value;
    const fPri = document.getElementById("filterPriority").value;
    const fDue = document.getElementById("filterDueStatus").value;

    document.getElementById("boardContainer").innerHTML = columns.map(col => {
        const colTasks = tasks.filter(t => t.columnId === col.id &&
            t.title.toLowerCase().includes(q) &&
            (!fAsg || t.assignee === fAsg) &&
            (!fPri || t.priority === fPri) &&
            (!fDue || fDue.toLowerCase() === getDeadlineClass(t.dueDate))
        );

        const cardsHtml = colTasks.length === 0 
            ? `<div class="empty-state"><i class="fa-regular fa-folder-open"></i><h4>No Tasks</h4><p>No tasks match filters</p><button class="mini-btn" onclick="openModalForColumn('${col.id}')">+ Add Task</button></div>`
            : colTasks.map(t => `
                <div class="task-card due-${getDeadlineClass(t.dueDate)}" draggable="true" ondragstart="drag(event, '${t.id}')">
                    <div class="task-card-top">
                        <span class="priority ${t.priority.toLowerCase()}">${t.priority}</span>
                        <div class="task-actions">
                            <button class="edit-btn" onclick="openEditModal('${t.id}')" title="Edit Task"><i class="fa-solid fa-pen"></i></button>
                            <button class="delete-btn" onclick="deleteTask('${t.id}')" title="Delete Task"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    </div>
                    <h4 class="task-title">${t.title}</h4>
                    <p class="task-description">${t.description || "No description."}</p>
                    <div class="task-footer">
                        <div class="member">
                            <div class="member-avatar-tiny ${getMemberColor(t.assignee)}">${getInitials(t.assignee)}</div>
                            <span>${t.assignee || "Unassigned"}</span>
                        </div>
                        <div class="due-date ${getDeadlineClass(t.dueDate)}"><i class="fa-regular fa-calendar"></i><span>${formatDateDisplay(t.dueDate)}</span></div>
                    </div>
                </div>`).join("");

        return `
            <section class="column" data-column-id="${col.id}">
                <div class="column-header">
                    <div class="column-title-container">
                        <h3 onclick="startRenameColumn('${col.id}')" id="col-title-${col.id}">${col.title}</h3>
                        <input type="text" id="col-input-${col.id}" style="display:none;" onblur="finishRenameColumn('${col.id}')" onkeydown="handleRenameKey(event, '${col.id}')">
                        <span class="count">${colTasks.length}</span>
                    </div>
                    <div class="column-actions">
                        <button onclick="openModalForColumn('${col.id}')" title="Add Task"><i class="fa-solid fa-plus"></i></button>
                        <button onclick="deleteColumn('${col.id}')" title="Delete Column"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div>
                <div class="task-list" id="list-${col.id}" ondragover="handleDragOver(event)" ondragleave="handleDragLeave(event)" ondrop="handleDrop(event, '${col.id}')">${cardsHtml}</div>
            </section>`;
    }).join("") + `
        <div class="add-column-card">
            <input type="text" id="newColumnTitle" placeholder="New column name..." onkeydown="handleNewColumnKey(event)">
            <button onclick="addNewColumn()">+ Add Column</button>
        </div>`;
}

// ==========================================
// COLUMN & DRAG/DROP OPERATIONS
// ==========================================
function addNewColumn() {
    const input = document.getElementById("newColumnTitle"), title = input.value.trim();
    if (!title) return showToast("Column title cannot be empty");
    columns.push({ id: "col-" + Date.now(), title });
    saveAll(); logActivity(`added column '${title}'`); showToast("Column added");
    input.value = ""; renderBoard();
}

const handleNewColumnKey = e => e.key === "Enter" && addNewColumn();

function deleteColumn(id) {
    const col = columns.find(c => c.id === id);
    if (!col || !confirm(`Delete column '${col.title}'? All tasks in it will be lost.`)) return;
    columns = columns.filter(c => c.id !== id);
    tasks = tasks.filter(t => t.columnId !== id);
    saveAll(); logActivity(`deleted column '${col.title}'`); showToast("Column deleted");
    renderBoard(); renderMembers();
}

function startRenameColumn(id) {
    const h = document.getElementById(`col-title-${id}`), input = document.getElementById(`col-input-${id}`);
    input.value = h.innerText; h.style.display = "none"; input.style.display = "inline-block"; input.focus();
}

function finishRenameColumn(id) {
    const h = document.getElementById(`col-title-${id}`), input = document.getElementById(`col-input-${id}`), val = input.value.trim();
    h.style.display = "inline-block"; input.style.display = "none";
    if (!val) return showToast("Column title cannot be empty");
    const col = columns.find(c => c.id === id);
    if (col && col.title !== val) {
        logActivity(`renamed column '${col.title}' to '${val}'`);
        col.title = val; saveAll(); showToast("Column renamed");
        renderBoard();
    }
}

const handleRenameKey = (e, id) => e.key === "Enter" ? finishRenameColumn(id) : e.key === "Escape" && renderBoard();

// DRAG AND DROP
const drag = (e, id) => { currentDragTaskId = id; e.dataTransfer.setData("text/plain", id); };
const handleDragOver = e => { e.preventDefault(); e.currentTarget.closest(".column").classList.add("drag-over"); };
const handleDragLeave = e => e.currentTarget.closest(".column").classList.remove("drag-over");

function handleDrop(e, targetColId) {
    e.preventDefault();
    document.querySelectorAll(".column").forEach(c => c.classList.remove("drag-over"));
    const id = e.dataTransfer.getData("text/plain") || currentDragTaskId, t = tasks.find(x => x.id === id);
    if (!t || t.columnId === targetColId) return;
    const newColTitle = (columns.find(c => c.id === targetColId) || { title: "" }).title;
    t.columnId = targetColId; saveAll();
    logActivity(`moved '${t.title}' to '${newColTitle}'`);
    showToast("Task moved"); renderBoard();
}

// ==========================================
// TASK OPERATIONS & MODAL
// ==========================================
const modal = document.getElementById("taskModal"), formError = document.getElementById("formError"), taskForm = document.getElementById("taskForm");

function populateStatusSelect() {
    document.getElementById("taskStatus").innerHTML = columns.map(c => `<option value="${c.id}">${c.title}</option>`).join("");
}

function openModalForColumn(colId) {
    editingTaskId = null;
    document.getElementById("modalTitle").innerText = "Create New Task";
    document.getElementById("modalSubtitle").innerText = "Add a task to your project board";
    document.getElementById("submitTaskBtn").innerText = "Create Task";
    taskForm.reset(); formError.classList.remove("show");
    populateStatusSelect();
    renderAssigneeOptions();
    document.getElementById("taskStatus").value = colId;
    document.getElementById("taskDate").value = new Date().toISOString().substring(0, 10);
    modal.classList.add("active");
}

function openEditModal(id) {
    editingTaskId = id;
    document.getElementById("modalTitle").innerText = "Edit Task";
    document.getElementById("modalSubtitle").innerText = "Update task details";
    document.getElementById("submitTaskBtn").innerText = "Save Changes";
    formError.classList.remove("show");
    const t = tasks.find(x => x.id === id);
    if (!t) return;
    populateStatusSelect();
    renderAssigneeOptions();
    document.getElementById("taskTitle").value = t.title;
    document.getElementById("taskDescription").value = t.description;
    document.getElementById("taskAssignee").value = t.assignee;
    document.getElementById("taskPriority").value = t.priority;
    document.getElementById("taskDate").value = t.dueDate;
    document.getElementById("taskStatus").value = t.columnId;
    modal.classList.add("active");
}

const closeModal = () => { modal.classList.remove("active"); taskForm.reset(); formError.classList.remove("show"); editingTaskId = null; };

taskForm.addEventListener("submit", function(e) {
    e.preventDefault();
    const title = document.getElementById("taskTitle").value.trim();
    const desc = document.getElementById("taskDescription").value.trim();
    const assignee = document.getElementById("taskAssignee").value;
    const priority = document.getElementById("taskPriority").value;
    const dueDate = document.getElementById("taskDate").value;
    const statusCol = document.getElementById("taskStatus").value;

    if (!title) { formError.innerText = "Task title cannot be empty."; return formError.classList.add("show"); }
    if (parseLocalDate(dueDate).setHours(0,0,0,0) < new Date().setHours(0,0,0,0)) { formError.innerText = "Due date cannot be in the past."; return formError.classList.add("show"); }
    formError.classList.remove("show");

    if (editingTaskId) {
        const t = tasks.find(x => x.id === editingTaskId);
        if (t) {
            const oldCol = t.columnId, oldAsg = t.assignee, oldDue = t.dueDate;
            Object.assign(t, { title, description: desc, assignee, priority, dueDate, columnId: statusCol });
            saveAll();
            if (oldCol !== statusCol) {
                const targetTitle = (columns.find(c => c.id === statusCol) || { title: "" }).title;
                logActivity(`moved '${title}' to '${targetTitle}'`);
            } else if (oldAsg !== assignee) {
                logActivity(`assigned task '${title}' to ${assignee || 'Unassigned'}`);
            } else if (oldDue !== dueDate) {
                logActivity(`updated deadline for '${title}'`);
            } else {
                logActivity(`updated task '${title}'`);
            }
            showToast("Task updated");
        }
    } else {
        tasks.push({ id: "task-" + Date.now(), title, description: desc, assignee, priority, dueDate, columnId: statusCol });
        saveAll(); logActivity(`created task '${title}'`); showToast("Task created");
    }
    closeModal(); renderBoard(); renderMembers();
});

function deleteTask(id) {
    const t = tasks.find(x => x.id === id);
    if (t && confirm(`Delete task '${t.title}'?`)) {
        tasks = tasks.filter(x => x.id !== id); saveAll();
        logActivity(`deleted task '${t.title}'`); showToast("Task deleted");
        renderBoard(); renderMembers();
    }
}

// ==========================================
// INVITE MEMBER MODAL
// ==========================================
const inviteModal = document.getElementById("inviteModal");
const inviteForm = document.getElementById("inviteForm");
const inviteFormError = document.getElementById("inviteFormError");

function openInviteModal() {
    inviteForm.reset();
    inviteFormError.classList.remove("show");
    inviteModal.classList.add("active");
}

function closeInviteModal() {
    inviteModal.classList.remove("active");
    inviteForm.reset();
    inviteFormError.classList.remove("show");
}

inviteForm.addEventListener("submit", function(e) {
    e.preventDefault();
    const name = document.getElementById("newMemberName").value.trim();
    const role = document.getElementById("newMemberRole").value.trim() || "Developer";
    if (!name) { inviteFormError.innerText = "Member name cannot be empty."; return inviteFormError.classList.add("show"); }
    
    if (teamMembers.some(m => m.name.toLowerCase() === name.toLowerCase())) {
        inviteFormError.innerText = "Member with this name already exists.";
        return inviteFormError.classList.add("show");
    }

    const colors = ["purple", "blue", "green", "orange"];
    teamMembers.push({ name, role, color: colors[teamMembers.length % colors.length] });
    saveAll();
    logActivity(`invited team member '${name}'`);
    showToast(`Invited ${name}`);
    
    renderUserSelector();
    renderAssigneeOptions();
    renderMembers();
    closeInviteModal();
});

// EVENTS & INIT
["searchBar", "filterAssignee", "filterPriority", "filterDueStatus"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener(id === "searchBar" ? "input" : "change", renderBoard);
});

document.getElementById("currentUserSelect")?.addEventListener("change", e => changeCurrentUser(e.target.value));

document.getElementById("resetFiltersBtn")?.addEventListener("click", () => {
    ["searchBar", "filterAssignee", "filterPriority", "filterDueStatus"].forEach(id => {
        const el = document.getElementById(id); if (el) el.value = "";
    });
    renderBoard();
});

document.getElementById("openAddTaskModalBtn")?.addEventListener("click", () => openModalForColumn(columns[0]?.id || "todo"));
document.getElementById("closeModalBtn")?.addEventListener("click", closeModal);
document.getElementById("cancelModalBtn")?.addEventListener("click", closeModal);
document.getElementById("inviteMemberBtn")?.addEventListener("click", openInviteModal);
document.getElementById("closeInviteModalBtn")?.addEventListener("click", closeInviteModal);
document.getElementById("cancelInviteModalBtn")?.addEventListener("click", closeInviteModal);

window.addEventListener("click", e => {
    if (e.target === modal) closeModal();
    if (e.target === inviteModal) closeInviteModal();
});

window.addEventListener("keydown", e => {
    if (e.key === "Escape") { closeModal(); closeInviteModal(); }
});

window.addEventListener("DOMContentLoaded", () => {
    initData();
    renderBoard();
    renderMembers();
    renderActivities();
});
