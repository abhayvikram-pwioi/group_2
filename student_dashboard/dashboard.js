import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { doc, getDoc, getDocs, collection, setDoc, query, where } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

// DOM Elements
const welcomeMessage = document.getElementById("welcomeMessage");
const statProgress = document.getElementById("statProgress");
const statCourses = document.getElementById("statCourses");
const statModules = document.getElementById("statModules");
const statGrade = document.getElementById("statGrade");

const profileImage = document.getElementById("profileImage");
const profileName = document.getElementById("profileName");
const profileDept = document.getElementById("profileDept");

const dashboardCourseProgressList = document.getElementById("dashboardCourseProgressList");
const coursesGrid = document.getElementById("coursesGrid");

const progressPagePercentText = document.getElementById("progressPagePercentText");
const progressPageCircleText = document.getElementById("progressPageCircleText");
const progressStatCourses = document.getElementById("progressStatCourses");
const progressStatModules = document.getElementById("progressStatModules");
const progressStatHours = document.getElementById("progressStatHours");
const progressStatStreak = document.getElementById("progressStatStreak");
const progressPageCourseList = document.getElementById("progressPageCourseList");

const gradesSemesterGpa = document.getElementById("gradesSemesterGpa");
const gradesCgpa = document.getElementById("gradesCgpa");
const gradesCredits = document.getElementById("gradesCredits");
const gradesAttendance = document.getElementById("gradesAttendance");
const gradesTableBody = document.getElementById("gradesTableBody");
const assessmentGrid = document.getElementById("assessmentGrid");

const upcomingEventsGrid = document.getElementById("upcomingEventsGrid");
const calStatAssignments = document.getElementById("calStatAssignments");
const calStatExams = document.getElementById("calStatExams");
const calStatClasses = document.getElementById("calStatClasses");
const calStatAttendance = document.getElementById("calStatAttendance");

const loadingOverlay = document.getElementById("loadingOverlay");
const errorBanner = document.getElementById("dashboardErrorBanner");
const errorText = document.getElementById("dashboardErrorText");
const closeBannerBtn = document.getElementById("closeErrorBannerBtn");

// Local Mock Data for Fallback/Demo Mode
const localMockProfile = {
  name: "Ishika Gangwar",
  email: "ishika@example.com",
  department: "B.Tech CSE",
  overallProgress: 72,
  coursesEnrolledCount: 5,
  modulesCompletedCount: 28,
  averageGrade: "B+",
  cgpa: 8.3,
  semesterGpa: 8.7,
  creditsEarned: 22,
  attendance: 92,
  dayStreak: 12,
  hoursStudied: 64
};

const localMockCourses = [
  { title: "React JS Fundamentals", instructor: "Mark Lewis", progress: 80, level: "Beginner", duration: "12 Hours", status: "In Progress", icon: "fa-brands fa-react", color: "blue" },
  { title: "Data Structures & Algorithms", instructor: "Sarah Johnson", progress: 65, level: "Intermediate", duration: "30 Hours", status: "In Progress", icon: "fa-solid fa-code", color: "orange" },
  { title: "UI/UX Design Basics", instructor: "David Smith", progress: 90, level: "Advanced", duration: "24 Hours", status: "In Progress", icon: "fa-solid fa-shield-halved", color: "green" },
  { title: "Database Management Systems", instructor: "Michael Brown", progress: 60, level: "Intermediate", duration: "18 Hours", status: "In Progress", icon: "fa-solid fa-database", color: "purple" },
  { title: "Communication Skills", instructor: "Emily Davis", progress: 40, level: "Beginner", duration: "8 Hours", status: "In Progress", icon: "fa-solid fa-comments", color: "yellow" }
];

const localMockGrades = [
  { subject: "React JS", credits: 4, marks: 92, grade: "A+", status: "Passed" },
  { subject: "JavaScript", credits: 4, marks: 96, grade: "A+", status: "Passed" },
  { subject: "DSA", credits: 4, marks: 84, grade: "B+", status: "Passed" },
  { subject: "DBMS", credits: 5, marks: 90, grade: "A", status: "Passed" },
  { subject: "Communication", credits: 3, marks: 95, grade: "A+", status: "Passed" }
];

