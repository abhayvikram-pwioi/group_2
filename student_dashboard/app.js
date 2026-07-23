// ==========================================
// STUDENT DASHBOARD APP ENGINE (STATE-DRIVEN)
// ==========================================

const state = {
    student: {
        name: "Hasan (0_0)",
        email: "student@eduprogress.com",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        stats: {
            enrolled: 4,
            completed: 1,
            hours: 42,
            attendance: 94
        },
        courses: [
            {
                id: "js",
                title: "Advanced JavaScript",
                instructor: "Sarah Jenkins",
                progress: 83,
                completedModules: 10,
                totalModules: 12,
                status: "In Progress",
                quizScore: 92,
                attendanceRate: 96,
                thumbnail: "https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=400&auto=format&fit=crop&q=80"
            },
            {
                id: "python",
                title: "Data Structures in Python",
                instructor: "Dr. Michael Chen",
                progress: 100,
                completedModules: 15,
                totalModules: 15,
                status: "Completed",
                quizScore: 98,
                attendanceRate: 92,
                thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&auto=format&fit=crop&q=80"
            },
            {
                id: "figma",
                title: "UI/UX Systems with Figma",
                instructor: "Elena Rostova",
                progress: 25,
                completedModules: 3,
                totalModules: 12,
                status: "In Progress",
                quizScore: 82,
                attendanceRate: 88,
                thumbnail: "https://images.unsplash.com/photo-1618788372246-79faff0c3742?w=400&auto=format&fit=crop&q=80"
            },
            {
                id: "cloud",
                title: "Cloud Computing & AWS",
                instructor: "Marcus Vance",
                progress: 0,
                completedModules: 0,
                totalModules: 8,
                status: "Not Started",
                quizScore: 0,
                attendanceRate: 0,
                thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&auto=format&fit=crop&q=80"
            }
        ]
    },
    filters: {
        search: "",
        status: "all"
    }
};

// ==========================================
// CORE APP ROUTING & LIFE CYCLE
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    initApp();
});

function initApp() {
    setupTabRouter();
    setupFilters();
    updateDashboard();
}

// SPA tab switching using JS class updates
function setupTabRouter() {
    const navLinks = document.querySelectorAll('aside nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetTab = link.getAttribute('data-tab');
            if (!targetTab) return;

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

// Setup live search and status chip event listeners
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

// Redraw all dynamic layout items when state changes
function updateDashboard() {
    calculateDerivedStats();
    renderStats();
    renderCourses();
    renderCharts();
    renderGradesTable();
}

// Calculate progress percent averages and counts
function calculateDerivedStats() {
    const courses = state.student.courses;
    
    // Average progress
    const totalProgress = courses.reduce((sum, c) => sum + c.progress, 0);
    state.student.stats.averageProgress = Math.round(totalProgress / courses.length);
    
    // Count completed
    state.student.stats.completed = courses.filter(c => c.progress === 100).length;
    
    // Aggregate attendance average (for courses started)
    const activeAttendanceCourses = courses.filter(c => c.attendanceRate > 0);
    if (activeAttendanceCourses.length > 0) {
        const sumAttendance = activeAttendanceCourses.reduce((sum, c) => sum + c.attendanceRate, 0);
        state.student.stats.attendance = Math.round(sumAttendance / activeAttendanceCourses.length);
    } else {
        state.student.stats.attendance = 0;
    }
}

// ==========================================
// RENDER MODULES
// ==========================================

// 1. Stats and overall circular gauge
function renderStats() {
    const stats = state.student.stats;

    // Numerical stats counters
    document.getElementById('stat-enrolled').textContent = stats.enrolled;
    document.getElementById('stat-completed').textContent = stats.completed;
    document.getElementById('stat-hours').textContent = stats.hours + 'h';
    document.getElementById('stat-attendance').textContent = stats.attendance + '%';

    // Global SVG circular gauge
    const radialBar = document.getElementById('radial-progress-bar');
    const radialText = document.getElementById('radial-progress-text');
    if (radialBar && radialText) {
        radialBar.setAttribute('stroke-dasharray', `${stats.averageProgress}, 100`);
        radialText.textContent = `${stats.averageProgress}%`;
    }
}

// 2. Courses list with interactive actions
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
        grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:2rem; color:var(--text-muted);">No courses found matching criteria.</div>`;
        return;
    }

    filtered.forEach(course => {
        const badgeClass = course.progress === 100 ? 'badge-complete' : (course.progress === 0 ? 'badge-pending' : 'badge-active');
        const isNotStarted = course.progress === 0;
        
        const card = document.createElement('div');
        card.className = "card course-card";
        card.innerHTML = `
            <img src="${course.thumbnail}" alt="${course.title}">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <div class="badge ${badgeClass}">${course.status}</div>
                <span style="font-size:0.7rem; color:var(--text-muted); font-weight:700;">${course.progress}%</span>
            </div>
            <h4>${course.title}</h4>
            <p>Instructor: ${course.instructor}</p>
            <div class="progress-bar"><div class="progress-fill" style="width: ${course.progress}%"></div></div>
            <div style="display:flex; justify-content:space-between; font-size:0.7rem; color:var(--text-muted); margin-bottom:8px;">
                <span>${course.completedModules}/${course.totalModules} Modules</span>
            </div>
            ${course.progress < 100 ? `<button class="btn-complete-module" onclick="completeModule('${course.id}')">${isNotStarted ? 'Start Course' : 'Complete Module'}</button>` : ''}
        `;
        grid.appendChild(card);
    });
}

