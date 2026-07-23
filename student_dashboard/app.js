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
            attendance: 94,
            averageProgress: 0
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
                thumbnail: "https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=400&auto=format&fit=crop&q=80",
                modules: [
                    { id: 1, name: "ES6+ Syntax & Variables", completed: true },
                    { id: 2, name: "Advanced Closures & Scope", completed: true },
                    { id: 3, name: "Asynchronous JS & Promises", completed: true },
                    { id: 4, name: "DOM API & Event Handling", completed: true },
                    { id: 5, name: "Object Oriented JS & Classes", completed: true },
                    { id: 6, name: "Fetch API & REST Integration", completed: true },
                    { id: 7, name: "Client-Side Storage Strategies", completed: true },
                    { id: 8, name: "Vite, Webpack & Build Systems", completed: true },
                    { id: 9, name: "Canvas API & Graphics", completed: true },
                    { id: 10, name: "Unit Testing with Jest", completed: true },
                    { id: 11, name: "Web Workers & Performance", completed: false },
                    { id: 12, name: "Production Deployment CI/CD", completed: false }
                ]
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
                thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&auto=format&fit=crop&q=80",
                modules: [
                    { id: 1, name: "Algorithmic Complexity & Big O", completed: true },
                    { id: 2, name: "Lists, Tuples & Dictionaries", completed: true },
                    { id: 3, name: "Linked Lists (Singly/Doubly)", completed: true },
                    { id: 4, name: "Stacks & Queues", completed: true },
                    { id: 5, name: "Recursion & Trees", completed: true },
                    { id: 6, name: "Binary Search Trees", completed: true },
                    { id: 7, name: "Balanced Trees (AVL/Red-Black)", completed: true },
                    { id: 8, name: "Heaps & Priority Queues", completed: true },
                    { id: 9, name: "Hash Tables & Collisions", completed: true },
                    { id: 10, name: "Graph Representations", completed: true },
                    { id: 11, name: "DFS & BFS Traversals", completed: true },
                    { id: 12, name: "Sorting Algorithms", completed: true },
                    { id: 13, name: "Dynamic Programming Basis", completed: true },
                    { id: 14, name: "Greedy Algorithms", completed: true },
                    { id: 15, name: "Final Capstone Project", completed: true }
                ]
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
                thumbnail: "https://images.unsplash.com/photo-1618788372246-79faff0c3742?w=400&auto=format&fit=crop&q=80",
                modules: [
                    { id: 1, name: "Design Thinking & Research", completed: true },
                    { id: 2, name: "Figma Interface & Drawing Tools", completed: true },
                    { id: 3, name: "Layout Grids & Constraints", completed: true },
                    { id: 4, name: "Color & Digital Typography", completed: false },
                    { id: 5, name: "UI Components & Variants", completed: false },
                    { id: 6, name: "Auto Layout 4.0 Systems", completed: false },
                    { id: 7, name: "Interactive Components", completed: false },
                    { id: 8, name: "Prototyping & Smart Animate", completed: false },
                    { id: 9, name: "Variables & Design Tokens", completed: false },
                    { id: 10, name: "Responsive Layout Methods", completed: false },
                    { id: 11, name: "Design Handoff & Redlines", completed: false },
                    { id: 12, name: "Final Portfolio Case Study", completed: false }
                ]
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
                thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&auto=format&fit=crop&q=80",
                modules: [
                    { id: 1, name: "Intro to Cloud & Networking", completed: false },
                    { id: 2, name: "IAM Policies, Users & Roles", completed: false },
                    { id: 3, name: "EC2 Compute Instances", completed: false },
                    { id: 4, name: "S3 Object Storage & Lifecycles", completed: false },
                    { id: 5, name: "VPC Subnets & Route Tables", completed: false },
                    { id: 6, name: "RDS & DynamoDB Integration", completed: false },
                    { id: 7, name: "Serverless AWS Lambda", completed: false },
                    { id: 8, name: "CloudWatch & Budget Controls", completed: false }
                ]
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