const localMockProgress = {
  weeklyLearning: [2, 4, 3, 6, 5, 7, 4],
  gradeOverview: [72, 76, 74, 82, 88, 91],
  performanceTrend: [75, 80, 78, 84, 89, 92],
  recentAssessments: [
    { title: "Mid-Term Examination", score: "92%", date: "Completed Yesterday" },
    { title: "JavaScript Assignment", score: "96%", date: "3 Days Ago" },
    { title: "Database Quiz", score: "90%", date: "Last Week" }
  ]
};

const localMockCalendar = {
  events: [
    { title: "Java Assignment", date: "25 July", time: "11:59 PM", icon: "fa-solid fa-book", type: "assignment" },
    { title: "DSA Coding Contest", date: "27 July", time: "09:00 AM", icon: "fa-solid fa-code", type: "contest" },
    { title: "Mid Semester Exam", date: "30 July", time: "10:00 AM", icon: "fa-solid fa-file-lines", type: "exam" },
    { title: "Communication Presentation", date: "02 August", time: "01:00 PM", icon: "fa-solid fa-microphone", type: "presentation" }
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

// Global variables for Chart JS instances
let gradeChartInstance = null;
let progressChartInstance = null;
let gradesChartInstance = null;
let schedules = localMockCalendar.dailySchedules;

// Route Protection & State
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    // Save state for debug and redirect
    window.location.href = "login.html";
  } else {
    try {
      await loadDashboardData(user.uid, user.email);
    } catch (err) {
      console.error("Failed to load Firebase data. Switched to offline fallback mode:", err);
      showErrorBanner("Could not load Firebase database. Running in Demo/Offline Mode.");
      renderDashboardUI(localMockProfile, localMockCourses, localMockGrades, localMockProgress, localMockCalendar);
      hideLoadingOverlay();
    }
  }
});

// Helper to extract a friendly name from email
function extractNameFromEmail(email) {
  const username = email.split("@")[0];
  const cleanUsername = username.replace(/[0-9._-]+/g, " ").trim();
  return cleanUsername.split(" ").map(word => {
    if (!word) return "";
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }).join(" ") || "New Student";
}

// Seed default profile data if user does not have records
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

// Fetch from Firestore
async function loadDashboardData(uid, email) {
  // 1. Fetch Profile
  const profileSnap = await getDoc(doc(db, "students", uid));
  
  // If user signed up but data seeding failed or document doesn't exist, seed it now
  if (!profileSnap.exists()) {
    console.log("Seeding new profile document...");
    await seedDefaultStudentData(uid, email);
    // Reload
    return loadDashboardData(uid, email);
  }

  const profile = profileSnap.data();

  // 2. Fetch Courses
  const qCourses = query(collection(db, "courses"), where("studentId", "==", uid));
  const coursesSnap = await getDocs(qCourses);
  const courses = [];
  coursesSnap.forEach((doc) => {
    courses.push(doc.data());
  });

  // 3. Fetch Grades
  const qGrades = query(collection(db, "grades"), where("studentId", "==", uid));
  const gradesSnap = await getDocs(qGrades);
  const grades = [];
  gradesSnap.forEach((doc) => {
    grades.push(doc.data());
  });

  // 4. Fetch Progress Metrics
  const progressSnap = await getDoc(doc(db, "progress", uid));
  const progressData = progressSnap.exists() ? progressSnap.data() : localMockProgress;

  // 5. Fetch Calendar Schedule
  const calendarSnap = await getDoc(doc(db, "calendar", uid));
  const calendarData = calendarSnap.exists() ? calendarSnap.data() : localMockCalendar;

  // Render UI
  renderDashboardUI(profile, courses, grades, progressData, calendarData);
  hideLoadingOverlay();
}

