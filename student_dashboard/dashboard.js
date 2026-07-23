// dashboard.js
// Student Dashboard Controller (Firestore Database Integration & UI Rendering)

import { auth, db, isFirebaseConfigured } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
    doc, 
    getDoc, 
    getDocs, 
    setDoc, 
    updateDoc, 
    collection 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Global Local State
const state = {
    student: {
        name: "",
        email: "",
        avatar: "",
        stats: {
            enrolled: 0,
            completed: 0,
            hours: 0,
            attendance: 0,
            averageProgress: 0
        },
        courses: []
    },
    filters: {
        search: "",
        status: "all"
    }
};

let currentUid = null;
let activeDrawerCourseId = null;

// Default Static Course Outlines (Used for fallback/initializations)
const defaultCoursesList = [
    {
        id: "js",
        title: "Advanced JavaScript",
        instructor: "Sarah Jenkins",
        thumbnail: "https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=400&auto=format&fit=crop&q=80",
        totalModules: 12,
        modules: [
            { id: 1, name: "ES6+ Syntax & Variables" },
            { id: 2, name: "Advanced Closures & Scope" },
            { id: 3, name: "Asynchronous JS & Promises" },
            { id: 4, name: "DOM API & Event Handling" },
            { id: 5, name: "Object Oriented JS & Classes" },
            { id: 6, name: "Fetch API & REST Integration" },
            { id: 7, name: "Client-Side Storage Strategies" },
            { id: 8, name: "Vite, Webpack & Build Systems" },
            { id: 9, name: "Canvas API & Graphics" },
            { id: 10, name: "Unit Testing with Jest" },
            { id: 11, name: "Web Workers & Performance" },
            { id: 12, name: "Production Deployment CI/CD" }
        ]
    },
    {
        id: "python",
        title: "Data Structures in Python",
        instructor: "Dr. Michael Chen",
        thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&auto=format&fit=crop&q=80",
        totalModules: 15,
        modules: [
            { id: 1, name: "Algorithmic Complexity & Big O" },
            { id: 2, name: "Lists, Tuples & Dictionaries" },
            { id: 3, name: "Linked Lists (Singly/Doubly)" },
            { id: 4, name: "Stacks & Queues" },
            { id: 5, name: "Recursion & Trees" },
            { id: 6, name: "Binary Search Trees" },
            { id: 7, name: "Balanced Trees (AVL/Red-Black)" },
            { id: 8, name: "Heaps & Priority Queues" },
            { id: 9, name: "Hash Tables & Collisions" },
            { id: 10, name: "Graph Representations" },
            { id: 11, name: "DFS & BFS Traversals" },
            { id: 12, name: "Sorting Algorithms" },
            { id: 13, name: "Dynamic Programming Basis" },
            { id: 14, name: "Greedy Algorithms" },
            { id: 15, name: "Final Capstone Project" }
        ]
    },
    {
        id: "figma",
        title: "UI/UX Systems with Figma",
        instructor: "Elena Rostova",
        thumbnail: "https://images.unsplash.com/photo-1618788372246-79faff0c3742?w=400&auto=format&fit=crop&q=80",
        totalModules: 12,
        modules: [
            { id: 1, name: "Design Thinking & Research" },
            { id: 2, name: "Figma Interface & Drawing Tools" },
            { id: 3, name: "Layout Grids & Constraints" },
            { id: 4, name: "Color & Digital Typography" },
            { id: 5, name: "UI Components & Variants" },
            { id: 6, name: "Auto Layout 4.0 Systems" },
            { id: 7, name: "Interactive Components" },
            { id: 8, name: "Prototyping & Smart Animate" },
            { id: 9, name: "Variables & Design Tokens" },
            { id: 10, name: "Responsive Layout Methods" },
            { id: 11, name: "Design Handoff & Redlines" },
            { id: 12, name: "Final Portfolio Case Study" }
        ]
    },
    {
        id: "cloud",
        title: "Cloud Computing & AWS",
        instructor: "Marcus Vance",
        thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&auto=format&fit=crop&q=80",
        totalModules: 8,
        modules: [
            { id: 1, name: "Intro to Cloud & Networking" },
            { id: 2, name: "IAM Policies, Users & Roles" },
            { id: 3, name: "EC2 Compute Instances" },
            { id: 4, name: "S3 Object Storage & Lifecycles" },
            { id: 5, name: "VPC Subnets & Route Tables" },
            { id: 6, name: "RDS & DynamoDB Integration" },
            { id: 7, name: "Serverless AWS Lambda" },
            { id: 8, name: "CloudWatch & Budget Controls" }
        ]
    }
];