// Global action handler for completing a module
window.completeModule = function(courseId) {
    const course = state.student.courses.find(c => c.id === courseId);
    if (!course) return;

    if (course.completedModules < course.totalModules) {
        course.completedModules++;
        course.progress = Math.round((course.completedModules / course.totalModules) * 100);
        course.status = "In Progress";
        
        // Add studying hours
        state.student.stats.hours += 3; 

        if (course.progress === 100) {
            course.status = "Completed";
        }

        updateDashboard();
    }
};

// 3. Render Vector SVG Charts based on state metrics
function renderCharts() {
    // A. Bar Chart: Quiz Scores
    const barContainer = document.getElementById('bar-chart-container');
    if (barContainer) {
        const courses = state.student.courses;
        // SVG size
        let barsHtml = `
            <svg viewBox="0 0 200 120" style="width:100%; height:100%;">
                <line x1="20" y1="10" x2="190" y2="10" stroke="var(--border)" stroke-width="0.5" />
                <line x1="20" y1="50" x2="190" y2="50" stroke="var(--border)" stroke-width="0.5" />
                <line x1="20" y1="90" x2="190" y2="90" stroke="var(--border)" stroke-width="0.5" />
                
                <!-- 70% Pass line -->
                <line x1="20" y1="34" x2="190" y2="34" stroke="var(--text-muted)" stroke-width="0.75" stroke-dasharray="2,2" />
        `;
        
        courses.forEach((c, idx) => {
            const x = 32 + (idx * 40);
            const height = Math.round((c.quizScore / 100) * 80);
            const y = 90 - height;
            
            barsHtml += `
                <rect x="${x}" y="${y}" width="14" height="${height}" fill="var(--primary)" rx="1">
                    <title>${c.title}: ${c.quizScore}%</title>
                </rect>
                <text x="${x + 7}" y="102" fill="var(--text-muted)" font-size="5.5" text-anchor="middle">${c.title.split(' ')[0]}</text>
                <text x="${x + 7}" y="${y - 3}" fill="var(--text)" font-size="5" font-weight="bold" text-anchor="middle">${c.quizScore}%</text>
            `;
        });
        
        barsHtml += `</svg>`;
        barContainer.innerHTML = barsHtml;
    }

    // B. Concentric Doughnut: Attendance Rates
    const doughnutContainer = document.getElementById('doughnut-chart-container');
    if (doughnutContainer) {
        const courses = state.student.courses.filter(c => c.attendanceRate > 0);
        
        let ringsHtml = `
            <svg viewBox="0 0 36 36" style="width:70px; height:70px;">
                <circle cx="18" cy="18" r="15.9155" fill="none" stroke="var(--border)" stroke-width="3.2" />
        `;
        
        let legendHtml = `<div style="font-size:0.65rem; display:flex; flex-direction:column; gap:4px;">`;
        const bulletColors = ['var(--primary)', 'var(--success)', 'var(--warning)', '#888'];
        
        courses.forEach((c, idx) => {
            const radius = 15.9155 - (idx * 3.5);
            const perimeter = 2 * Math.PI * radius;
            const offset = perimeter * (1 - c.attendanceRate / 100);
            const color = bulletColors[idx] || '#555';
            
            // Draw background stroke
            ringsHtml += `<circle cx="18" cy="18" r="${radius}" fill="none" stroke="var(--border)" stroke-width="2.5" />`;
            // Draw progress stroke
            ringsHtml += `<circle cx="18" cy="18" r="${radius}" fill="none" stroke="${color}" stroke-width="2.5" 
                stroke-dasharray="${perimeter}" stroke-dashoffset="${offset}" transform="rotate(-90 18 18)" stroke-linecap="round" />`;
            
            legendHtml += `
                <div style="display:flex; align-items:center; gap:4px;">
                    <span style="display:inline-block; width:6px; height:6px; background:${color}; border-radius:50%"></span>
                    ${c.title.split(' ')[0]}: ${c.attendanceRate}%
                </div>
            `;
        });
        
        ringsHtml += `<circle cx="18" cy="18" r="4" fill="var(--bg-card)" /></svg>`;
        legendHtml += `</div>`;
        
        doughnutContainer.innerHTML = ringsHtml + legendHtml;
    }
}