// Helper to get grade styling class
function getGradeBadgeClass(grade) {
  const g = grade.toUpperCase();
  if (g.includes("A+")) return "grade-a-plus";
  if (g === "A") return "grade-a";
  if (g.includes("B+")) return "grade-b-plus";
  if (g === "B") return "grade-b";
  return "grade-c";
}

// Render UI Components
function renderDashboardUI(profile, courses, grades, progressData, calendarData) {
  // Header and sidebar profile info
  if (welcomeMessage) welcomeMessage.textContent = `Welcome back, ${profile.name.split(" ")[0]}! 👋`;
  if (profileName) profileName.textContent = profile.name;
  if (profileDept) profileDept.textContent = profile.department;
  if (profileImage) profileImage.src = profile.photoUrl || "blank-profile-picture-973460_1280.png";

  // Stats
  if (statProgress) statProgress.textContent = `${profile.overallProgress}%`;
  if (statCourses) statCourses.textContent = profile.coursesEnrolledCount;
  if (statModules) statModules.textContent = profile.modulesCompletedCount;
  if (statGrade) statGrade.textContent = profile.averageGrade;

  // Dashboard Course Progress list
  if (dashboardCourseProgressList) {
    dashboardCourseProgressList.innerHTML = courses.map(course => `
      <div class="course">
          <div class="course-info">
              <h4>${course.title}</h4>
              <span>${course.progress}%</span>
          </div>
          <div class="course-bar">
              <div class="course-fill" style="width:${course.progress}%"></div>
          </div>
      </div>
    `).join("");
  }

  // Course Grid (My Courses page)
  if (coursesGrid) {
    coursesGrid.innerHTML = courses.map(course => `
      <div class="course-card">
          <div class="card-top ${course.color || 'blue'}">
              <i class="${course.icon || 'fa-brands fa-react'}"></i>
              <span class="status ${course.progress === 100 ? 'completed' : 'pending'}">
                  ${course.progress === 100 ? 'Completed' : 'In Progress'}
              </span>
          </div>
          <div class="card-body">
              <h3>${course.title}</h3>
              <p class="instructor">Instructor: ${course.instructor}</p>
              <div class="course-meta">
                  <span>
                      <i class="fa-solid fa-signal"></i>
                      ${course.level || 'Beginner'}
                  </span>
                  <span>
                      <i class="fa-regular fa-clock"></i>
                      ${course.duration || '12 Hours'}
                  </span>
              </div>
              <h4>${course.progress}% Completed</h4>
              <div class="progress-bar">
                  <div class="progress-fill" style="width:${course.progress}%"></div>
              </div>
              <div class="course-footer">
                  <button class="continue-btn">Continue Learning</button>
              </div>
          </div>
      </div>
    `).join("");
  }

  // Progress Page overall completion stats
  if (progressPagePercentText) progressPagePercentText.textContent = `${profile.overallProgress}%`;
  if (progressPageCircleText) progressPageCircleText.textContent = `${profile.overallProgress}%`;
  if (progressStatCourses) progressStatCourses.textContent = profile.coursesEnrolledCount;
  if (progressStatModules) progressStatModules.textContent = profile.modulesCompletedCount;
  if (progressStatHours) progressStatHours.textContent = `${profile.hoursStudied}h`;
  if (progressStatStreak) progressStatStreak.textContent = profile.dayStreak;

  // Progress Page Course list
  if (progressPageCourseList) {
    progressPageCourseList.innerHTML = courses.map(course => `
      <div class="progress-item">
          <div class="progress-info">
              <span>${course.title}</span>
              <span>${course.progress}%</span>
          </div>
          <div class="progress-bar">
              <div class="progress-fill" style="width:${course.progress}%;"></div>
          </div>
      </div>
    `).join("");
  }

  // Grades Page counters
  if (gradesSemesterGpa) {
    gradesSemesterGpa.textContent = profile.semesterGpa;
    gradesSemesterGpa.setAttribute("data-target", profile.semesterGpa);
  }
  if (gradesCgpa) {
    gradesCgpa.textContent = profile.cgpa;
    gradesCgpa.setAttribute("data-target", profile.cgpa);
  }
  if (gradesCredits) {
    gradesCredits.textContent = profile.creditsEarned;
    gradesCredits.setAttribute("data-target", profile.creditsEarned);
  }
  if (gradesAttendance) {
    gradesAttendance.textContent = profile.attendance;
    gradesAttendance.setAttribute("data-target", profile.attendance);
  }

  // Grades Page table body
  if (gradesTableBody) {
    gradesTableBody.innerHTML = grades.map(grade => `
      <tr>
          <td>${grade.subject}</td>
          <td>${grade.credits}</td>
          <td>${grade.marks}</td>
          <td>
              <span class="grade-badge ${getGradeBadgeClass(grade.grade)}">
                  ${grade.grade}
              </span>
          </td>
          <td>
              <span class="status ${grade.status.toLowerCase() === 'passed' ? 'passed' : 'failed'}">
                  ${grade.status}
              </span>
          </td>
      </tr>
    `).join("");
  }

  // Recent Assessments
  if (assessmentGrid) {
    assessmentGrid.innerHTML = progressData.recentAssessments.map(item => `
      <div class="assessment-card">
          <h4>${item.title}</h4>
          <span class="score">${item.score}</span>
          <p>${item.date}</p>
      </div>
    `).join("");
  }

  // Upcoming Calendar events
  if (upcomingEventsGrid) {
    upcomingEventsGrid.innerHTML = calendarData.events.map(event => `
      <div class="event-card">
          <i class="${event.icon || 'fa-solid fa-calendar'}"></i>
          <h4>${event.title}</h4>
          <p>${event.date} • ${event.time}</p>
      </div>
    `).join("");
  }

  // Calendar stats
  if (calStatAssignments) {
    const assignmentsCount = calendarData.events.filter(e => e.title.toLowerCase().includes("assignment")).length;
    calStatAssignments.textContent = assignmentsCount;
  }
  if (calStatExams) {
    const examsCount = calendarData.events.filter(e => e.title.toLowerCase().includes("exam")).length;
    calStatExams.textContent = examsCount;
  }
  if (calStatClasses) {
    // Mock classes count today
    calStatClasses.textContent = 4;
  }
  if (calStatAttendance) {
    calStatAttendance.textContent = `${profile.attendance}%`;
  }

  // Update schedule reference and trigger first calendar load
  schedules = calendarData.dailySchedules;
  
  // Re-initialize animations
  runCounterAnimation();
  animateProgressBars();
  runDashboardCharts(progressData);
  
  // Load initial calendar render if it exists
  const monthYearEl = document.getElementById("monthYear");
  const calendarDaysEl = document.getElementById("calendarDays");
  if (monthYearEl && calendarDaysEl) {
    renderCalendar(new Date());
    renderSchedule(new Date().getDate());
  }
}