// Session state listener
if (isFirebaseConfigured) {
    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            window.location.href = "login.html";
            return;
        }
        
        currentUid = user.uid;
        await startApp();
    });
} else {
    // Show mock mode alert
    showFirebaseConfigWarning();

    // Check localStorage session
    const mockUserJson = localStorage.getItem("mock_user");
    if (!mockUserJson) {
        window.location.href = "login.html";
    } else {
        const mockUser = JSON.parse(mockUserJson);
        currentUid = mockUser.uid;
        startApp();
    }
}

// Initialize loading flow
async function startApp() {
    try {
        // Show Loading Overlay
        document.getElementById("loading-overlay").style.display = "flex";
        
        if (isFirebaseConfigured) {
            // 1. Ensure course metadata is present in Firestore
            await ensureCoursesMetadata();
            // 2. Fetch student data from database
            await loadDashboardDataFirebase(currentUid);
        } else {
            // Fetch student data from LocalStorage mock database
            loadDashboardDataMock(currentUid);
        }
        
        // 3. Initialize UI listeners and update elements
        initApp();
        
        // Hide Loading Overlay
        document.getElementById("loading-overlay").style.display = "none";
    } catch (error) {
        console.error("Dashboard loading error:", error);
        alert("Failed to load dashboard data. Please reload the page.");
        document.getElementById("loading-overlay").style.display = "none";
    }
}

// App Entry Point
function initApp() {
    setupTabRouter();
    setupFilters();
    setupLogout();
    updateDashboardUI();
}

// 1. SPA Tab switching logic
function setupTabRouter() {
    const navLinks = document.querySelectorAll('aside nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetTab = link.getAttribute('data-tab');
            if (!targetTab) return; // Ignore links like Logout
            
            e.preventDefault();

            // Highlight Active Link
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            // Switch active tab pane
            document.querySelectorAll('.tab-pane').forEach(pane => {
                pane.classList.remove('active');
            });
            const activePane = document.getElementById(`tab-${targetTab}`);
            if (activePane) activePane.classList.add('active');
        });
    });
}

// 2. Set up live search and status filters
function setupFilters() {
    const searchInput = document.getElementById('course-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            state.filters.search = e.target.value;
            renderCourses();
        });
    }

    const filterChips = document.querySelectorAll('.chip');
    filterChips.forEach(chip => {
        chip.addEventListener('click', () => {
            filterChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            state.filters.status = chip.getAttribute('data-filter');
            renderCourses();
        });
    });
}

// 3. Set up Logout handler
function setupLogout() {
    const logoutLink = document.getElementById("logout-link");
    if (logoutLink) {
        logoutLink.addEventListener("click", async (e) => {
            e.preventDefault();
            if (confirm("Are you sure you want to log out?")) {
                if (isFirebaseConfigured) {
                    try {
                        await signOut(auth);
                    } catch (err) {
                        console.error("Logout Error:", err);
                        alert("Failed to log out. Please try again.");
                    }
                } else {
                    // Local mock logout
                    localStorage.removeItem("mock_user");
                    window.location.href = "login.html";
                }
            }
        });
    }
}

// Ensure the 4 base courses exist in Firestore
async function ensureCoursesMetadata() {
    const jsDoc = await getDoc(doc(db, "courses", "js"));
    if (jsDoc.exists()) return; // Already initialized

    for (const course of defaultCoursesList) {
        await setDoc(doc(db, "courses", course.id), course);
    }
}

