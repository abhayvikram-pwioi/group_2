import { auth } from "./firebase-config.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { seedDefaultStudentData } from "./data-helper.js";

// DOM Elements
const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const authSubtitle = document.getElementById("authSubtitle");
const authMessage = document.getElementById("authMessage");
const authOptions = document.getElementById("authOptions");
const submitBtn = document.getElementById("submitBtn");
const toggleAuthLink = document.getElementById("toggleAuth");
const toggleText = document.getElementById("toggleText");
const togglePasswordIcon = document.querySelector(".toggle-password");

let isSignUpMode = false;

// Session check
onAuthStateChanged(auth, (user) => {
  if (user) {
    window.location.href = "dashboard.html";
  }
});

// Toggle Auth Mode (Login vs Sign Up)
toggleAuthLink.addEventListener("click", (e) => {
  e.preventDefault();
  isSignUpMode = !isSignUpMode;
  
  // Reset message
  authMessage.style.display = "none";

  if (isSignUpMode) {
    authSubtitle.textContent = "Create your account";
    submitBtn.textContent = "Sign Up";
    authOptions.style.display = "none";
    toggleText.innerHTML = `Already have an account? <a href="#" id="toggleAuth" style="color: #5B5CEB; text-decoration: none; font-weight: 600;">Login</a>`;
  } else {
    authSubtitle.textContent = "Login to your account";
    submitBtn.textContent = "Login";
    authOptions.style.display = "flex";
    toggleText.innerHTML = `Don't have an account? <a href="#" id="toggleAuth" style="color: #5B5CEB; text-decoration: none; font-weight: 600;">Sign Up</a>`;
  }

  // Re-bind the toggle click event because innerHTML replaces the element
  document.getElementById("toggleAuth").addEventListener("click", (evt) => {
    evt.preventDefault();
    toggleAuthLink.click();
  });
});

// Toggle Password Visibility
togglePasswordIcon.addEventListener("click", () => {
  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    togglePasswordIcon.classList.remove("fa-eye");
    togglePasswordIcon.classList.add("fa-eye-slash");
  } else {
    passwordInput.type = "password";
    togglePasswordIcon.classList.remove("fa-eye-slash");
    togglePasswordIcon.classList.add("fa-eye");
  }
});

// Show beginner-friendly message
function showMessage(text, isError) {
  authMessage.textContent = text;
  authMessage.style.display = "block";
  if (isError) {
    authMessage.style.backgroundColor = "#FDE8E8";
    authMessage.style.color = "#9B1C1C";
  } else {
    authMessage.style.backgroundColor = "#DEF7EC";
    authMessage.style.color = "#03543F";
  }
}

// Form Submit Handler
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    showMessage("Please fill in all fields.", true);
    return;
  }

  // Disable button and show loader text
  submitBtn.disabled = true;
  const originalBtnText = submitBtn.textContent;
  submitBtn.textContent = isSignUpMode ? "Signing Up..." : "Logging In...";

  try {
    if (isSignUpMode) {
      // Create user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      showMessage("Account created! Seeding profile data...", false);
      
      // Seed default sample documents
      await seedDefaultStudentData(user.uid, email);

      showMessage("Profile created! Redirecting to dashboard...", false);
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 1000);

    } else {
      // Login user
      await signInWithEmailAndPassword(auth, email, password);
      showMessage("Login successful! Redirecting...", false);
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 1000);
    }
  } catch (error) {
    console.error("Auth error:", error);
    let errorMsg = "An error occurred. Please try again.";
    
    // Beginner-friendly auth errors mapping
    if (error.code === "auth/invalid-credential" || error.code === "auth/wrong-password" || error.code === "auth/user-not-found") {
      errorMsg = "Invalid email or password. Please try again.";
    } else if (error.code === "auth/email-already-in-use") {
      errorMsg = "This email is already registered. Please login instead.";
    } else if (error.code === "auth/weak-password") {
      errorMsg = "Password should be at least 6 characters long.";
    } else if (error.code === "auth/invalid-email") {
      errorMsg = "Please enter a valid email address.";
    } else if (error.message && error.message.includes("network")) {
      errorMsg = "Network error. Please check your internet connection.";
    }
    
    showMessage(errorMsg, true);
    submitBtn.disabled = false;
    submitBtn.textContent = originalBtnText;
  }
});
