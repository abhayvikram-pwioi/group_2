const loginForm = document.querySelector(".login-form");

const email = document.getElementById("email");
const password = document.getElementById("password");

loginForm.addEventListener("submit", function (e) {

    e.preventDefault();

    if (
        email.value === "student@eduprogress.com" &&
        password.value === "password123"
    ) {

        localStorage.setItem("isLoggedIn", "true");

        window.location.href = "index.html"; 

    } else {

        alert("Invalid Email or Password");

    }

});