// Load all student state from Firestore database
async function loadDashboardDataFirebase(uid) {
    // 1. Fetch Student Info
    const studentSnap = await getDoc(doc(db, "students", uid));
    if (!studentSnap.exists()) {
        // Fallback: If signup data failed to initialize, create it here
        const email = auth.currentUser.email;
        const name = email.split("@")[0];
        await setDoc(doc(db, "students", uid), {
            name: name,
            email: email,
            avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
            stats: { enrolled: 4, completed: 0, hours: 12, attendance: 0 }
        });
        return loadDashboardDataFirebase(uid);
    }
    
    const studentData = studentSnap.data();
    state.student.name = studentData.name;
    state.student.email = studentData.email;
    state.student.avatar = studentData.avatar;
    state.student.stats = studentData.stats;

    // 2. Fetch Course Definitions
    const coursesSnap = await getDocs(collection(db, "courses"));
    const courseTemplates = [];
    coursesSnap.forEach(snap => {
        courseTemplates.push(snap.data());
    });

    // 3. Fetch User Progress & Grades for each course
    state.student.courses = [];
    let overallProgressSum = 0;
    
    for (const c of courseTemplates) {
        const progSnap = await getDoc(doc(db, "progress", `${uid}_${c.id}`));
        const gradeSnap = await getDoc(doc(db, "grades", `${uid}_${c.id}`));

        // Default placeholders if data does not exist
        const progData = progSnap.exists() ? progSnap.data() : { completedModules: [], progress: 0 };
        const gradeData = gradeSnap.exists() ? gradeSnap.data() : { quizScore: 0, attendanceRate: 0 };

        // Map course module arrays to add the "completed" field
        const modules = c.modules.map(mod => {
            return {
                id: mod.id,
                name: mod.name,
                completed: progData.completedModules.includes(mod.id)
            };
        });

        const status = progData.progress === 100 ? "Completed" : (progData.progress > 0 ? "In Progress" : "Not Started");
        overallProgressSum += progData.progress;

        state.student.courses.push({
            id: c.id,
            title: c.title,
            instructor: c.instructor,
            thumbnail: c.thumbnail,
            totalModules: c.totalModules,
            modules: modules,
            completedModules: progData.completedModules.length,
            progress: progData.progress,
            quizScore: gradeData.quizScore,
            attendanceRate: gradeData.attendanceRate,
            status: status
        });
    }

    // Set derived average progress
    state.student.stats.averageProgress = state.student.courses.length > 0 
        ? Math.round(overallProgressSum / state.student.courses.length) 
        : 0;
}

// Load student state from LocalStorage mock database
function loadDashboardDataMock(uid) {
    const studentData = JSON.parse(localStorage.getItem(`mock_students_${uid}`) || "{}");
    state.student.name = studentData.name || "Mock Student";
    state.student.email = studentData.email || "student@eduprogress.com";
    state.student.avatar = studentData.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80";
    state.student.stats = studentData.stats || { enrolled: 4, completed: 1, hours: 42, attendance: 94 };

    state.student.courses = [];
    let overallProgressSum = 0;

    for (const c of defaultCoursesList) {
        const progData = JSON.parse(localStorage.getItem(`mock_progress_${uid}_${c.id}`) || '{"completedModules": [], "progress": 0}');
        const gradeData = JSON.parse(localStorage.getItem(`mock_grades_${uid}_${c.id}`) || '{"quizScore": 0, "attendanceRate": 0}');

        const modules = c.modules.map(mod => {
            return {
                id: mod.id,
                name: mod.name,
                completed: progData.completedModules.includes(mod.id)
            };
        });

        const status = progData.progress === 100 ? "Completed" : (progData.progress > 0 ? "In Progress" : "Not Started");
        overallProgressSum += progData.progress;

        state.student.courses.push({
            id: c.id,
            title: c.title,
            instructor: c.instructor,
            thumbnail: c.thumbnail,
            totalModules: c.totalModules,
            modules: modules,
            completedModules: progData.completedModules.length,
            progress: progData.progress,
            quizScore: gradeData.quizScore,
            attendanceRate: gradeData.attendanceRate,
            status: status
        });
    }

    state.student.stats.averageProgress = state.student.courses.length > 0 
        ? Math.round(overallProgressSum / state.student.courses.length) 
        : 0;
}

// Redraw all UI elements based on state
function updateDashboardUI() {
    // Render profile details
    const nameEl = document.getElementById("student-name");
    const emailEl = document.getElementById("student-email");
    if (nameEl) nameEl.textContent = state.student.name;
    if (emailEl) emailEl.textContent = state.student.email;

    renderStats();
    renderCourses();
    renderCharts();
    renderGradesTable();
}

