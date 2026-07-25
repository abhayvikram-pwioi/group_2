import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { doc, getDoc, getDocs, collection, query, where } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { 
  localMockProfile, 
  localMockCourses, 
  localMockGrades, 
  localMockProgress, 
  localMockCalendar,
  seedDefaultStudentData
} from "./data-helper.js";

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

// Global variables for Chart JS instances
let gradeChartInstance = null;
let progressChartInstance = null;
let gradesChartInstance = null;
let schedules = localMockCalendar.dailySchedules;

// Route Protection & State
onAuthStateChanged(auth, async (user) => {
  if (!user) {
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

// Fetch from Firestore
async function loadDashboardData(uid, email) {
  const profileSnap = await getDoc(doc(db, "students", uid));
  if (!profileSnap.exists()) {
    console.log("Seeding new profile document...");
    await seedDefaultStudentData(uid, email);
    return loadDashboardData(uid, email);
  }

  const profile = profileSnap.data();

  const qCourses = query(collection(db, "courses"), where("studentId", "==", uid));
  const coursesSnap = await getDocs(qCourses);
  const courses = [];
  coursesSnap.forEach((doc) => {
    courses.push(doc.data());
  });

  const qGrades = query(collection(db, "grades"), where("studentId", "==", uid));
  const gradesSnap = await getDocs(qGrades);
  const grades = [];
  gradesSnap.forEach((doc) => {
    grades.push(doc.data());
  });

  const progressSnap = await getDoc(doc(db, "progress", uid));
  const progressData = progressSnap.exists() ? progressSnap.data() : localMockProgress;

  const calendarSnap = await getDoc(doc(db, "calendar", uid));
  const calendarData = calendarSnap.exists() ? calendarSnap.data() : localMockCalendar;

  renderDashboardUI(profile, courses, grades, progressData, calendarData);
  hideLoadingOverlay();
}

function getGradeBadgeClass(grade) {
  const g = grade.toUpperCase();
  if (g.includes("A+")) return "grade-a-plus";
  if (g === "A") return "grade-a";
  if (g.includes("B+")) return "grade-b-plus";
  if (g === "B") return "grade-b";
  return "grade-c";
}

// Render UI Components with empty state management
function renderDashboardUI(profile, courses, grades, progressData, calendarData) {
  if (welcomeMessage) welcomeMessage.textContent = `Welcome back, ${profile.name.split(" ")[0]}! 👋`;
  if (profileName) profileName.textContent = profile.name;
  if (profileDept) profileDept.textContent = profile.department;
  if (profileImage) profileImage.src = profile.photoUrl || "blank-profile-picture-973460_1280.png";

  if (statProgress) statProgress.textContent = `${profile.overallProgress}%`;
  if (statCourses) statCourses.textContent = profile.coursesEnrolledCount;
  if (statModules) statModules.textContent = profile.modulesCompletedCount;
  if (statGrade) statGrade.textContent = profile.averageGrade;

  // Course Progress on Dashboard
  if (dashboardCourseProgressList) {
    if (courses.length === 0) {
      dashboardCourseProgressList.innerHTML = `<div class="empty-state" style="text-align: center; padding: 20px; color: #7B7B92;"><p>No enrolled courses.</p></div>`;
    } else {
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
  }

  // Course Grid (My Courses page)
  if (coursesGrid) {
    if (courses.length === 0) {
      coursesGrid.innerHTML = `
        <div style="text-align: center; padding: 40px; color: #7B7B92; grid-column: 1/-1;">
            <i class="fa-regular fa-folder-open" style="font-size: 40px; color: #ECEEF8; margin-bottom: 12px;"></i>
            <p>No enrolled courses found.</p>
        </div>
      `;
    } else {
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
                    <span><i class="fa-solid fa-signal"></i> ${course.level || 'Beginner'}</span>
                    <span><i class="fa-regular fa-clock"></i> ${course.duration || '12 Hours'}</span>
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
  }

  if (progressPagePercentText) progressPagePercentText.textContent = `${profile.overallProgress}%`;
  if (progressPageCircleText) progressPageCircleText.textContent = `${profile.overallProgress}%`;
  if (progressStatCourses) progressStatCourses.textContent = profile.coursesEnrolledCount;
  if (progressStatModules) progressStatModules.textContent = profile.modulesCompletedCount;
  if (progressStatHours) progressStatHours.textContent = `${profile.hoursStudied}h`;
  if (progressStatStreak) progressStatStreak.textContent = profile.dayStreak;

  // Course progress items on Progress page
  if (progressPageCourseList) {
    if (courses.length === 0) {
      progressPageCourseList.innerHTML = `<div style="text-align: center; padding: 20px; color: #7B7B92;"><p>No course progress details recorded.</p></div>`;
    } else {
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
  }

  if (gradesSemesterGpa) gradesSemesterGpa.setAttribute("data-target", profile.semesterGpa);
  if (gradesCgpa) gradesCgpa.setAttribute("data-target", profile.cgpa);
  if (gradesCredits) gradesCredits.setAttribute("data-target", profile.creditsEarned);
  if (gradesAttendance) gradesAttendance.setAttribute("data-target", profile.attendance);

  // Grades table body
  if (gradesTableBody) {
    if (grades.length === 0) {
      gradesTableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 20px; color: #7B7B92;">No subject grades recorded.</td></tr>`;
    } else {
      gradesTableBody.innerHTML = grades.map(grade => `
        <tr>
            <td>${grade.subject}</td>
            <td>${grade.credits}</td>
            <td>${grade.marks}</td>
            <td>
                <span class="grade-badge ${getGradeBadgeClass(grade.grade)}">${grade.grade}</span>
            </td>
            <td>
                <span class="status ${grade.status.toLowerCase() === 'passed' ? 'passed' : 'failed'}">${grade.status}</span>
            </td>
        </tr>
      `).join("");
    }
  }

  // Recent Assessments
  if (assessmentGrid) {
    if (!progressData.recentAssessments || progressData.recentAssessments.length === 0) {
      assessmentGrid.innerHTML = `<div style="text-align: center; padding: 20px; color: #7B7B92; grid-column: 1/-1;"><p>No recent assessments completed.</p></div>`;
    } else {
      assessmentGrid.innerHTML = progressData.recentAssessments.map(item => `
        <div class="assessment-card">
            <h4>${item.title}</h4>
            <span class="score">${item.score}</span>
            <p>${item.date}</p>
        </div>
      `).join("");
    }
  }

  // Calendar events
  if (upcomingEventsGrid) {
    if (!calendarData.events || calendarData.events.length === 0) {
      upcomingEventsGrid.innerHTML = `<div style="text-align: center; padding: 20px; color: #7B7B92; grid-column: 1/-1;"><p>No upcoming events.</p></div>`;
    } else {
      upcomingEventsGrid.innerHTML = calendarData.events.map(event => `
        <div class="event-card">
            <i class="${event.icon || 'fa-solid fa-calendar'}"></i>
            <h4>${event.title}</h4>
            <p>${event.date} • ${event.time}</p>
        </div>
      `).join("");
    }
  }

  if (calStatAssignments) {
    const assignmentsCount = calendarData.events.filter(e => e.title.toLowerCase().includes("assignment")).length;
    calStatAssignments.textContent = assignmentsCount;
  }
  if (calStatExams) {
    const examsCount = calendarData.events.filter(e => e.title.toLowerCase().includes("exam")).length;
    calStatExams.textContent = examsCount;
  }
  if (calStatClasses) {
    calStatClasses.textContent = 4;
  }
  if (calStatAttendance) {
    calStatAttendance.textContent = `${profile.attendance}%`;
  }

  schedules = calendarData.dailySchedules;

  runCounterAnimation();
  animateProgressBars();
  runDashboardCharts(progressData);

  const monthYearEl = document.getElementById("monthYear");
  const calendarDaysEl = document.getElementById("calendarDays");
  if (monthYearEl && calendarDaysEl) {
    renderCalendar(new Date());
    renderSchedule(new Date().getDate());
  }
}

// Loading and Error helpers
function hideLoadingOverlay() {
  if (loadingOverlay) {
    loadingOverlay.style.opacity = "0";
    setTimeout(() => { loadingOverlay.style.display = "none"; }, 300);
  }
}

// Error banners
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

// Logout
const logout = document.querySelector(".logout-btn");
if (logout) {
  logout.addEventListener("click", async () => {
    try {
      await signOut(auth);
      window.location.href = "login.html";
    } catch (err) {
      console.error("Sign out error:", err);
      alert("Failed to log out. Please check your connection.");
    }
  });
}

// Dynamic Chart rendering
function runDashboardCharts(progressData) {
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

// Progress bars animation
function animateProgressBars() {
  const progressBars = document.querySelectorAll(".progress-fill, .course-fill");
  progressBars.forEach(bar => {
    const finalWidth = bar.style.width;
    bar.style.width = "0";
    setTimeout(() => { bar.style.width = finalWidth; }, 300);
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
        counter.innerText = target % 1 !== 0 ? target.toFixed(1) : target;
      }
    };
    updateCounter();
  });
}

// Navigation sidebar
const pages = document.querySelectorAll(".page");
const navLinks = document.querySelectorAll("nav a");
navLinks.forEach(link => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const target = link.dataset.page;
    if (!target) return;
    pages.forEach(p => p.classList.remove("active"));
    document.getElementById(target).classList.add("active");
    navLinks.forEach(item => item.parentElement.classList.remove("active"));
    link.parentElement.classList.add("active");
  });
});

// View All link
const viewAllLink = document.querySelector(".view-all-courses-link");
if (viewAllLink) {
  viewAllLink.addEventListener("click", (e) => {
    e.preventDefault();
    const coursesLink = document.querySelector('nav a[data-page="coursesPage"]');
    if (coursesLink) coursesLink.click();
  });
}

// Search
const search = document.querySelector(".course-search input");
if (search) {
  search.addEventListener("keyup", () => {
    const value = search.value.toLowerCase();
    const cards = document.querySelectorAll(".course-card");
    cards.forEach(card => {
      const title = card.querySelector("h3").textContent.toLowerCase();
      card.style.display = title.includes(value) ? "block" : "none";
    });
  });
}

// Filter
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

// Calendar events rendering
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
  
  for (let i = 0; i < firstDay; i++) {
    calendarDays.appendChild(document.createElement("div"));
  }
  
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

// Initial animations
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

// Global Search (Searches across course titles dynamically and switches tab)
const globalSearch = document.getElementById("globalSearch");
const courseSearchInput = document.querySelector(".course-search input");

if (globalSearch) {
  globalSearch.addEventListener("keyup", () => {
    const value = globalSearch.value;
    
    // Switch to My Courses page if not already active
    const activePage = document.querySelector(".page.active");
    if (activePage && activePage.id !== "coursesPage") {
      const coursesLink = document.querySelector('nav a[data-page="coursesPage"]');
      if (coursesLink) coursesLink.click();
    }
    
    // Set course search value and trigger dynamic filter
    if (courseSearchInput) {
      courseSearchInput.value = value;
      courseSearchInput.dispatchEvent(new Event("keyup"));
    }
  });
}

// Theme Toggle (Light/Dark mode + LocalStorage persistence)
const themeToggle = document.getElementById("themeToggle");
if (themeToggle) {
  // Read initial preference
  const savedTheme = localStorage.getItem("theme");
  const themeIcon = themeToggle.querySelector("i");
  
  if (savedTheme === "dark") {
    document.body.classList.add("dark-theme");
    if (themeIcon) {
      themeIcon.classList.remove("fa-moon");
      themeIcon.classList.add("fa-sun");
    }
  }

  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-theme");
    const isDark = document.body.classList.contains("dark-theme");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    
    if (themeIcon) {
      if (isDark) {
        themeIcon.classList.remove("fa-moon");
        themeIcon.classList.add("fa-sun");
      } else {
        themeIcon.classList.remove("fa-sun");
        themeIcon.classList.add("fa-moon");
      }
    }
  });
}