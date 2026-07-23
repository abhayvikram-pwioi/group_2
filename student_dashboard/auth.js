// auth.js
// Firebase Authentication Controller (Sign Up, Login, and Session Handling)

import { auth, db, isFirebaseConfigured } from "./firebase-config.js";
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
    doc, 
    setDoc 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// DOM Element Selectors
const authTitle = document.getElementById("auth-title");
const authSubtitle = document.getElementById("auth-subtitle");
const authForm = document.getElementById("auth-form");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const authOptions = document.getElementById("auth-options");
const togglePasswordBtn = document.querySelector(".toggle-password");
const authToggleText = document.getElementById("auth-toggle-text");
const authToggleLink = document.getElementById("auth-toggle-link");
const authMessage = document.getElementById("auth-message");

// Auth State Check (Redirect logged-in users directly to dashboard)
if (isFirebaseConfigured) {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            window.location.href = "index.html";
        }
    });
} else {
    // Show a warning warning banner about running in Mock Mode
    showFirebaseConfigWarning();

    // Check localStorage for active session
    const mockUserJson = localStorage.getItem("mock_user");
    if (mockUserJson) {
        window.location.href = "index.html";
    }
}

// View state: true = Sign Up, false = Login
let isSignUpMode = false;

// Toggle Password Visibility
if (togglePasswordBtn && passwordInput) {
    togglePasswordBtn.addEventListener("click", () => {
        const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
        passwordInput.setAttribute("type", type);
        
        const icon = togglePasswordBtn.querySelector("i");
        if (icon) {
            icon.className = type === "password" ? "fa-regular fa-eye" : "fa-regular fa-eye-slash";
        }
    });
}

// Toggle between Login and Sign Up UI
if (authToggleLink) {
    authToggleLink.addEventListener("click", (e) => {
        e.preventDefault();
        isSignUpMode = !isSignUpMode;
        
        // Clear message
        hideMessage();

        if (isSignUpMode) {
            authTitle.textContent = "Create Account";
            authSubtitle.textContent = "Sign up to track your learning progress";
            authOptions.style.display = "none"; // Hide Remember Me / Forgot Password
            authToggleText.textContent = "Already have an account?";
            authToggleLink.textContent = "Log In";
            
            // Rename button text
            const submitBtn = authForm.querySelector(".login-btn");
            if (submitBtn) submitBtn.textContent = "Sign Up";
        } else {
            authTitle.textContent = "Welcome Back!";
            authSubtitle.textContent = "Login to access your student dashboard";
            authOptions.style.display = "flex"; // Show Remember Me / Forgot Password
            authToggleText.textContent = "Don't have an account?";
            authToggleLink.textContent = "Sign Up";
            
            // Rename button text
            const submitBtn = authForm.querySelector(".login-btn");
            if (submitBtn) submitBtn.textContent = "Login";
        }
    });
}

// Handle login/signup form submission
if (authForm) {
    authForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        const submitBtn = authForm.querySelector(".login-btn");

        // Basic validation
        if (!email || !password) {
            showMessage("Please fill in all fields.", "error");
            return;
        }

        if (password.length < 6) {
            showMessage("Password must be at least 6 characters long.", "error");
            return;
        }

        try {
            // Set loading state on submit button
            submitBtn.textContent = "Loading...";
            submitBtn.disabled = true;
            hideMessage();

            const nameFromEmail = email.split("@")[0]
                .split(/[._-]/)
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ");

            if (isSignUpMode) {
                if (isFirebaseConfigured) {
                    // Firebase Sign Up
                    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                    const user = userCredential.user;

                    showMessage("Account created! Initializing data...", "success");
                    await initializeNewStudentData(user.uid, email, nameFromEmail);
                } else {
                    // Mock Sign Up (LocalStorage)
                    const mockUsers = JSON.parse(localStorage.getItem("mock_users") || "[]");
                    if (mockUsers.some(u => u.email === email)) {
                        throw { code: "auth/email-already-in-use" };
                    }
                    const newUid = "mock_uid_" + Date.now();
                    mockUsers.push({ uid: newUid, email, password });
                    localStorage.setItem("mock_users", JSON.stringify(mockUsers));
                    
                    initializeMockStudentData(newUid, email, nameFromEmail);
                    localStorage.setItem("mock_user", JSON.stringify({ uid: newUid, email }));
                    
                    showMessage("Mock Account created! Redirecting...", "success");
                    setTimeout(() => {
                        window.location.href = "index.html";
                    }, 800);
                }
            } else {
                if (isFirebaseConfigured) {
                    // Firebase Login
                    await signInWithEmailAndPassword(auth, email, password);
                    showMessage("Login successful! Redirecting...", "success");
                } else {
                    // Mock Login (LocalStorage)
                    const mockUsers = JSON.parse(localStorage.getItem("mock_users") || "[]");
                    const user = mockUsers.find(u => u.email === email && u.password === password);
                    
                    // Fallback to default student demo account
                    if (email === "student@eduprogress.com" && password === "password123") {
                        const defaultUid = "mock_student_hasan";
                        initializeMockStudentData(defaultUid, email, "Hasan (0_0)");
                        localStorage.setItem("mock_user", JSON.stringify({ uid: defaultUid, email }));
                        showMessage("Demo login successful! Redirecting...", "success");
                        setTimeout(() => {
                            window.location.href = "index.html";
                        }, 800);
                    } else if (user) {
                        localStorage.setItem("mock_user", JSON.stringify({ uid: user.uid, email: user.email }));
                        showMessage("Mock login successful! Redirecting...", "success");
                        setTimeout(() => {
                            window.location.href = "index.html";
                        }, 800);
                    } else {
                        throw { code: "auth/invalid-credential" };
                    }
                }
            }
        } catch (error) {
            console.error("Authentication Error:", error);
            // Translate common Firebase Auth errors into beginner-friendly messages
            let errorMsg = "An error occurred. Please try again.";
            if (error.code === "auth/invalid-credential") {
                errorMsg = "Invalid email or password. Please try again.";
            } else if (error.code === "auth/email-already-in-use") {
                errorMsg = "This email is already in use by another account.";
            } else if (error.code === "auth/invalid-email") {
                errorMsg = "Please enter a valid email address.";
            } else if (error.code === "auth/weak-password") {
                errorMsg = "The password is too weak.";
            }
            showMessage(errorMsg, "error");
            submitBtn.textContent = isSignUpMode ? "Sign Up" : "Login";
            submitBtn.disabled = false;
        }
    });
}

