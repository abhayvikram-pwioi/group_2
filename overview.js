let d = new Date();
let time = d.getHours();

let greet = document.getElementById("greeting");

if (time >= 0 && time <= 11) {
    greet.innerText = "Good Morning";
}
else if (time >= 12 && time <= 17) {
    greet.innerText = "Good Afternoon";
}
else {
    greet.innerText = "Good Evening";
}

const user_name =
    document.getElementById("user_name");

const renewal_date =
    document.getElementById("renewal_date");

const days_remaining =
    document.getElementById("rem_date");

let user_number = 0;

async function load() {

    const response = await fetch("data.json");

    const data = await response.json();

    console.log(data);

    user_number =
        Math.floor(Math.random() * data.members.length);

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