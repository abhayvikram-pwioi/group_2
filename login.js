document.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch("data.json");
        const data = await response.json();
        
        const grid = document.getElementById("user-grid");
        grid.innerHTML = "";
        
        data.members.forEach(member => {
            const card = document.createElement("div");
            card.className = "user-card";
            
            const initial = member.username.charAt(0).toUpperCase();
            
            let badgeClass = "membership-badge";
            if (member.membership.toLowerCase() === "basic") {
                badgeClass += " basic";
            }
            
            card.innerHTML = `
                <div class="avatar">${initial}</div>
                <div class="username">${member.username}</div>
                <div class="${badgeClass}">${member.membership} Plan</div>
            `;
            
            card.addEventListener("click", () => {
                localStorage.setItem("logged_in_user", member.username);
                window.location.href = "Overview.html";
            });
            
            grid.appendChild(card);
        });
        
    } catch (error) {
        console.error("Error loading users:", error);
    }
});