// Render overall stats metrics
function renderStats() {
    const stats = state.student.stats;

    const enrolledEl = document.getElementById('stat-enrolled');
    const completedEl = document.getElementById('stat-completed');
    const hoursEl = document.getElementById('stat-hours');
    const attendanceEl = document.getElementById('stat-attendance');

    if (enrolledEl) enrolledEl.textContent = stats.enrolled;
    if (completedEl) completedEl.textContent = stats.completed;
    if (hoursEl) hoursEl.textContent = stats.hours + 'h';
    if (attendanceEl) attendanceEl.textContent = stats.attendance + '%';

    // Global SVG circular completion gauge
    const radialBar = document.getElementById('radial-progress-bar');
    const radialText = document.getElementById('radial-progress-text');
    if (radialBar && radialText) {
        radialBar.setAttribute('stroke-dasharray', `${stats.averageProgress}, 100`);
        radialText.textContent = `${stats.averageProgress}%`;
    }
}

// Render courses progress cards grid
function renderCourses() {
    const grid = document.getElementById('courses-grid');
    if (!grid) return;
    
    grid.innerHTML = "";

    const query = state.filters.search.toLowerCase();
    const statusFilter = state.filters.status;

    const filtered = state.student.courses.filter(course => {
        const matchesSearch = course.title.toLowerCase().includes(query) || course.instructor.toLowerCase().includes(query);
        let matchesStatus = true;
        if (statusFilter === 'in-progress') {
            matchesStatus = course.progress > 0 && course.progress < 100;
        } else if (statusFilter === 'completed') {
            matchesStatus = course.progress === 100;
        } else if (statusFilter === 'not-started') {
            matchesStatus = course.progress === 0;
        }
        return matchesSearch && matchesStatus;
    });

    if (filtered.length === 0) {
        grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:3rem; color:var(--text-muted); font-size: 0.9rem;">No courses found matching criteria.</div>`;
        return;
    }

    filtered.forEach(course => {
        const badgeClass = course.progress === 100 ? 'badge-complete' : (course.progress === 0 ? 'badge-pending' : 'badge-active');
        
        const card = document.createElement('div');
        card.className = "card course-card";
        card.innerHTML = `
            <div class="course-card-image-wrap">
                <img src="${course.thumbnail}" alt="${course.title}">
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <div class="badge ${badgeClass}">${course.status}</div>
                <span style="font-size:0.75rem; color:var(--text-muted); font-weight:700;">${course.progress}%</span>
            </div>
            <h4>${course.title}</h4>
            <p>Instructor: ${course.instructor}</p>
            <div class="progress-container">
                <div class="progress-labels">
                    <span>Syllabus Progress</span>
                    <span>${course.completedModules}/${course.totalModules} Modules</span>
                </div>
                <div class="progress-bar"><div class="progress-fill" style="width: ${course.progress}%"></div></div>
            </div>
            <button class="btn-manage-modules" onclick="openModulesDrawer('${course.id}')">Manage Modules</button>
        `;
        grid.appendChild(card);
    });
}

// Drawer content drawing
function renderDrawerContent() {
    if (!activeDrawerCourseId) return;
    const course = state.student.courses.find(c => c.id === activeDrawerCourseId);
    if (!course) return;

    document.getElementById('drawer-course-title').textContent = course.title;
    document.getElementById('drawer-course-instructor').textContent = `Instructor: ${course.instructor}`;
    document.getElementById('drawer-progress-percent').textContent = `${course.progress}%`;
    document.getElementById('drawer-progress-fill').style.width = `${course.progress}%`;

    const list = document.getElementById('drawer-modules-list');
    if (!list) return;
    list.innerHTML = "";

    course.modules.forEach(mod => {
        const li = document.createElement('li');
        li.className = `module-item ${mod.completed ? 'completed' : ''}`;
        
        li.innerHTML = `
            <input type="checkbox" id="chk-mod-${mod.id}" ${mod.completed ? 'checked' : ''}>
            <div class="module-details">
                <span class="module-title">${mod.name}</span>
                <span class="module-desc">Module ${mod.id} • Syllabus Subject Unit</span>
            </div>
        `;

        li.addEventListener('click', (e) => {
            if (e.target.tagName !== 'INPUT') {
                const chk = li.querySelector('input[type="checkbox"]');
                chk.checked = !chk.checked;
                toggleModule(activeDrawerCourseId, mod.id, chk.checked);
            } else {
                toggleModule(activeDrawerCourseId, mod.id, e.target.checked);
            }
        });

        list.appendChild(li);
    });
}

