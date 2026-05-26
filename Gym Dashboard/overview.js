

const user_name =
    document.getElementById("user_name");



const renewal_date = document.getElementById("Renewal_date");
const days_remaining = document.getElementById("rem_date");
const profile_name = document.getElementById("profile-name");

let user_number = 0;

const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("logged_in_user");
        window.location.href = "login.html";
    });
}

async function load() {
    const loggedInUser = localStorage.getItem("logged_in_user");
    if (!loggedInUser) {
        window.location.href = "login.html";
        return;
    }

    const loadStart = Date.now();

    try {
        const [res1, res2] = await Promise.all([
            fetch("data.json"),
            fetch("moredata.json")
        ]);
        const data = await res1.json();
        const moreData = await res2.json();
        
        let member = data.members.find(m => m.username === loggedInUser);
        if (!member) {
            // If the user signed up locally and isn't in data.json, assign them a random member's data
            const nonUtkarshMembers = data.members.filter(m => m.username !== "Utkarsh");
            const baseMembers = nonUtkarshMembers.length > 0 ? nonUtkarshMembers : data.members;
            const randomBase = baseMembers[Math.floor(Math.random() * baseMembers.length)];
            
            // Get any custom signup info from localStorage to keep it consistent
            const signedUpUsers = JSON.parse(localStorage.getItem("signedUpUsers") || "[]");
            const localUser = signedUpUsers.find(u => u.username === loggedInUser) || {};
            
            member = {
                ...randomBase,
                ...localUser,
                username: loggedInUser
            };
        }
        
        const moreMember = moreData.memberSchedules.find(m => m.username === member.username) || {};
        const mergedData = { ...member, ...moreMember };
        
        appState.currentUser = mergedData;
        console.log("Merged AppState:", appState);
        
        load_user_data(mergedData);

        // Dismiss the skeleton with a smooth fade-out
        const elapsed = Date.now() - loadStart;
        const minDisplay = 800; // minimum ms to show skeleton
        const remaining = Math.max(0, minDisplay - elapsed);
        
        setTimeout(() => {
            const skeleton = document.getElementById("skeleton-overlay");
            if (skeleton) {
                skeleton.classList.add("fade-out");
                setTimeout(() => skeleton.remove(), 400);
            }
        }, remaining);

    } catch (e) {
        console.error("Error loading data:", e);
        // Remove skeleton even on error so the page isn't stuck
        const skeleton = document.getElementById("skeleton-overlay");
        if (skeleton) skeleton.remove();
    }
}

function load_user_data(userData) {
    if (user_name) user_name.innerText = userData.username;
    if (profile_name) profile_name.innerText = userData.username;
    if (renewal_date) renewal_date.innerText = userData.renewalDate;
    if (days_remaining) days_remaining.innerText = `${userData.daysRemainingForRenewal} days`;
    
    const overviewBadge = document.getElementById("overview-badge");
    if (overviewBadge && userData.membershipStatus) overviewBadge.innerText = userData.membershipStatus;
    
    const personalBadge = document.getElementById("personal-badge");
    if (personalBadge && userData.membershipStatus) personalBadge.innerText = userData.membershipStatus;
    
    const stepsTarget = document.getElementById("stepsTarget");
    if (stepsTarget && userData.stepsTarget) stepsTarget.innerText = userData.stepsTarget;
    
    const trainerTime = document.getElementById("trainer-time");
    if (trainerTime && userData.trainer) trainerTime.innerText = `${userData.trainer} • ${userData.workoutTime}`;
    
    const membershipPlan = document.getElementById("membership-plan");
    if (membershipPlan && userData.membership) membershipPlan.innerText = `${userData.membership} Plan`;
    
    const membershipId = document.getElementById("membership-id");
    if (membershipId && userData.id) membershipId.innerText = `#GM-2026-${String(userData.id).padStart(4, '0')}`;
    
    const heightText = document.getElementById("heightText");
    if (heightText && userData.height) heightText.innerText = `${userData.height} cm`;
    
    const weightText = document.getElementById("weightText");
    if (weightText && userData.weight) weightText.innerText = `${userData.weight} kg`;
    
    if (userData.height && userData.weight) {
        const heightM = userData.height / 100;
        const bmi = userData.weight / (heightM * heightM);
        let status = "Normal";
        if (bmi < 18.5) status = "Underweight";
        else if (bmi >= 25 && bmi <= 29.9) status = "Overweight";
        else if (bmi >= 30) status = "Obese";
        
        const bmiText = document.getElementById("bmiText");
        if (bmiText) bmiText.innerText = status;
    }
    
    const exerciseSchedule = document.getElementById("exercise-schedule");
    if (exerciseSchedule && userData.exerciseSchedule) {
        exerciseSchedule.innerHTML = "";
        userData.exerciseSchedule.forEach((exercise, i) => {
            const div = document.createElement("div");
            div.className = "activity-item";
            div.innerHTML = `
                <div class="activity-left">
                    <div class="activity-icon">
                        <i class="fa-solid fa-dumbbell"></i>
                    </div>
                    <div>
                        <h4>Day ${i+1}</h4>
                        <p>${exercise}</p>
                    </div>
                </div>
            `;
            exerciseSchedule.appendChild(div);
        });
    }
    
    const calEl = document.getElementById("calorie-need");
    if (calEl && userData.dailyCaloriesTarget) calEl.innerText = `${userData.dailyCaloriesTarget} kcal`;
    
    const overviewCal = document.getElementById("calories");
    if (overviewCal && userData.dailyCaloriesTarget) {
        overviewCal.innerText = userData.dailyCaloriesTarget;
        const calTitle = overviewCal.previousElementSibling?.querySelector("h4");
        if (calTitle) calTitle.innerText = "Daily Calorie Target";
        const calSub = overviewCal.nextElementSibling;
        if (calSub) calSub.innerText = "Based on your fitness goals";
    }

    const watEl = document.getElementById("water-intake");
    if (watEl && userData.waterIntakeTarget) watEl.innerText = `${userData.waterIntakeTarget} L/day`;
    
    const workEl = document.getElementById("workouts");
    if (workEl && userData.exerciseSchedule) workEl.innerText = `${userData.exerciseSchedule.length}/week`;
    
    // Auto-fill and freeze the Personal Info form
    if (window.initializePersonalInfo) {
        window.initializePersonalInfo(userData);
    }
    
    // Populate Settings Profile Section with static data
    initializeSettingsProfile(userData);
    
    // Start the reward points interval system
    startRewardPointsTimer();
}

