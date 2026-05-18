

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


let overview_btn =
    document.getElementById("overview_btn");

let analytics_btn =
    document.getElementById("analytics_btn");

let setting_btn =
    document.getElementById("setting_btn");

let overview =
    document.getElementById("overview_tab");

let analytics =
    document.getElementById("analytics_tab");

let setting =
    document.getElementById("setting_tab");

function switchTab(tabName) {

    if (tabName === "overview") {
        console.log("overview tab");

        if (overview) overview.classList.remove("hidden");
        overview_btn.classList.add("active-btn");

        if (analytics) analytics.classList.add("hidden");
        analytics_btn.classList.remove("active-btn");

        if (setting) setting.classList.add("hidden");
        setting_btn.classList.remove("active-btn");

        appState.current_Tab = "overview";
    }

    else if (tabName === "analytics") {
        console.log("analytics tab");

        if (analytics) analytics.classList.remove("hidden");
        analytics_btn.classList.add("active-btn");

        if (overview) overview.classList.add("hidden");
        overview_btn.classList.remove("active-btn");

        if (setting) setting.classList.add("hidden");
        setting_btn.classList.remove("active-btn");

        appState.current_Tab = "analytics";
    }

    else if (tabName === "settings") {
        console.log("settings tab");

        if (setting) setting.classList.remove("hidden");
        setting_btn.classList.add("active-btn");

        if (overview) overview.classList.add("hidden");
        overview_btn.classList.remove("active-btn");

        if (analytics) analytics.classList.add("hidden");
        analytics_btn.classList.remove("active-btn");

        appState.current_Tab = "settings";
    }
}

overview_btn.addEventListener("click", () => {
    switchTab("overview");
    console.log("overview clicked");
});

analytics_btn.addEventListener("click", () => {
    switchTab("analytics");
    console.log("analytics clicked");
});


setting_btn.addEventListener("click", () => {
    switchTab("settings");
    console.log("settings clicked");
});