// Module checked toggle callback
async function toggleModule(courseId, moduleId, completed) {
    const course = state.student.courses.find(c => c.id === courseId);
    if (!course) return;

    const mod = course.modules.find(m => m.id === moduleId);
    if (!mod) return;

    mod.completed = completed;
    
    // Find all completed module IDs for this course
    const completedIds = course.modules
        .filter(m => m.completed)
        .map(m => m.id);

    const calculatedProgress = Math.round((completedIds.length / course.totalModules) * 100);

    try {
        if (isFirebaseConfigured) {
            // 1. Save to progress collection in Firestore
            await setDoc(doc(db, "progress", `${currentUid}_${courseId}`), {
                studentId: currentUid,
                courseId: courseId,
                completedModules: completedIds,
                progress: calculatedProgress
            }, { merge: true });

            // 2. Refresh local state
            await updateAllStudentStats();
            await loadDashboardDataFirebase(currentUid);
        } else {
            // Local Mock toggle module update
            localStorage.setItem(`mock_progress_${currentUid}_${courseId}`, JSON.stringify({
                studentId: currentUid,
                courseId: courseId,
                completedModules: completedIds,
                progress: calculatedProgress
            }));

            updateAllStudentStatsMock();
            loadDashboardDataMock(currentUid);
        }

        // 3. Refresh UI
        updateDashboardUI();
        renderDrawerContent();
    } catch (err) {
        console.error("Failed to update module state:", err);
        alert("Unable to save progress. Please check your network connection.");
    }
}

// Render dynamic grades table
function renderGradesTable() {
    const tbody = document.getElementById('grades-table-body');
    if (!tbody) return;
    
    tbody.innerHTML = "";

    state.student.courses.forEach((course) => {
        const badgeClass = course.progress === 100 ? 'badge-complete' : (course.progress === 0 ? 'badge-pending' : 'badge-active');
        const tr = document.createElement('tr');
        
        tr.innerHTML = `
            <td><strong>${course.title}</strong></td>
            <td>${course.instructor}</td>
            <td>
                <span contenteditable="true" class="editable-score" data-id="${course.id}" data-field="quizScore">
                    ${course.quizScore}%
                </span>
            </td>
            <td>
                <span contenteditable="true" class="editable-score" data-id="${course.id}" data-field="attendanceRate">
                    ${course.attendanceRate}%
                </span>
            </td>
            <td><span class="badge ${badgeClass}">${course.status}</span></td>
        `;
        tbody.appendChild(tr);
    });

    // Inline grades editable score cells handling
    document.querySelectorAll('.editable-score').forEach(cell => {
        cell.addEventListener('blur', async (e) => {
            const courseId = cell.getAttribute('data-id');
            const field = cell.getAttribute('data-field');
            const rawVal = e.target.textContent.replace('%', '').trim();
            
            const numVal = parseInt(rawVal);
            if (isNaN(numVal) || numVal < 0 || numVal > 100) {
                // Revert UI on invalid values
                const course = state.student.courses.find(c => c.id === courseId);
                cell.textContent = course[field] + '%';
                return;
            }

            try {
                if (isFirebaseConfigured) {
                    // Save to Firestore grades collection
                    await setDoc(doc(db, "grades", `${currentUid}_${courseId}`), {
                        studentId: currentUid,
                        courseId: courseId,
                        [field]: numVal
                    }, { merge: true });

                    // Refresh state and update UI
                    await updateAllStudentStats();
                    await loadDashboardDataFirebase(currentUid);
                } else {
                    // Local storage mock save
                    const currentGrade = JSON.parse(localStorage.getItem(`mock_grades_${currentUid}_${courseId}`) || '{"quizScore":0,"attendanceRate":0}');
                    currentGrade[field] = numVal;
                    localStorage.setItem(`mock_grades_${currentUid}_${courseId}`, JSON.stringify(currentGrade));

                    updateAllStudentStatsMock();
                    loadDashboardDataMock(currentUid);
                }
                
                updateDashboardUI();
            } catch (err) {
                console.error("Failed to update grades:", err);
                alert("Failed to save grade. Reverting change.");
                if (isFirebaseConfigured) {
                    await loadDashboardDataFirebase(currentUid);
                } else {
                    loadDashboardDataMock(currentUid);
                }
                updateDashboardUI();
            }
        });

        cell.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                cell.blur();
            }
        });
    });
}

