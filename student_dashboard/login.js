import { auth, db } from "./firebase-config.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

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

// Helper to extract a friendly name from email
function extractNameFromEmail(email) {
  const username = email.split("@")[0];
  const cleanUsername = username.replace(/[0-9._-]+/g, " ").trim();
  return cleanUsername.split(" ").map(word => {
    if (!word) return "";
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }).join(" ") || "New Student";
}

// Seeding Default Student Data into Firestore
async function seedDefaultStudentData(uid, email) {
  const name = extractNameFromEmail(email);
  
  const depts = ["B.Tech CSE", "B.Tech IT", "B.Tech ECE", "B.Tech ME", "B.Tech Civil"];
  const department = depts[Math.floor(Math.random() * depts.length)];
  
  const overallProgress = Math.floor(Math.random() * 36) + 50; // 50 to 85%
  const coursesEnrolledCount = 5;
  const modulesCompletedCount = Math.floor(Math.random() * 21) + 15; // 15 to 35
  
  // Random GPAs
  const cgpa = parseFloat((Math.random() * 2.0 + 7.5).toFixed(1)); // 7.5 to 9.5
  const semesterGpa = parseFloat((Math.random() * 2.0 + 7.8).toFixed(1)); // 7.8 to 9.8
  const averageGrade = cgpa >= 9.0 ? "A+" : cgpa >= 8.0 ? "A" : cgpa >= 7.0 ? "B+" : "B";
  
  const creditsEarned = Math.floor(Math.random() * 5) + 20; // 20 to 24
  const attendance = Math.floor(Math.random() * 18) + 80; // 80 to 97
  const dayStreak = Math.floor(Math.random() * 23) + 3; // 3 to 25
  const hoursStudied = Math.floor(Math.random() * 51) + 30; // 30 to 80

  const profile = {
    name,
    email,
    department,
    overallProgress,
    coursesEnrolledCount,
    modulesCompletedCount,
    averageGrade,
    cgpa,
    semesterGpa,
    creditsEarned,
    attendance,
    dayStreak,
    hoursStudied,
    photoUrl: ""
  };

  // Generate random progress percentage for courses
  const courseProgresses = [
    Math.floor(Math.random() * 21) + 75, // 75 to 95%
    Math.floor(Math.random() * 26) + 50, // 50 to 75%
    Math.floor(Math.random() * 21) + 80, // 80 to 100%
    Math.floor(Math.random() * 31) + 50, // 50 to 80%
    Math.floor(Math.random() * 41) + 30  // 30 to 70%
  ];

  const courses = [
    { title: "React JS Fundamentals", instructor: "Mark Lewis", progress: courseProgresses[0], level: "Beginner", duration: "12 Hours", status: "In Progress", icon: "fa-brands fa-react", color: "blue" },
    { title: "Data Structures & Algorithms", instructor: "Sarah Johnson", progress: courseProgresses[1], level: "Intermediate", duration: "30 Hours", status: "In Progress", icon: "fa-solid fa-code", color: "orange" },
    { title: "UI/UX Design Basics", instructor: "David Smith", progress: courseProgresses[2], level: "Advanced", duration: "24 Hours", status: "In Progress", icon: "fa-solid fa-shield-halved", color: "green" },
    { title: "Database Management Systems", instructor: "Michael Brown", progress: courseProgresses[3], level: "Intermediate", duration: "18 Hours", status: "In Progress", icon: "fa-solid fa-database", color: "purple" },
    { title: "Communication Skills", instructor: "Emily Davis", progress: courseProgresses[4], level: "Beginner", duration: "8 Hours", status: "In Progress", icon: "fa-solid fa-comments", color: "yellow" }
  ];

  const getGradeFromMarks = (marks) => {
    if (marks >= 95) return "A+";
    if (marks >= 90) return "A";
    if (marks >= 80) return "B+";
    if (marks >= 70) return "B";
    return "C";
  };

  const courseMarks = [
    Math.floor(Math.random() * 15) + 84, // 84 to 98
    Math.floor(Math.random() * 15) + 84,
    Math.floor(Math.random() * 15) + 80,
    Math.floor(Math.random() * 15) + 80,
    Math.floor(Math.random() * 15) + 80
  ];

  const grades = [
    { subject: "React JS", credits: 4, marks: courseMarks[0], grade: getGradeFromMarks(courseMarks[0]), status: "Passed" },
    { subject: "JavaScript", credits: 4, marks: courseMarks[1], grade: getGradeFromMarks(courseMarks[1]), status: "Passed" },
    { subject: "DSA", credits: 4, marks: courseMarks[2], grade: getGradeFromMarks(courseMarks[2]), status: "Passed" },
    { subject: "DBMS", credits: 5, marks: courseMarks[3], grade: getGradeFromMarks(courseMarks[3]), status: "Passed" },
    { subject: "Communication", credits: 3, marks: courseMarks[4], grade: getGradeFromMarks(courseMarks[4]), status: "Passed" }
  ];

  const weeklyLearning = Array.from({ length: 7 }, () => Math.floor(Math.random() * 7) + 1);
  const gradeOverview = Array.from({ length: 6 }, () => Math.floor(Math.random() * 25) + 70);
  const performanceTrend = Array.from({ length: 6 }, () => Math.floor(Math.random() * 25) + 70);

  const progress = {
    weeklyLearning,
    gradeOverview,
    performanceTrend,
    recentAssessments: [
      { title: "Mid-Term Examination", score: `${courseMarks[0]}%`, date: "Completed Yesterday" },
      { title: "JavaScript Assignment", score: `${courseMarks[1]}%`, date: "3 Days Ago" },
      { title: "Database Quiz", score: `${courseMarks[3]}%`, date: "Last Week" }
    ]
  };

  const calendar = {
    events: [
      { title: "Java Assignment", date: "25 July", time: "11:59 PM", icon: "fa-solid fa-book" },
      { title: "DSA Coding Contest", date: "27 July", time: "09:00 AM", icon: "fa-solid fa-code" },
      { title: "Mid Semester Exam", date: "30 July", time: "10:00 AM", icon: "fa-solid fa-file-lines" },
      { title: "Communication Presentation", date: "02 August", time: "01:00 PM", icon: "fa-solid fa-microphone" }
    ],
    dailySchedules: {
      5: [
        { title: "React JS Class", time: "09:00 AM - 10:30 AM", color: "purple" },
        { title: "DSA Lab", time: "11:00 AM - 01:00 PM", color: "blue" }
      ],
      12: [
        { title: "Java Assignment", time: "10:00 AM", color: "orange" }
      ],
      18: [
        { title: "DBMS Quiz", time: "02:30 PM", color: "orange" },
        { title: "Assignment Deadline", time: "11:59 PM", color: "red" }
      ],
      25: [
        { title: "Communication Workshop", time: "09:30 AM", color: "purple" }
      ]
    }
  };

  // 1. Set Profile in root collection
  await setDoc(doc(db, "students", uid), profile);

  // 2. Set Courses in root collection
  for (let i = 0; i < courses.length; i++) {
    await setDoc(doc(db, "courses", `${uid}_course_${i}`), { ...courses[i], studentId: uid });
  }

  // 3. Set Grades in root collection
  for (let i = 0; i < grades.length; i++) {
    await setDoc(doc(db, "grades", `${uid}_grade_${i}`), { ...grades[i], studentId: uid });
  }

  // 4. Set Progress Metrics in root collection
  await setDoc(doc(db, "progress", uid), { ...progress, studentId: uid });

  // 5. Set Calendar Schedule in root collection
  await setDoc(doc(db, "calendar", uid), { ...calendar, studentId: uid });
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
