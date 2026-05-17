let d = new Date()
let time = d.getHours();
let greet = document.getElementById("greeting")
let toggle = document.getElementById("toggle")

console.log(time);

if(time >= 0 && time <= 11){ 
    greet.innerText = "Good Morning"
}
else if(time >= 12 && time <= 17){ 
    greet.innerText = "Good Afternoon"
}
else if(time > 17 && time <= 23){ 
    greet.innerText = "Good Evening"
}

toggle.addEventListener("click" , ()=> {
    
})