// Helper to recalculate stats and save to Firestore
async function updateAllStudentStats() {
    if (!currentUid) return;

    const enrolledCount = state.student.courses.length;
    let completedCount = 0;
    let totalProgressSum = 0;
    let sumAttendance = 0;
    let activeAttendanceCourses = 0;
    let totalCompletedModules = 0;

    state.student.courses.forEach(c => {
        if (c.progress === 100) {
            completedCount++;
        }
        totalProgressSum += c.progress;
        
        if (c.attendanceRate > 0) {
            sumAttendance += c.attendanceRate;
            activeAttendanceCourses++;
        }
        
        totalCompletedModules += c.completedModules;
    });

    const avgAttendance = activeAttendanceCourses > 0 ? Math.round(sumAttendance / activeAttendanceCourses) : 0;
    const hoursInvested = 12 + totalCompletedModules * 3; // Baseline 12h + 3h per completed module

    try {
        await updateDoc(doc(db, "students", currentUid), {
            "stats.enrolled": enrolledCount,
            "stats.completed": completedCount,
            "stats.hours": hoursInvested,
            "stats.attendance": avgAttendance
        });
    } catch (err) {
        console.error("Failed to update student stats doc:", err);
    }
}

// Helper to recalculate stats and save to LocalStorage (Mock Mode)
function updateAllStudentStatsMock() {
    if (!currentUid) return;

    const enrolledCount = state.student.courses.length;
    let completedCount = 0;
    let totalProgressSum = 0;
    let sumAttendance = 0;
    let activeAttendanceCourses = 0;
    let totalCompletedModules = 0;

    state.student.courses.forEach(c => {
        if (c.progress === 100) {
            completedCount++;
        }
        totalProgressSum += c.progress;
        
        if (c.attendanceRate > 0) {
            sumAttendance += c.attendanceRate;
            activeAttendanceCourses++;
        }
        
        totalCompletedModules += c.completedModules;
    });

    const avgAttendance = activeAttendanceCourses > 0 ? Math.round(sumAttendance / activeAttendanceCourses) : 0;
    const hoursInvested = 12 + totalCompletedModules * 3;

    const studentKey = `mock_students_${currentUid}`;
    const studentData = JSON.parse(localStorage.getItem(studentKey) || "{}");
    studentData.stats = {
        enrolled: enrolledCount,
        completed: completedCount,
        hours: hoursInvested,
        attendance: avgAttendance
    };
    localStorage.setItem(studentKey, JSON.stringify(studentData));
}

