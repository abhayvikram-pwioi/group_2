// =========================================
// ELEMENTS
// =========================================

const modal = document.getElementById("taskModal");

const addTaskBtn = document.querySelector(".add-btn");

const miniButtons = document.querySelectorAll(".mini-btn");

const closeBtn = document.querySelector(".close-modal");

const cancelBtn = document.querySelector(".cancel-btn");

const taskForm = document.getElementById("taskForm");

const formError = document.getElementById("formError");

// =========================================
// OPEN & CLOSE
// =========================================

function openModal(){

    modal.classList.add("active");

}

function closeModal(){

    modal.classList.remove("active");

    taskForm.reset();

    formError.classList.remove("show");

}

addTaskBtn.addEventListener("click",openModal);

miniButtons.forEach(btn=>{

    btn.addEventListener("click",openModal);

});

closeBtn.addEventListener("click",closeModal);

cancelBtn.addEventListener("click",closeModal);

modal.addEventListener("click",(e)=>{

    if(e.target===modal){

        closeModal();

    }

});

document.addEventListener("keydown",(e)=>{

    if(e.key==="Escape"){

        closeModal();

    }

});

// =========================================
// CREATE TASK
// =========================================

taskForm.addEventListener("submit",function(e){

    e.preventDefault();

    const title=document.getElementById("taskTitle").value.trim();

    const description=document.getElementById("taskDescription").value.trim();

    const assignee=document.getElementById("taskAssignee").value;

    const priority=document.getElementById("taskPriority").value;

    const dueDate=document.getElementById("taskDate").value;

    const status=document.getElementById("taskStatus").value;

    // Validation

    if(

        title===""

        ||

        description===""

        ||

        assignee===""

        ||

        priority===""

        ||

        dueDate===""

    ){

        formError.classList.add("show");

        return;

    }

    formError.classList.remove("show");

    const task={

        title,

        description,

        assignee,

        priority,

        dueDate,

        status

    };

    createTaskCard(task);

});

// =========================================
// CREATE CARD
// =========================================

// =========================================
// CREATE TASK CARD
// =========================================

function createTaskCard(task) {

    showToast("Task Created Successfully");

    let columnId = "";

    switch (task.status) {

        case "Backlog":
            columnId = "backlog";
            break;

        case "To Do":
            columnId = "todo";
            break;

        case "In Progress":
            columnId = "progress";
            break;

        case "Review":
            columnId = "review";
            break;

        case "Done":
            columnId = "done";
            break;

    }

    const taskList = document.getElementById(columnId);

    // Remove Empty State

    const emptyState = taskList.querySelector(".empty-state");

    if (emptyState) {

        emptyState.remove();

    }

    // Create Card

    const card = document.createElement("div");

    card.draggable = true;

    card.className = "task-card";

    card.dataset.status = task.status;

    card.innerHTML = `

    <div class="task-card-top">

        <span class="priority ${task.priority.toLowerCase()}">
            ${task.priority}
        </span>

        <div class="task-actions">

            <button class="edit-btn">

                <i class="fa-solid fa-pen"></i>

            </button>

            <button class="delete-btn">

                <i class="fa-solid fa-trash"></i>

            </button>

        </div>

    </div>


    <h3 class="task-title">

        ${task.title}

    </h3>


    <p class="task-description">

        ${task.description}

    </p>


    <div class="task-footer">

        <div class="member">

            <img src="https://ui-avatars.com/api/?name=${task.assignee}&background=5B5BD6&color=fff">

            <span>${task.assignee}</span>

        </div>

    </div>


    <div class="due-date ${getDeadlineClass(task.dueDate)}">

        <i class="fa-regular fa-calendar"></i>

        ${formatDate(task.dueDate)}

    </div>

`;

    taskList.appendChild(card);

    updateTaskCount(columnId);

    closeModal();

}
// =========================================
// FORMAT DATE
// =========================================

function formatDate(date){

    const options={

        day:"numeric",

        month:"short",

        year:"numeric"

    };

    return new Date(date).toLocaleDateString("en-GB",options);

}
// =========================================
// UPDATE TASK COUNT
// =========================================

function updateTaskCount(columnId){

    const taskList=document.getElementById(columnId);

    const cards=taskList.querySelectorAll(".task-card");

    const column=taskList.closest(".column");

    const badge=column.querySelector(".count");

    badge.textContent=cards.length;

}

// =======================================
// DELETE TASK
// =======================================

card.querySelector(".delete-btn").addEventListener("click", function () {

    card.remove();

    updateTaskCount(columnId);

    checkEmptyState(columnId);

    showToast("Task Deleted");

});

// =======================================
// EMPTY STATE
// =======================================

function checkEmptyState(columnId){

    const taskList=document.getElementById(columnId);

    const cards=taskList.querySelectorAll(".task-card");

    if(cards.length===0){

        taskList.innerHTML=`

            <div class="empty-state">

                <i class="fa-regular fa-folder-open"></i>

                <h4>No Tasks</h4>

                <p>Create your first task</p>

                <button class="mini-btn">

                    + Add Task

                </button>

            </div>

        `;

    }

}
// =======================================
// DEADLINE COLOR
// =======================================

function getDeadlineClass(date){

    const today=new Date();

    const due=new Date(date);

    const diff=Math.ceil((due-today)/(1000*60*60*24));

    if(diff<0){

        return "overdue";

    }

    if(diff<=2){

        return "warning";

    }

    return "safe";

}
// =======================================
// TOAST
// =======================================

function showToast(message){

    const toast=document.getElementById("toast");

    toast.innerText=message;

    toast.classList.add("show");

    setTimeout(()=>{

        toast.classList.remove("show");

    },2500);

}