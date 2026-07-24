// ====================================
// Protect Dashboard
// ====================================

// if(localStorage.getItem("isLoggedIn")!=="true"){

//     window.location.href="login.html";

// }

// ====================================
// Logout
// ====================================

const logout=document.querySelector(".logout-btn");

logout.addEventListener("click",()=>{

    localStorage.removeItem("isLoggedIn");

    window.location.href="login.html";

});

// ====================================
// Chart
// ====================================

const ctx=document.getElementById("gradeChart");

new Chart(ctx,{

type:"line",

data:{

labels:["Jan","Feb","Mar","Apr","May","Jun"],

datasets:[{

label:"Average Grade",

data:[72,76,74,82,88,91],

borderColor:"#4F46E5",

backgroundColor:"rgba(79,70,229,.12)",

fill:true,

tension:.4,

pointRadius:5,

pointBackgroundColor:"#4F46E5"

}]

},

options:{

responsive:true,

plugins:{

legend:{

display:false

}

},

scales:{

x:{

grid:{

display:false

}

},

y:{

beginAtZero:true,

max:100

}

}

}

});

/* ==============================
        PAGE NAVIGATION
============================== */

const pages=document.querySelectorAll(".page");

const navLinks=document.querySelectorAll("nav a");

navLinks.forEach(link=>{

    link.addEventListener("click",(e)=>{

        e.preventDefault();

        const target=link.dataset.page;

        if(!target) return;

        pages.forEach(page=>{

            page.classList.remove("active");

        });

        document.getElementById(target).classList.add("active");

        navLinks.forEach(item=>{

            item.parentElement.classList.remove("active");

        });

        link.parentElement.classList.add("active");

    });

});
/* ==============================
        COURSE SEARCH
============================== */

const search=document.querySelector(".course-search input");

const cards=document.querySelectorAll(".course-card");

search.addEventListener("keyup",()=>{

    const value=search.value.toLowerCase();

    cards.forEach(card=>{

        const title=card.querySelector("h3").textContent.toLowerCase();

        if(title.includes(value)){

            card.style.display="block";

        }

        else{

            card.style.display="none";

        }

    });

});
/* ==============================
        COURSE FILTER
============================== */

const filter=document.getElementById("courseFilter");

filter.addEventListener("change",()=>{

    const value=filter.value;

    cards.forEach(card=>{

        const progress=parseInt(

            card.querySelector(".progress-fill").style.width

        );

        if(value==="all"){

            card.style.display="block";

        }

        else if(value==="completed"){

            card.style.display=

            progress===100 ? "block":"none";

        }

        else{

            card.style.display=

            progress<100 ? "block":"none";

        }

    });

});

/* ======================================
        PROGRESS CHART
====================================== */

const progressCanvas = document.getElementById("progressChart");