// Loading States Helpers
function hideLoadingOverlay() {
  if (loadingOverlay) {
    loadingOverlay.style.opacity = "0";
    setTimeout(() => {
      loadingOverlay.style.display = "none";
    }, 300);
  }
}

function showErrorBanner(msg) {
  if (errorBanner && errorText) {
    errorText.textContent = msg;
    errorBanner.style.display = "flex";
  }
}

if (closeBannerBtn) {
  closeBannerBtn.addEventListener("click", () => {
    if (errorBanner) errorBanner.style.display = "none";
  });
}

// Logout Listener
const logout = document.querySelector(".logout-btn");
if (logout) {
  logout.addEventListener("click", async () => {
    try {
      await signOut(auth);
      window.location.href = "login.html";
    } catch (err) {
      console.error("Sign out error:", err);
      alert("Failed to log out. Please check your internet connection.");
    }
  });
}

// Dynamic Chart rendering
function runDashboardCharts(progressData) {
  // Chart 1: Grade Overview in Dashboard
  const gradeCtx = document.getElementById("gradeChart");
  if (gradeCtx) {
    if (gradeChartInstance) gradeChartInstance.destroy();
    
    gradeChartInstance = new Chart(gradeCtx, {
      type: "line",
      data: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        datasets: [{
          label: "Average Grade",
          data: progressData.gradeOverview,
          borderColor: "#4F46E5",
          backgroundColor: "rgba(79,70,229,.12)",
          fill: true,
          tension: .4,
          pointRadius: 5,
          pointBackgroundColor: "#4F46E5"
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false } },
          y: { beginAtZero: true, max: 100 }
        }
      }
    });
  }

  // Chart 2: Weekly Learning on Progress page
  const progressCanvas = document.getElementById("progressChart");
  if (progressCanvas) {
    if (progressChartInstance) progressChartInstance.destroy();

    progressChartInstance = new Chart(progressCanvas, {
      type: "line",
      data: {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [{
          label: "Hours Studied",
          data: progressData.weeklyLearning,
          borderColor: "#4F46E5",
          backgroundColor: "rgba(79,70,229,0.12)",
          fill: true,
          tension: .4,
          pointRadius: 5,
          pointBackgroundColor: "#4F46E5",
          pointHoverRadius: 7
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false } },
          y: {
            beginAtZero: true,
            suggestedMax: 8,
            ticks: { stepSize: 2 }
          }
        }
      }
    });
  }

  // Chart 3: Performance trend line chart on Grades page
  const gradesCanvas = document.getElementById("gradesChart");
  if (gradesCanvas) {
    if (gradesChartInstance) gradesChartInstance.destroy();

    gradesChartInstance = new Chart(gradesCanvas, {
      type: "line",
      data: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        datasets: [{
          label: "Average Marks",
          data: progressData.performanceTrend,
          borderColor: "#4F46E5",
          backgroundColor: "rgba(79,70,229,0.12)",
          fill: true,
          tension: .4,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: "#4F46E5"
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false } },
          y: { beginAtZero: true, max: 100 }
        }
      }
    });
  }
}

