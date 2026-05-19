

const user_name =
    document.getElementById("user_name");



const renewal_date =
    document.getElementById("Renewal_date");

const days_remaining =
    document.getElementById("rem_date");

let user_number = 0;

async function load() {

    const response = await fetch("data.json");

    const data = await response.json();

    console.log(data);

    user_number =
        Math.floor(Math.random() * data.members.length);

    getData(data, user_number);

    load_user_data(data, user_number);
}

function load_user_data(data, user_number) {

    user_name.innerText =
        data.members[user_number].username;

    renewal_date.innerText =
        data.members[user_number].renewalDate;

    days_remaining.innerText =
        `${data.members[user_number]
            .daysRemainingForRenewal} days remaining`;
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

function switchTab(tabName) {
    // Hide all tabs and remove active class from all buttons
    if (overview) overview.classList.add("hidden");
    if (overview_btn) overview_btn.classList.remove("active-btn");

    if (analytics) analytics.classList.add("hidden");
    if (analytics_btn) analytics_btn.classList.remove("active-btn");

    if (personalInfo) personalInfo.classList.add("hidden");
    if (personalInfo_btn) personalInfo_btn.classList.remove("active-btn");

    if (setting) setting.classList.add("hidden");
    if (setting_btn) setting_btn.classList.remove("active-btn");

    // Show the selected tab and add active class to its button
    if (tabName === "overview") {
        console.log("overview tab");
        if (overview) overview.classList.remove("hidden");
        if (overview_btn) overview_btn.classList.add("active-btn");
        appState.current_Tab = "overview";
    } else if (tabName === "analytics") {
        console.log("analytics tab");
        if (analytics) analytics.classList.remove("hidden");
        if (analytics_btn) analytics_btn.classList.add("active-btn");
        appState.current_Tab = "analytics";
    } else if (tabName === "personalInfo") {
        console.log("personalInfo tab");
        if (personalInfo) personalInfo.classList.remove("hidden");
        if (personalInfo_btn) personalInfo_btn.classList.add("active-btn");
        appState.current_Tab = "personalInfo";
    } else if (tabName === "settings") {
        console.log("settings tab");
        if (setting) setting.classList.remove("hidden");
        if (setting_btn) setting_btn.classList.add("active-btn");
        appState.current_Tab = "settings";
    }
}

if (overview_btn) {
    overview_btn.addEventListener("click", () => {
        switchTab("overview");
    });
}

if (analytics_btn) {
    analytics_btn.addEventListener("click", () => {
        switchTab("analytics");
    });
}

if (personalInfo_btn) {
    personalInfo_btn.addEventListener("click", () => {
        switchTab("personalInfo");
    });
}

if (setting_btn) {
    setting_btn.addEventListener("click", () => {
        switchTab("settings");
    });
}