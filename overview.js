

const user_name =
    document.getElementById("user_name");



const renewal_date = document.getElementById("Renewal_date");
const days_remaining = document.getElementById("rem_date");
const profile_name = document.getElementById("profile-name");

let user_number = 0;

async function load() {
    try {
        const [res1, res2] = await Promise.all([
            fetch("data.json"),
            fetch("moredata.json")
        ]);
        const data = await res1.json();
        const moreData = await res2.json();
        
        user_number = Math.floor(Math.random() * data.members.length);
        const member = data.members[user_number];
        
        const moreMember = moreData.memberSchedules.find(m => m.username === member.username) || {};
        const mergedData = { ...member, ...moreMember };
        
        appState.currentUser = mergedData;
        console.log("Merged AppState:", appState);
        
        load_user_data(mergedData);
    } catch (e) {
        console.error("Error loading data:", e);
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
}

load();


// below code is for section switching


let overview_btn = document.getElementById("overview_btn");
let personalInfo_btn = document.getElementById("personalInfo_btn");
let setting_btn = document.getElementById("setting_btn");

let overview = document.getElementById("overview_tab");
let personalInfo = document.getElementById("personalInfo_tab");
let setting = document.getElementById("setting_tab");

function switchTab(tabName) {
    if (tabName === "overview") {
        console.log("overview tab");

        if (overview) overview.classList.remove("hidden");
        if (overview_btn) overview_btn.classList.add("active-btn");

        if (personalInfo) personalInfo.classList.add("hidden");
        if (personalInfo_btn) personalInfo_btn.classList.remove("active-btn");

        if (setting) setting.classList.add("hidden");
        if (setting_btn) setting_btn.classList.remove("active-btn");

        appState.current_Tab = "overview";
    }
    else if (tabName === "personalInfo") {
        console.log("personalInfo tab");

        if (personalInfo) personalInfo.classList.remove("hidden");
        if (personalInfo_btn) personalInfo_btn.classList.add("active-btn");

        if (overview) overview.classList.add("hidden");
        if (overview_btn) overview_btn.classList.remove("active-btn");

        if (setting) setting.classList.add("hidden");
        if (setting_btn) setting_btn.classList.remove("active-btn");

        appState.current_Tab = "personalInfo";
    }
    else if (tabName === "settings") {
        console.log("settings tab");

        if (setting) setting.classList.remove("hidden");
        if (setting_btn) setting_btn.classList.add("active-btn");

        if (overview) overview.classList.add("hidden");
        if (overview_btn) overview_btn.classList.remove("active-btn");

        if (personalInfo) personalInfo.classList.add("hidden");
        if (personalInfo_btn) personalInfo_btn.classList.remove("active-btn");

        appState.current_Tab = "settings";
    }
}

if (overview_btn) {
    overview_btn.addEventListener("click", () => {
        switchTab("overview");
        console.log("overview clicked");
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