// Progress Bars animation
function animateProgressBars() {
  const progressBars = document.querySelectorAll(".progress-fill, .course-fill");
  progressBars.forEach(bar => {
    const finalWidth = bar.style.width;
    bar.style.width = "0";
    setTimeout(() => {
      bar.style.width = finalWidth;
    }, 300);
  });
}

// GPA Counter animation
function runCounterAnimation() {
  const counters = document.querySelectorAll(".counter");
  counters.forEach(counter => {
    const target = parseFloat(counter.dataset.target) || 0;
    let count = 0;
    const increment = target / 60;
    
    const updateCounter = () => {
      if (count < target) {
        count += increment;
        if (target % 1 !== 0) {
          counter.innerText = count.toFixed(1);
        } else {
          counter.innerText = Math.floor(count);
        }
        requestAnimationFrame(updateCounter);
      } else {
        if (target % 1 !== 0) {
          counter.innerText = target.toFixed(1);
        } else {
          counter.innerText = target;
        }
      }
    };
    updateCounter();
  });
}

// Page navigation sidebar
const pages = document.querySelectorAll(".page");
const navLinks = document.querySelectorAll("nav a");
navLinks.forEach(link => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const target = link.dataset.page;
    if (!target) return;
    
    pages.forEach(page => {
      page.classList.remove("active");
    });
    document.getElementById(target).classList.add("active");
    
    navLinks.forEach(item => {
      item.parentElement.classList.remove("active");
    });
    link.parentElement.classList.add("active");
  });
});

// View All link from main page to courses page
const viewAllLink = document.querySelector(".view-all-courses-link");
if (viewAllLink) {
  viewAllLink.addEventListener("click", (e) => {
    e.preventDefault();
    const coursesLink = document.querySelector('nav a[data-page="coursesPage"]');
    if (coursesLink) coursesLink.click();
  });
}