// ------------------------------------------
// SVG Vector Rendering for Analytics Charts
// ------------------------------------------
function renderCharts() {
    // 1. Exam & Quiz Scores Bar Chart
    const barContainer = document.getElementById('bar-chart-container');
    if (barContainer) {
        const courses = state.student.courses;
        let barsHtml = `
            <svg viewBox="0 0 200 120" style="width:100%; height:100%; overflow:visible;">
                <defs>
                    <linearGradient id="barGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stop-color="#a78bfa" />
                        <stop offset="100%" stop-color="#8b5cf6" />
                    </linearGradient>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#8b5cf6" flood-opacity="0.3" />
                    </filter>
                </defs>
                <line x1="20" y1="10" x2="190" y2="10" stroke="var(--border)" stroke-width="0.5" />
                <line x1="20" y1="50" x2="190" y2="50" stroke="var(--border)" stroke-width="0.5" />
                <line x1="20" y1="90" x2="190" y2="90" stroke="var(--border)" stroke-width="0.5" />
                
                <line x1="20" y1="34" x2="190" y2="34" stroke="var(--danger)" stroke-width="0.75" stroke-dasharray="2,2" />
                <text x="188" y="31" fill="var(--danger)" font-size="4.5" text-anchor="end" font-weight="700">Passing (70%)</text>
        `;
        
        courses.forEach((c, idx) => {
            const x = 32 + (idx * 40);
            const height = Math.round((c.quizScore / 100) * 80);
            const y = 90 - height;
            
            barsHtml += `
                <rect class="chart-bar" x="${x}" y="${y}" width="16" height="${height}" fill="url(#barGrad)" rx="3" filter="url(#glow)"
                    onmousemove="showTooltip(event, '<strong>${c.title}</strong><br/>Score: <strong>${c.quizScore}%</strong><br/>Instructor: ${c.instructor}')"
                    onmouseout="hideTooltip()">
                </rect>
                <text x="${x + 8}" y="102" fill="var(--text-muted)" font-size="6" font-family="'Outfit', sans-serif" text-anchor="middle">${c.title.split(' ')[0]}</text>
                <text x="${x + 8}" y="${y - 4}" fill="var(--text)" font-size="6" font-weight="700" font-family="'Outfit', sans-serif" text-anchor="middle">${c.quizScore}%</text>
            `;
        });
        
        barsHtml += `</svg>`;
        barContainer.innerHTML = barsHtml;
    }

    // 2. Weekly Study Hours Line Chart
    const lineContainer = document.getElementById('line-chart-container');
    if (lineContainer) {
        const baseHours = [5, 8, 4, 7, 10, 3];
        const totalCompleted = state.student.courses.reduce((sum, c) => sum + c.completedModules, 0);
        const dynamicSunday = Math.min(14, 2 + totalCompleted * 0.8);
        const data = [...baseHours, parseFloat(dynamicSunday.toFixed(1))];
        const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

        const width = 200;
        const height = 120;
        const padding = 20;

        const maxVal = Math.max(...data, 10);
        const getX = (idx) => padding + (idx * (width - 2 * padding) / (data.length - 1));
        const getY = (val) => height - padding - (val * (height - 2 * padding) / maxVal);

        let lineHtml = `
            <svg viewBox="0 0 ${width} ${height}" style="width:100%; height:100%; overflow:visible;">
                <defs>
                    <linearGradient id="lineAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stop-color="#6366f1" stop-opacity="0.25" />
                        <stop offset="100%" stop-color="#6366f1" stop-opacity="0.0" />
                    </linearGradient>
                </defs>
                <line x1="${padding}" y1="${getY(0)}" x2="${width - padding}" y2="${getY(0)}" stroke="var(--border)" stroke-width="0.5" />
                <line x1="${padding}" y1="${getY(maxVal / 2)}" x2="${width - padding}" y2="${getY(maxVal / 2)}" stroke="var(--border)" stroke-width="0.5" />
                <line x1="${padding}" y1="${getY(maxVal)}" x2="${width - padding}" y2="${getY(maxVal)}" stroke="var(--border)" stroke-width="0.5" />
        `;

        let pathD = `M ${getX(0)} ${getY(data[0])}`;
        let areaD = `M ${getX(0)} ${height - padding} L ${getX(0)} ${getY(data[0])}`;

        for (let i = 1; i < data.length; i++) {
            pathD += ` L ${getX(i)} ${getY(data[i])}`;
        }
        areaD += pathD.substring(1) + ` L ${getX(data.length - 1)} ${height - padding} Z`;

        lineHtml += `<path d="${areaD}" fill="url(#lineAreaGrad)" />`;
        lineHtml += `<path d="${pathD}" fill="none" stroke="#6366f1" stroke-width="2" stroke-linecap="round" />`;

        data.forEach((val, idx) => {
            const cx = getX(idx);
            const cy = getY(val);
            
            lineHtml += `
                <circle class="chart-point" cx="${cx}" cy="${cy}" r="3.5" fill="#8b5cf6" stroke="#090d16" stroke-width="1.5"
                    onmousemove="showTooltip(event, '<strong>${days[idx]}</strong><br/>Hours spent: <strong>${val}h</strong>')"
                    onmouseout="hideTooltip()">
                </circle>
                <text x="${cx}" y="${height - 4}" fill="var(--text-muted)" font-size="6.5" font-family="'Outfit', sans-serif" text-anchor="middle">${days[idx]}</text>
            `;
        });

        lineHtml += `</svg>`;
        lineContainer.innerHTML = lineHtml;
    }

    // 3. lecture Attendance Rings
    const doughnutContainer = document.getElementById('doughnut-chart-container');
    if (doughnutContainer) {
        const courses = state.student.courses.filter(c => c.attendanceRate > 0);
        
        let ringsHtml = `
            <svg viewBox="0 0 36 36" style="width:75px; height:75px; overflow:visible;">
                <circle cx="18" cy="18" r="15.9155" fill="none" stroke="var(--border)" stroke-width="3" />
        `;
        
        let legendHtml = `<div style="font-size:0.75rem; display:flex; flex-direction:column; gap:6px;">`;
        const bulletColors = ['#8b5cf6', '#10b981', '#f59e0b', '#3b82f6'];
        
        courses.forEach((c, idx) => {
            const radius = 15.9155 - (idx * 3.2);
            const perimeter = 2 * Math.PI * radius;
            const offset = perimeter * (1 - c.attendanceRate / 100);
            const color = bulletColors[idx] || '#555';
            
            ringsHtml += `<circle cx="18" cy="18" r="${radius}" fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="2.2" />`;
            ringsHtml += `<circle class="concentric-ring" cx="18" cy="18" r="${radius}" fill="none" stroke="${color}" stroke-width="2.2" 
                stroke-dasharray="${perimeter}" stroke-dashoffset="${offset}" transform="rotate(-90 18 18)" stroke-linecap="round"
                style="color: ${color};"
                onmousemove="showTooltip(event, '<strong>${c.title}</strong><br/>Attendance: <strong>${c.attendanceRate}%</strong>')"
                onmouseout="hideTooltip()" />`;
            
            legendHtml += `
                <div style="display:flex; align-items:center; gap:6px; color: var(--text);">
                    <span style="display:inline-block; width:8px; height:8px; background:${color}; border-radius:50%"></span>
                    <span style="font-weight: 500;">${c.title.split(' ')[0]}:</span> 
                    <span style="color: var(--text-muted); font-weight: 600;">${c.attendanceRate}%</span>
                </div>
            `;
        });
        
        ringsHtml += `<circle cx="18" cy="18" r="5" fill="#0d1222" /></svg>`;
        legendHtml += `</div>`;
        
        doughnutContainer.innerHTML = ringsHtml + legendHtml;
    }
}