if (progressCanvas) {

    new Chart(progressCanvas, {

        type: "line",

        data: {

            labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],

            datasets: [{

                label: "Hours Studied",

                data: [2, 4, 3, 6, 5, 7, 4],

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

            plugins: {

                legend: {

                    display: false

                }

            },

            scales: {

                x: {

                    grid: {

                        display: false

                    }

                },

                y: {

                    beginAtZero: true,

                    suggestedMax: 8,

                    ticks: {

                        stepSize: 2

                    }

                }

            }

        }

    });

}

/* ======================================
        ANIMATE PROGRESS BARS
====================================== */

const progressBars = document.querySelectorAll(".progress-fill");

progressBars.forEach(bar => {

    const finalWidth = bar.style.width;

    bar.style.width = "0";

    setTimeout(() => {

        bar.style.width = finalWidth;

    }, 300);

});

/* ======================================
        CARD ANIMATION
====================================== */

const animatedCards = document.querySelectorAll(
    ".stat-box, .achievement-card, .course-progress-card, .weekly-progress"
);

animatedCards.forEach((card, index) => {

    card.style.opacity = "0";

    card.style.transform = "translateY(30px)";

    setTimeout(() => {

        card.style.transition = ".5s ease";

        card.style.opacity = "1";

        card.style.transform = "translateY(0)";

    }, index * 120);

});
/* ======================================
        GRADES PERFORMANCE CHART
====================================== */

const gradesCanvas = document.getElementById("gradesChart");

if (gradesCanvas) {

    new Chart(gradesCanvas, {

        type: "line",

        data: {

            labels: [

                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun"

            ],

            datasets: [{

                label: "Average Marks",

                data: [75, 80, 78, 84, 89, 92],

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

            plugins: {

                legend: {

                    display: false

                }

            },

            scales: {

                x: {

                    grid: {

                        display: false

                    }

                },

                y: {

                    beginAtZero: true,

                    max: 100

                }

            }

        }

    });

}

/* ======================================
        GPA COUNTER
====================================== */

const counters = document.querySelectorAll(".counter");

counters.forEach(counter => {

    const target = parseFloat(counter.dataset.target);

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
/* ======================================
        CARD ANIMATION
====================================== */

const gradeCards = document.querySelectorAll(

".gpa-card, .assessment-card, .grades-table-card, .performance-chart"

);

gradeCards.forEach((card,index)=>{

    card.style.opacity="0";

    card.style.transform="translateY(30px)";

    setTimeout(()=>{

        card.style.transition=".5s ease";

        card.style.opacity="1";

        card.style.transform="translateY(0)";

    },index*120);

});

/* ======================================
        DYNAMIC CALENDAR
====================================== */

const monthYear = document.getElementById("monthYear");
const calendarDays = document.getElementById("calendarDays");
const prevMonth = document.getElementById("prevMonth");
const nextMonth = document.getElementById("nextMonth");

const scheduleTitle =
document.getElementById("scheduleTitle");

const scheduleList =
document.getElementById("scheduleList");

const schedules={

5:[

{

title:"React JS Class",

time:"09:00 AM - 10:30 AM",

color:"purple"

},

{

title:"DSA Lab",

time:"11:00 AM - 01:00 PM",

color:"blue"

}

],

12:[

{

title:"Java Assignment",

time:"10:00 AM",

color:"orange"

}

],

18:[

{

title:"DBMS Quiz",

time:"02:30 PM",

color:"orange"

},

{

title:"Assignment Deadline",

time:"11:59 PM",

color:"red"

}

],

25:[

{

title:"Communication Workshop",

time:"09:30 AM",

color:"purple"

}

]

};

function renderSchedule(day){

scheduleTitle.innerHTML=

`Schedule • ${day}`;

scheduleList.innerHTML="";

const events=schedules[day];

if(!events){

scheduleList.innerHTML=

`

<div class="empty-state">

<i class="fa-regular fa-calendar"></i>

<p>No events scheduled.</p>

</div>

`;

return;

}

events.forEach(event=>{

scheduleList.innerHTML+=`

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

if (monthYear && calendarDays) {

    let currentDate = new Date();

    const eventDates = [5, 12, 18, 25];

    function renderCalendar(date) {

        calendarDays.innerHTML = "";

        const year = date.getFullYear();
        const month = date.getMonth();

        const firstDay = new Date(year, month, 1).getDay();
        const lastDate = new Date(year, month + 1, 0).getDate();

        const monthNames = [

            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December"

        ];

        monthYear.textContent = `${monthNames[month]} ${year}`;

        /* Empty Boxes */

        for (let i = 0; i < firstDay; i++) {

            const empty = document.createElement("div");

            calendarDays.appendChild(empty);

        }

        /* Days */

        for (let day = 1; day <= lastDate; day++) {

            const dayBox = document.createElement("div");

            dayBox.classList.add("calendar-day");

            dayBox.textContent = day;

            const today = new Date();

            if (

                day === today.getDate() &&

                month === today.getMonth() &&

                year === today.getFullYear()

            ) {

                dayBox.classList.add("today");

            }

            if (eventDates.includes(day)) {

                dayBox.classList.add("has-event");

            }

            dayBox.addEventListener("click",()=>{

document

.querySelectorAll(".calendar-day")

.forEach(day=>

day.classList.remove("selected")

);

dayBox.classList.add("selected");

renderSchedule(day);

});

            calendarDays.appendChild(dayBox);

        }

    }

    renderSchedule(

new Date().getDate()

);

    /* Previous Month */

    prevMonth.addEventListener("click", () => {

        currentDate.setMonth(currentDate.getMonth() - 1);

        renderCalendar(currentDate);

    });

    /* Next Month */

    nextMonth.addEventListener("click", () => {

        currentDate.setMonth(currentDate.getMonth() + 1);

        renderCalendar(currentDate);

    });

}