// Course Search (Query dynamically to support dynamic updates)
const search = document.querySelector(".course-search input");
if (search) {
  search.addEventListener("keyup", () => {
    const value = search.value.toLowerCase();
    const cards = document.querySelectorAll(".course-card");
    
    cards.forEach(card => {
      const title = card.querySelector("h3").textContent.toLowerCase();
      if (title.includes(value)) {
        card.style.display = "block";
      } else {
        card.style.display = "none";
      }
    });
  });
}

// Course Filter (Query dynamically to support dynamic updates)
const filter = document.getElementById("courseFilter");
if (filter) {
  filter.addEventListener("change", () => {
    const value = filter.value;
    const cards = document.querySelectorAll(".course-card");
    
    cards.forEach(card => {
      const progressFill = card.querySelector(".progress-fill");
      const progress = progressFill ? parseInt(progressFill.style.width) : 0;
      
      if (value === "all") {
        card.style.display = "block";
      } else if (value === "completed") {
        card.style.display = progress === 100 ? "block" : "none";
      } else {
        card.style.display = progress < 100 ? "block" : "none";
      }
    });
  });
}

// Dynamic Calendar logic
const monthYear = document.getElementById("monthYear");
const calendarDays = document.getElementById("calendarDays");
const prevMonth = document.getElementById("prevMonth");
const nextMonth = document.getElementById("nextMonth");
const scheduleTitle = document.getElementById("scheduleTitle");
const scheduleList = document.getElementById("scheduleList");

function renderSchedule(day) {
  if (!scheduleTitle || !scheduleList) return;
  scheduleTitle.innerHTML = `Schedule • ${day}`;
  scheduleList.innerHTML = "";
  
  const events = schedules[day];
  if (!events || events.length === 0) {
    scheduleList.innerHTML = `
      <div class="empty-state" style="text-align: center; padding: 20px; color: #7B7B92;">
          <i class="fa-regular fa-calendar" style="font-size: 32px; margin-bottom: 8px; color: #ECEEF8;"></i>
          <p>No events scheduled.</p>
      </div>
    `;
    return;
  }
  
  events.forEach(event => {
    scheduleList.innerHTML += `
      <div class="schedule-item">
          <div class="event-dot ${event.color}"></div>
          <div>
              <h4>${event.title}</h4>
              <p>${event.time}</p>
          </div>
      </div>
    `;
  });
}

function renderCalendar(date) {
  if (!monthYear || !calendarDays) return;
  calendarDays.innerHTML = "";
  
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();
  
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  monthYear.textContent = `${monthNames[month]} ${year}`;
  
  // Empty Boxes
  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement("div");
    calendarDays.appendChild(empty);
  }
  
  // Days
  const eventDays = Object.keys(schedules).map(Number);
  for (let day = 1; day <= lastDate; day++) {
    const dayBox = document.createElement("div");
    dayBox.classList.add("calendar-day");
    dayBox.textContent = day;
    
    const today = new Date();
    if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
      dayBox.classList.add("today");
    }
    
    if (eventDays.includes(day)) {
      dayBox.classList.add("has-event");
    }
    
    dayBox.addEventListener("click", () => {
      document.querySelectorAll(".calendar-day").forEach(d => d.classList.remove("selected"));
      dayBox.classList.add("selected");
      renderSchedule(day);
    });
    
    calendarDays.appendChild(dayBox);
  }
}

// Month navigation buttons
if (prevMonth && nextMonth) {
  let currentDate = new Date();
  prevMonth.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar(currentDate);
  });
  nextMonth.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar(currentDate);
  });
}

// Fade animations for components
const animatedCards = document.querySelectorAll(
  ".stat-box, .achievement-card, .course-progress-card, .weekly-progress, .gpa-card, .assessment-card, .grades-table-card, .performance-chart"
);
animatedCards.forEach((card, index) => {
  card.style.opacity = "0";
  card.style.transform = "translateY(30px)";
  setTimeout(() => {
    card.style.transition = ".5s ease";
    card.style.opacity = "1";
    card.style.transform = "translateY(0)";
  }, index * 80);
});