function initializeSettingsProfile(userData) {
    const settingsFields = {
        "settings-name": userData.username,
        "settings-email": `${userData.username.toLowerCase()}@gymdash.com`,
        "settings-phone": "+91 98765 43210",
        "settings-goal": "Muscle Gain",
        "settings-level": "Intermediate"
    };
    
    for (const [id, value] of Object.entries(settingsFields)) {
        const el = document.getElementById(id);
        if (el) {
            if (el.tagName === "SELECT") {
                const options = el.querySelectorAll("option");
                for (const opt of options) {
                    if (opt.text === String(value)) {
                        opt.selected = true;
                        break;
                    }
                }
            } else {
                el.value = value;
            }
            
            el.style.display = "none";
            
            let existingSpan = document.getElementById(`static-${id}`);
            if (existingSpan) existingSpan.remove();
            
            const displayVal = el.tagName === "SELECT" ? el.options[el.selectedIndex].text : el.value;
            
            const span = document.createElement("span");
            span.id = `static-${id}`;
            span.innerText = displayVal || "--";
            span.style.color = "white";
            span.style.fontSize = "15px";
            
            el.parentElement.appendChild(span);
        }
    }
    
    // Make save button static too
    const settingsSaveBtns = document.querySelectorAll("#setting_tab .save-btn");
    settingsSaveBtns.forEach(btn => {
        btn.innerText = "Profile Synced";
        btn.style.background = "#59d12f";
        btn.style.pointerEvents = "none";
    });
}

function startRewardPointsTimer() {
    const pointsEl = document.getElementById("points");
    const ptsSub = pointsEl?.nextElementSibling;
    if (!pointsEl) return;
    
    let basePoints = parseInt(pointsEl.innerText) || 1400;
    let earned = 0;
    
    setInterval(() => {
        const bonus = Math.floor(Math.random() * 15) + 5; // +5 to +20 points
        earned += bonus;
        basePoints += bonus;
        pointsEl.innerText = basePoints;
        if (ptsSub) ptsSub.innerText = `+${earned} pts this session`;
    }, 5000); // every 5 seconds
}

load();


// below code is for section switching


let overview_btn = document.getElementById("overview_btn");
let analytics_btn = document.getElementById("analytics_btn");
let personalInfo_btn = document.getElementById("personalInfo_btn");
let setting_btn = document.getElementById("setting_btn");

let overview = document.getElementById("overview_tab");
let analytics = document.getElementById("analytics_tab");
let personalInfo = document.getElementById("personalInfo_tab");
let setting = document.getElementById("setting_tab");

function showSectionSkeleton(sectionEl, skeletonId) {
    const existing = document.getElementById(skeletonId);
    if (existing) {
        existing.classList.remove("fade-out");
        existing.style.display = "grid";
    }
    setTimeout(() => {
        const skel = document.getElementById(skeletonId);
        if (skel) {
            skel.classList.add("fade-out");
            setTimeout(() => {
                skel.style.display = "none";
            }, 400);
        }
    }, 600);
}

