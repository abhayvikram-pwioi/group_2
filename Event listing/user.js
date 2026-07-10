

const registrationContainer =
document.getElementById("registrationContainer");

const emptyState =
document.getElementById("emptyState");
/*==========================
    REGISTER EVENT
==========================*/

const registerBtns = document.querySelectorAll(".register-btn");

const registerModal = document.getElementById("registerModal");

const okBtn = document.getElementById("okBtn");

let activeButton = null;

let activeCount = null;

registerBtns.forEach(button=>{

    button.addEventListener("click",function(){

        activeButton=this;

        activeCount=this.parentElement
            .querySelector(".registered-count");

        registerModal.style.display="flex";

    });

});

okBtn.addEventListener("click",function(){

    registerModal.style.display="none";

    let count=parseInt(activeCount.innerText);

    activeCount.innerText=count+1;

    activeButton.innerText="✓ Registered";

    activeButton.style.background="#22C55E";

    activeButton.disabled=true;

    emptyState.style.display="none";

    const card =
    activeButton.closest(".event-card");

    const image =
    card.querySelector("img").src;

    const title =
    card.querySelector("h3").innerText;

    const info =
    card.querySelector(".event-info").innerHTML;

    registrationContainer.innerHTML += `

    <div class="registered-card">

        <img src="${image}">

        <div class="registered-content">

            <h3>${title}</h3>

            <div class="event-info">

                ${info}

            </div>

            <span class="registered-badge">

                ✓ Registered

            </span>

        </div>

    </div>

    `;

});
/*==========================
      PROFILE MENU
==========================*/

const profileBtn=document.getElementById("profileBtn");

const profileMenu=document.getElementById("profileMenu");

profileBtn.addEventListener("click",function(e){

    e.stopPropagation();

    if(profileMenu.style.display==="block"){

        profileMenu.style.display="none";

    }

    else{

        profileMenu.style.display="block";

    }

});

document.addEventListener("click",function(){

    profileMenu.style.display="none";

});

/*==========================
      LOGOUT
==========================*/

const logoutBtn=document.getElementById("logoutBtn");

logoutBtn.addEventListener("click",function(){

    if(confirm("Are you sure you want to logout?")){

        window.location.href="home.html";

    }

});

