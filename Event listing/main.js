/*==========================
        LOGIN MODAL
==========================*/

const loginBtn = document.getElementById("loginBtn");
const loginModal = document.getElementById("loginModal");
const closeLogin = document.getElementById("closeLogin");
const successStep = document.getElementById("successStep");

const goLoginBtn = document.getElementById("goLoginBtn");


// Open Login Popup

loginBtn.addEventListener("click", function(e){

    e.preventDefault();

    loginModal.style.display = "flex";

});


// Close Button

closeLogin.addEventListener("click", function(){

    loginModal.style.display = "none";

});


// Click Outside Popup

window.addEventListener("click", function(e){

    if(e.target === loginModal){

        loginModal.style.display = "none";

    }

});

/*==========================
      ROLE MODAL
==========================*/

const signupBtn = document.getElementById("signupBtn");

const roleModal = document.getElementById("roleModal");

const closeRole = document.querySelector(".close-role");

const userCard = document.getElementById("userCard");

const adminCard = document.getElementById("adminCard");

const continueBtn = document.getElementById("continueBtn");

let selectedRole = "";


// Open Role Modal

signupBtn.addEventListener("click",function(e){

    e.preventDefault();

    roleModal.style.display="flex";

});


// Close

closeRole.addEventListener("click",function(){

    roleModal.style.display="none";

});


// Close Outside

window.addEventListener("click",function(e){

    if(e.target===roleModal){

        roleModal.style.display="none";

    }

});


// User

userCard.addEventListener("click",function(){

    selectedRole="user";

    userCard.classList.add("active");

    adminCard.classList.remove("active");

});


// Admin

adminCard.addEventListener("click",function(){

    selectedRole="admin";

    adminCard.classList.add("active");

    userCard.classList.remove("active");

});

const roleStep = document.getElementById("roleStep");

const userStep = document.getElementById("userStep");

const userBackBtn = document.getElementById("userBackBtn");

const adminStep = document.getElementById("adminStep");

const adminBackBtn = document.getElementById("adminBackBtn");


// Continue

continueBtn.addEventListener("click", function () {

    if (selectedRole === "") {

        alert("Please select your role.");

        return;

    }

    if (selectedRole === "user") {

        roleStep.style.display = "none";

        userStep.style.display = "block";

    }

    else {

        // Admin Form next step me banega

       roleStep.style.display = "none";

       adminStep.style.display = "block";
    }

});
/*==========================
        SIGNUP STEPS
==========================*/



userBackBtn.addEventListener("click", function () {

    userStep.style.display = "none";

    roleStep.style.display = "block";

});

adminBackBtn.addEventListener("click",function(){

    adminStep.style.display="none";

    roleStep.style.display="block";

});

const userForm = document.getElementById("userForm");

userForm.addEventListener("submit",function(e){

    e.preventDefault();

    userStep.style.display="none";

    successStep.style.display="block";

});

const adminForm=document.getElementById("adminForm");

adminForm.addEventListener("submit",function(e){

    e.preventDefault();

    adminStep.style.display="none";

    successStep.style.display="block";

});

goLoginBtn.addEventListener("click",function(){

    roleModal.style.display="none";

    loginModal.style.display="flex";

    successStep.style.display="none";

    roleStep.style.display="block";

});