// Calculate progress percent averages and counts dynamically
function calculateDerivedStats() {
    const courses = state.student.courses;
    
    courses.forEach(course => {
        const completed = course.modules.filter(m => m.completed).length;
        course.completedModules = completed;
        course.totalModules = course.modules.length;
        course.progress = Math.round((completed / course.totalModules) * 100);
        
        if (course.progress === 100) {
            course.status = "Completed";
        } else if (course.progress > 0) {
            course.status = "In Progress";
        } else {
            course.status = "Not Started";
        }
    });

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

// ==========================================
// PENDING MODULES SLIDE-OUT DRAWER
// ==========================================
let activeDrawerCourseId = null;

window.openModulesDrawer = function(courseId) {
    const drawer = document.getElementById('modules-drawer');
    const course = state.student.courses.find(c => c.id === courseId);
    if (!drawer || !course) return;

    activeDrawerCourseId = courseId;
    drawer.classList.add('active');
    
    renderDrawerContent();
};

window.closeModulesDrawer = function() {
    const drawer = document.getElementById('modules-drawer');
    if (drawer) {
        drawer.classList.remove('active');
    }
    activeDrawerCourseId = null;
};

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

        // Clicking the card itself triggers checking
        li.addEventListener('click', (e) => {
            // Avoid double trigger if clicking directly on checkbox
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

function toggleModule(courseId, moduleId, completed) {
    const course = state.student.courses.find(c => c.id === courseId);
    if (!course) return;

    const mod = course.modules.find(m => m.id === moduleId);
    if (!mod) return;

    mod.completed = completed;
    
    // Recalculate hours invested dynamically based on completions (baseline 12 + 3 hours per completed module)
    const totalCompleted = state.student.courses.reduce((sum, c) => sum + c.modules.filter(m => m.completed).length, 0);
    state.student.stats.hours = 12 + totalCompleted * 3;

    // Update everything
    updateDashboard();
    renderDrawerContent();
}

// ==========================================
// INTERACTIVE SVGS & TOOLTIPS
// ==========================================

// Global tooltip triggers
window.showTooltip = function(e, text) {
    const tooltip = document.getElementById('chart-tooltip');
    if (!tooltip) return;
    tooltip.innerHTML = text;
    tooltip.style.display = 'block';
    tooltip.style.left = (e.pageX + 12) + 'px';
    tooltip.style.top = (e.pageY - 12) + 'px';
};

window.hideTooltip = function() {
    const tooltip = document.getElementById('chart-tooltip');
    if (tooltip) tooltip.style.display = 'none';
};

// Render Vector SVG Charts based on state metrics
function renderCharts() {
    // A. Bar Chart: Quiz Scores
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
                
                <!-- 70% Pass line -->
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

    // B. Line Chart: Weekly Study Hours
    const lineContainer = document.getElementById('line-chart-container');
    if (lineContainer) {
        const baseHours = [5, 8, 4, 7, 10, 3];
        const totalCompleted = state.student.courses.reduce((sum, c) => sum + c.modules.filter(m => m.completed).length, 0);
        // Dynamic value for Sunday based on completed modules
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

        // Calculate path data
        let pathD = `M ${getX(0)} ${getY(data[0])}`;
        let areaD = `M ${getX(0)} ${height - padding} L ${getX(0)} ${getY(data[0])}`;

        for (let i = 1; i < data.length; i++) {
            pathD += ` L ${getX(i)} ${getY(data[i])}`;
        }
        areaD += pathD.substring(1) + ` L ${getX(data.length - 1)} ${height - padding} Z`;

        // Draw area and line
        lineHtml += `<path d="${areaD}" fill="url(#lineAreaGrad)" />`;
        lineHtml += `<path d="${pathD}" fill="none" stroke="#6366f1" stroke-width="2" stroke-linecap="round" />`;

        // Draw interactive nodes
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

    // C. Concentric Doughnut: Attendance Rates
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
            
            // Draw background stroke
            ringsHtml += `<circle cx="18" cy="18" r="${radius}" fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="2.2" />`;
            // Draw progress stroke
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