// ------------------------------------------
// Drawer Handlers and Tooltips Exports
// ------------------------------------------
function openModulesDrawer(courseId) {
    const drawer = document.getElementById('modules-drawer');
    const course = state.student.courses.find(c => c.id === courseId);
    if (!drawer || !course) return;

    activeDrawerCourseId = courseId;
    drawer.classList.add('active');
    
    renderDrawerContent();
}

function closeModulesDrawer() {
    const drawer = document.getElementById('modules-drawer');
    if (drawer) {
        drawer.classList.remove('active');
    }
    activeDrawerCourseId = null;
}

function showTooltip(e, text) {
    const tooltip = document.getElementById('chart-tooltip');
    if (!tooltip) return;
    tooltip.innerHTML = text;
    tooltip.style.display = 'block';
    tooltip.style.left = (e.pageX + 12) + 'px';
    tooltip.style.top = (e.pageY - 12) + 'px';
}

function hideTooltip() {
    const tooltip = document.getElementById('chart-tooltip');
    if (tooltip) tooltip.style.display = 'none';
}

// Inject warning banner (Mock mode indicator)
function showFirebaseConfigWarning() {
    let warningBanner = document.getElementById("firebase-warning");
    if (!warningBanner) {
        warningBanner = document.createElement("div");
        warningBanner.id = "firebase-warning";
        warningBanner.style.cssText = "background: #f59e0b; color: #090d16; text-align: center; padding: 12px; font-size: 0.9rem; font-weight: 700; width: 100%; box-sizing: border-box; z-index: 10000; position: sticky; top: 0; font-family: sans-serif;";
        warningBanner.innerHTML = '⚠️ Running in Local Mock Mode (LocalStorage). To connect to Firestore, add your credentials in <code>firebase-config.js</code>.';
        document.body.insertBefore(warningBanner, document.body.firstChild);
    }
}

// Bind to window object for access from inline HTML event triggers
window.openModulesDrawer = openModulesDrawer;
window.closeModulesDrawer = closeModulesDrawer;
window.showTooltip = showTooltip;
window.hideTooltip = hideTooltip;
