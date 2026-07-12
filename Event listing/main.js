/*==========================
        LOGIN MODAL
==========================*/

const loginBtn = document.getElementById("loginBtn");
const loginModal = document.getElementById("loginModal");
const closeLogin = document.getElementById("closeLogin");
const successStep = document.getElementById("successStep");

const goLoginBtn = document.getElementById("goLoginBtn");


// Open Login Popup

loginBtn.addEventListener("click", function(e){

    e.preventDefault();

    loginModal.style.display = "flex";

});


// Close Button

closeLogin.addEventListener("click", function(){

    loginModal.style.display = "none";

});


// Click Outside Popup

window.addEventListener("click", function(e){

    if(e.target === loginModal){

        loginModal.style.display = "none";

    }

});

/*==========================
      ROLE MODAL
==========================*/

const signupBtn = document.getElementById("signupBtn");

const roleModal = document.getElementById("roleModal");

const closeRole = document.querySelector(".close-role");

const userCard = document.getElementById("userCard");

const adminCard = document.getElementById("adminCard");

const continueBtn = document.getElementById("continueBtn");

let selectedRole = "";


// Open Role Modal

signupBtn.addEventListener("click",function(e){

    e.preventDefault();

    roleModal.style.display="flex";

});


// Close

closeRole.addEventListener("click",function(){

    roleModal.style.display="none";

});


// Close Outside

window.addEventListener("click",function(e){

    if(e.target===roleModal){

        roleModal.style.display="none";

    }

});


// User

userCard.addEventListener("click",function(){

    selectedRole="user";

    userCard.classList.add("active");

    adminCard.classList.remove("active");

});


// Admin

adminCard.addEventListener("click",function(){

    selectedRole="admin";

    adminCard.classList.add("active");

    userCard.classList.remove("active");

});

const roleStep = document.getElementById("roleStep");

const userStep = document.getElementById("userStep");

const userBackBtn = document.getElementById("userBackBtn");

const adminStep = document.getElementById("adminStep");

const adminBackBtn = document.getElementById("adminBackBtn");


// Continue

continueBtn.addEventListener("click", function () {

    if (selectedRole === "") {

        alert("Please select your role.");

        return;

    }

    if (selectedRole === "user") {

        roleStep.style.display = "none";

        userStep.style.display = "block";

    }

    else {

        // Admin Form next step me banega

       roleStep.style.display = "none";

       adminStep.style.display = "block";
    }

});
/*==========================
        SIGNUP STEPS
==========================*/



userBackBtn.addEventListener("click", function () {

    userStep.style.display = "none";

    roleStep.style.display = "block";

});

adminBackBtn.addEventListener("click",function(){

    adminStep.style.display="none";

    roleStep.style.display="block";

});

const userForm = document.getElementById("userForm");

userForm.addEventListener("submit",function(e){

    e.preventDefault();

    userStep.style.display="none";

    successStep.style.display="block";

});

const adminForm=document.getElementById("adminForm");

adminForm.addEventListener("submit",function(e){

    e.preventDefault();

    adminStep.style.display="none";

    successStep.style.display="block";

});

goLoginBtn.addEventListener("click",function(){

    roleModal.style.display="none";

    loginModal.style.display="flex";

    successStep.style.display="none";

    roleStep.style.display="block";

});

/*==========================
      CHATBOT
==========================*/

const chatbotBtn=document.getElementById("chatbotBtn");

const chatbot=document.getElementById("chatbot");

const closeChat=document.getElementById("closeChat");

chatbotBtn.addEventListener("click",function(){

    chatbot.style.display="flex";

});

closeChat.addEventListener("click",function(){

    chatbot.style.display="none";

});
/*==========================
      CHAT MESSAGE
==========================*/

const sendBtn=document.getElementById("sendBtn");

const userInput=document.getElementById("userInput");

const chatBody=document.getElementById("chatBody");


function sendMessage(){

    const message=userInput.value.trim();

    if(message==="") return;

    // User Message

    const userDiv=document.createElement("div");

    userDiv.className="user-msg";

    userDiv.innerText=message;

    chatBody.appendChild(userDiv);

    // Bot Reply after 800ms

    const typing = document.createElement("div");

typing.className = "bot-msg";

typing.id = "typing";

typing.innerHTML = "✍️ Typing...";

chatBody.appendChild(typing);

chatBody.scrollTop = chatBody.scrollHeight;

document.getElementById("typing").remove();

setTimeout(function(){

    const botDiv = document.createElement("div");

    botDiv.className = "bot-msg";

    const msg = message.toLowerCase();

    if(

msg.includes("tech")

||

msg.includes("technology")

){

    let techEvents = getEvents()

    .filter(event=>event.category==="Technology");

    if(techEvents.length===0){

        botDiv.innerHTML=

        "❌ No Technology Events Found.";

    }

    else{

        let html=

        "💻 <b>Technology Events</b><br><br>";

        techEvents.forEach(event=>{

            html+=`

            • ${event.name}<br>

            📅 ${event.date}<br>

            📍 ${event.location}<br><br>

            `;

        });

        botDiv.innerHTML=html;

    }

}

    chatBody.appendChild(botDiv);

    chatBody.scrollTop = chatBody.scrollHeight;

},800);

    userInput.value="";

    chatBody.scrollTop=chatBody.scrollHeight;

}

sendBtn.addEventListener("click",sendMessage);

userInput.addEventListener("keypress",function(e){

    if(e.key==="Enter"){

        sendMessage();

    }

})

 if(msg.includes("workshop")){

    let workshopEvents = getEvents()

    .filter(event=>event.category==="Workshop");

    if(workshopEvents.length===0){

        botDiv.innerHTML=

        "❌ No Workshops Found.";

    }

    else {

        let html=

        "🛠 <b>Workshop Events</b><br><br>";

        workshopEvents.forEach(event=>{

            html+=`

            • ${event.name}<br>

            📅 ${event.date}<br>

            📍 ${event.location}<br><br>

            `;

        });

        botDiv.innerHTML=html;

    }

}
else if(msg.includes("music")){

    let musicEvents = getEvents()

    .filter(event=>event.category==="Music");

    if(musicEvents.length===0){

        botDiv.innerHTML=

        "❌ No Music Events Found.";

    }

    else{

        let html=

        "🎵 <b>Music Events</b><br><br>";

        musicEvents.forEach(event=>{

            html+=`

            • ${event.name}<br>

            📅 ${event.date}<br>

            📍 ${event.location}<br><br>

            `;

        });

        botDiv.innerHTML=html;

    }

}
else if(msg.includes("sports")){

    let sportsEvents = getEvents()

    .filter(event=>event.category==="Sports");

    if(sportsEvents.length===0){

        botDiv.innerHTML=

        "❌ No Sports Events Found.";

    }

    else{

        let html=

        "⚽ <b>Sports Events</b><br><br>";

        sportsEvents.forEach(event=>{

            html+=`

            • ${event.name}<br>

            📅 ${event.date}<br>

            📍 ${event.location}<br><br>

            `;

        });

        botDiv.innerHTML=html;

    }

}