// Function to initialize default Firestore documents for new users
async function initializeNewStudentData(uid, email, name) {
    try {
        // 1. Create student document
        const studentRef = doc(db, "students", uid);
        await setDoc(studentRef, {
            name: name,
            email: email,
            avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
            stats: {
                enrolled: 4,
                completed: 1,
                hours: 42,
                attendance: 94
            }
        });

        // 2. Set up initial progress for the 4 default courses
        const courses = [
            { id: "js", completedModules: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], progress: 83 },
            { id: "python", completedModules: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], progress: 100 },
            { id: "figma", completedModules: [1, 2, 3], progress: 25 },
            { id: "cloud", completedModules: [], progress: 0 }
        ];

        for (const c of courses) {
            await setDoc(doc(db, "progress", `${uid}_${c.id}`), {
                studentId: uid,
                courseId: c.id,
                completedModules: c.completedModules,
                progress: c.progress
            });
        }

        // 3. Set up initial grades
        const grades = [
            { id: "js", quizScore: 92, attendanceRate: 96 },
            { id: "python", quizScore: 98, attendanceRate: 92 },
            { id: "figma", quizScore: 82, attendanceRate: 88 },
            { id: "cloud", quizScore: 0, attendanceRate: 0 }
        ];

        for (const g of grades) {
            await setDoc(doc(db, "grades", `${uid}_${g.id}`), {
                studentId: uid,
                courseId: g.id,
                quizScore: g.quizScore,
                attendanceRate: g.attendanceRate
            });
        }
    } catch (err) {
        console.error("Firestore Initialization Error:", err);
    }
}

// Function to initialize default LocalStorage data for mock users
function initializeMockStudentData(uid, email, name) {
    const studentKey = `mock_students_${uid}`;
    if (!localStorage.getItem(studentKey)) {
        localStorage.setItem(studentKey, JSON.stringify({
            name: name,
            email: email,
            avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
            stats: {
                enrolled: 4,
                completed: 1,
                hours: 42,
                attendance: 94
            }
        }));
    }

    const courses = [
        { id: "js", completedModules: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], progress: 83 },
        { id: "python", completedModules: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], progress: 100 },
        { id: "figma", completedModules: [1, 2, 3], progress: 25 },
        { id: "cloud", completedModules: [], progress: 0 }
    ];
    for (const c of courses) {
        const progressKey = `mock_progress_${uid}_${c.id}`;
        if (!localStorage.getItem(progressKey)) {
            localStorage.setItem(progressKey, JSON.stringify({
                studentId: uid,
                courseId: c.id,
                completedModules: c.completedModules,
                progress: c.progress
            }));
        }
    }

    const grades = [
        { id: "js", quizScore: 92, attendanceRate: 96 },
        { id: "python", quizScore: 98, attendanceRate: 92 },
        { id: "figma", quizScore: 82, attendanceRate: 88 },
        { id: "cloud", quizScore: 0, attendanceRate: 0 }
    ];
    for (const g of grades) {
        const gradeKey = `mock_grades_${uid}_${g.id}`;
        if (!localStorage.getItem(gradeKey)) {
            localStorage.setItem(gradeKey, JSON.stringify({
                studentId: uid,
                courseId: g.id,
                quizScore: g.quizScore,
                attendanceRate: g.attendanceRate
            }));
        }
    }
}

// Display messages to user
function showMessage(msg, type) {
    if (!authMessage) return;
    authMessage.textContent = msg;
    authMessage.style.display = "block";

    if (type === "success") {
        authMessage.style.background = "rgba(16, 185, 129, 0.1)";
        authMessage.style.color = "#34d399";
        authMessage.style.border = "1px solid rgba(16, 185, 129, 0.2)";
    } else {
        authMessage.style.background = "rgba(239, 68, 68, 0.1)";
        authMessage.style.color = "#f87171";
        authMessage.style.border = "1px solid rgba(239, 68, 68, 0.2)";
    }
}

// Hide messages
function hideMessage() {
    if (authMessage) {
        authMessage.style.display = "none";
    }
}

// Inject a mock mode warning banner
function showFirebaseConfigWarning() {
    let warningBanner = document.getElementById("firebase-warning");
    if (!warningBanner) {
        warningBanner = document.createElement("div");
        warningBanner.id = "firebase-warning";
        warningBanner.style.cssText = "background: #f59e0b; color: #090d16; text-align: center; padding: 12px; font-size: 0.9rem; font-weight: 700; width: 100%; box-sizing: border-box; z-index: 10000; font-family: sans-serif;";
        warningBanner.innerHTML = '⚠️ Running in Local Mock Mode (LocalStorage). To connect to Firestore, add your credentials in <code>firebase-config.js</code>.';
        document.body.insertBefore(warningBanner, document.body.firstChild);
    }
}