// 4. Render Grades Table (With Editable Content logic)
function renderGradesTable() {
    const tbody = document.getElementById('grades-table-body');
    if (!tbody) return;
    
    tbody.innerHTML = "";

    state.student.courses.forEach((course, idx) => {
        const badgeClass = course.progress === 100 ? 'badge-complete' : (course.progress === 0 ? 'badge-pending' : 'badge-active');
        const tr = document.createElement('tr');
        
        tr.innerHTML = `
            <td><strong>${course.title}</strong></td>
            <td>${course.instructor}</td>
            <td contenteditable="true" class="editable-score" data-id="${course.id}" data-field="quizScore">
                ${course.quizScore}%
            </td>
            <td contenteditable="true" class="editable-score" data-id="${course.id}" data-field="attendanceRate">
                ${course.attendanceRate}%
            </td>
            <td><span class="badge ${badgeClass}">${course.status}</span></td>
        `;
        tbody.appendChild(tr);
    });

    // Handle inline content edits in grades table
    document.querySelectorAll('.editable-score').forEach(cell => {
        cell.addEventListener('blur', (e) => {
            const courseId = cell.getAttribute('data-id');
            const field = cell.getAttribute('data-field');
            const rawVal = e.target.textContent.replace('%', '').trim();
            
            const numVal = parseInt(rawVal);
            if (isNaN(numVal) || numVal < 0 || numVal > 100) {
                // Revert to current value on error
                const course = state.student.courses.find(c => c.id === courseId);
                cell.textContent = course[field] + '%';
                return;
            }

            // Save to state
            const course = state.student.courses.find(c => c.id === courseId);
            if (course) {
                course[field] = numVal;
                updateDashboard();
            }
        });

        // Pressing Enter triggers blur (stops typing linebreaks)
        cell.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                cell.blur();
            }
        });
    });
}
