/*==========================
      EDIT VARIABLES
==========================*/

let currentRow = null;

let isEditMode = false;
/*==========================
      ADD EVENT MODAL
==========================*/

const addBtn = document.querySelector(".add-btn");

const eventModal = document.getElementById("eventModal");

const closeEvent = document.querySelector(".close-event");

addBtn.addEventListener("click",()=>{

    eventModal.style.display="flex";

});

closeEvent.addEventListener("click",()=>{

    eventModal.style.display="none";

});

window.addEventListener("click",(e)=>{

    if(e.target===eventModal){

        eventModal.style.display="none";

    }

});

/*==========================
      ADD EVENT
==========================*/

const eventForm = document.getElementById("eventForm");

const tableBody = document.getElementById("eventTableBody");

eventForm.addEventListener("submit", function(e){

    e.preventDefault();

    const name = document.getElementById("eventName").value;

    const date = document.getElementById("eventDate").value;

    const location = document.getElementById("eventLocation").value;

    const newRow = document.createElement("tr");

    newRow.innerHTML = `

        <td>${name}</td>

        <td>${date}</td>

        <td>${location}</td>

        <td>

            <button class="edit-btn">

                <i class="fa-solid fa-pen"></i>

                Edit

            </button>

            <button class="delete-btn">

                <i class="fa-solid fa-trash"></i>

                Delete

            </button>

        </td>

    `;

    eventForm.addEventListener("submit", function (e) {

    e.preventDefault();

    const name = document.getElementById("eventName").value;

    const date = document.getElementById("eventDate").value;

    const location = document.getElementById("eventLocation").value;

    if (isEditMode) {

        currentRow.cells[0].innerText = name;

        currentRow.cells[1].innerText = date;

        currentRow.cells[2].innerText = location;

        isEditMode = false;

        currentRow = null;

        saveBtn.innerText = "Create Event";

    }

    else {

        const newRow = document.createElement("tr");

        newRow.innerHTML = `

            <td>${name}</td>

            <td>${date}</td>

            <td>${location}</td>

            <td>

                <button class="edit-btn">

                    <i class="fa-solid fa-pen"></i>

                    Edit

                </button>

                <button class="delete-btn">

                    <i class="fa-solid fa-trash"></i>

                    Delete

                </button>

            </td>

        `;

        tableBody.appendChild(newRow);

    }

    eventModal.style.display = "none";

    eventForm.reset();

});

});

/*==========================
      DELETE EVENT
==========================*/

document.addEventListener("click", function(e){

    if(e.target.closest(".delete-btn")){

        if(confirm("Delete this event?")){

            e.target.closest("tr").remove();

        }

    }

});

/*==========================
      EDIT EVENT
==========================*/

document.addEventListener("click", function(e){

    if(e.target.closest(".edit-btn")){

       /*==========================
      EDIT EVENT
==========================*/
const saveBtn = document.getElementById("saveBtn");

document.addEventListener("click", function (e) {

    if (e.target.closest(".edit-btn")) {

        currentRow = e.target.closest("tr");

        isEditMode = true;

        eventModal.style.display = "flex";

        document.getElementById("eventName").value =
        currentRow.cells[0].innerText;

        document.getElementById("eventDate").value =
        currentRow.cells[1].innerText;

        document.getElementById("eventLocation").value =
        currentRow.cells[2].innerText;

        saveBtn.innerText = "Update Event";

    }

});
    }

});

/*==========================
      SIDEBAR NAVIGATION
==========================*/

const dashboardLink = document.getElementById("dashboardLink");

const eventsLink = document.getElementById("eventsLink");

const dashboardSection = document.getElementById("dashboardSection");

const eventsSection = document.getElementById("eventsSection");


dashboardLink.addEventListener("click",()=>{

    dashboardSection.scrollIntoView({

        behavior:"smooth"

    });

});


eventsLink.addEventListener("click",()=>{

    eventsSection.scrollIntoView({

        behavior:"smooth"

    });

});



dashboardLink.addEventListener("click",()=>{

    dashboardLink.classList.add("active");

    eventsLink.classList.remove("active");

});

eventsLink.addEventListener("click",()=>{

    eventsLink.classList.add("active");

    dashboardLink.classList.remove("active");

});

/*==========================
    PROFILE DROPDOWN
==========================*/

const profileBtn = document.getElementById("profileBtn");

const profileMenu = document.getElementById("profileMenu");

profileBtn.addEventListener("click",function(e){

    e.stopPropagation();

    if(profileMenu.style.display==="block"){

        profileMenu.style.display="none";

    }

    else{

        profileMenu.style.display="block";

    }

});

document.addEventListener("click",function(){

    profileMenu.style.display="none";

});

/*==========================
        LOGOUT
==========================*/

const logoutBtn=document.getElementById("logoutBtn");

logoutBtn.addEventListener("click",()=>{

    const answer=confirm("Are you sure you want to logout?");

    if(answer){

        window.location.href="home.html";

    }

});