function switchTab(tabName) {
    if (tabName === "overview") {
        console.log("overview tab");

        if (overview) overview.classList.remove("hidden");
        if (overview_btn) overview_btn.classList.add("active-btn");

        if (analytics) analytics.classList.add("hidden");
        if (analytics_btn) analytics_btn.classList.remove("active-btn");

        if (personalInfo) personalInfo.classList.add("hidden");
        if (personalInfo_btn) personalInfo_btn.classList.remove("active-btn");

        if (setting) setting.classList.add("hidden");
        if (setting_btn) setting_btn.classList.remove("active-btn");

        appState.current_Tab = "overview";
    }
    else if (tabName === "analytics") {
        console.log("analytics tab");

        if (analytics) analytics.classList.remove("hidden");
        if (analytics_btn) analytics_btn.classList.add("active-btn");

        if (overview) overview.classList.add("hidden");
        if (overview_btn) overview_btn.classList.remove("active-btn");

        if (personalInfo) personalInfo.classList.add("hidden");
        if (personalInfo_btn) personalInfo_btn.classList.remove("active-btn");

        if (setting) setting.classList.add("hidden");
        if (setting_btn) setting_btn.classList.remove("active-btn");

        appState.current_Tab = "analytics";
        showSectionSkeleton(analytics, "analytics-skeleton");
        
        // Trigger initialization of analytics charts
        if (window.initAnalyticsCharts) {
            window.initAnalyticsCharts();
        }
    }
    else if (tabName === "personalInfo") {
        console.log("personalInfo tab");

        if (personalInfo) personalInfo.classList.remove("hidden");
        if (personalInfo_btn) personalInfo_btn.classList.add("active-btn");

        if (overview) overview.classList.add("hidden");
        if (overview_btn) overview_btn.classList.remove("active-btn");

        if (analytics) analytics.classList.add("hidden");
        if (analytics_btn) analytics_btn.classList.remove("active-btn");

        if (setting) setting.classList.add("hidden");
        if (setting_btn) setting_btn.classList.remove("active-btn");

        appState.current_Tab = "personalInfo";
        showSectionSkeleton(personalInfo, "personalInfo-skeleton");
    }
    else if (tabName === "settings") {
        console.log("settings tab");

        if (setting) setting.classList.remove("hidden");
        if (setting_btn) setting_btn.classList.add("active-btn");

        if (overview) overview.classList.add("hidden");
        if (overview_btn) overview_btn.classList.remove("active-btn");

        if (analytics) analytics.classList.add("hidden");
        if (analytics_btn) analytics_btn.classList.remove("active-btn");

        if (personalInfo) personalInfo.classList.add("hidden");
        if (personalInfo_btn) personalInfo_btn.classList.remove("active-btn");

        appState.current_Tab = "settings";
        showSectionSkeleton(setting, "settings-skeleton");
    }
}

if (overview_btn) {
    overview_btn.addEventListener("click", () => {
        switchTab("overview");
        console.log("overview clicked");
    });
}

if (analytics_btn) {
    analytics_btn.addEventListener("click", () => {
        switchTab("analytics");
        console.log("analytics clicked");
    });
}

if (personalInfo_btn) {
    personalInfo_btn.addEventListener("click", () => {
        switchTab("personalInfo");
        console.log("personalInfo clicked");
    });
}

if (setting_btn) {
    setting_btn.addEventListener("click", () => {
        switchTab("settings");
        console.log("settings clicked");
    });
}

const settingsLinks = document.querySelectorAll(".settings-link");
settingsLinks.forEach(link => {
    link.addEventListener("click", () => {
        settingsLinks.forEach(l => l.classList.remove("active"));
        link.classList.add("active");
        
        const targetId = link.getAttribute("data-target");
        const targetEl = document.getElementById(targetId);
        if (targetEl) {
            targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    });
});

const toggleButtons = document.querySelectorAll(".toggle");
toggleButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        btn.classList.toggle("active");
    });
});


// ============================================
// THEME SWITCHER LOGIC (Dark / Light / System)
// ============================================

function applyTheme(theme) {
    if (theme === "light") {
        document.body.classList.add("light-theme");
    } else if (theme === "dark") {
        document.body.classList.remove("light-theme");
    } else if (theme === "system") {
        const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        if (isDark) {
            document.body.classList.remove("light-theme");
        } else {
            document.body.classList.add("light-theme");
        }
    }
}

// Read saved preference
const savedTheme = localStorage.getItem("selected_theme") || "dark";
applyTheme(savedTheme);

// Initialize Setting buttons states on load
const themeBtns = document.querySelectorAll(".theme-btn");
themeBtns.forEach(btn => {
    const text = btn.innerText.trim().toLowerCase();
    if (text === savedTheme) {
        themeBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
    }
    
    btn.addEventListener("click", () => {
        themeBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        
        const selected = btn.innerText.trim().toLowerCase();
        localStorage.setItem("selected_theme", selected);
        applyTheme(selected);
        console.log("Applied theme:", selected);
    });
});

// Watch for OS system theme shifts if set to system
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    const activePref = localStorage.getItem("selected_theme") || "dark";
    if (activePref === "system") {
        applyTheme("system");
    }
});