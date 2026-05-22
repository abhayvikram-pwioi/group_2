document.addEventListener("DOMContentLoaded", async () => {
    const loginForm = document.getElementById("login-form");
    const errorAlert = document.getElementById("error-alert");
    const errorMessage = document.getElementById("error-message");
    const usernameInput = document.getElementById("login-username");
    const passwordInput = document.getElementById("login-password");
    const grid = document.getElementById("user-grid");

    let allUsers = [];

    try {
        const response = await fetch("data.json");
        const data = await response.json();
        
        grid.innerHTML = "";
        
        // Get Utkarsh from data.json + all signed-up users from localStorage
        const jsonUsers = data.members.filter(m => m.username === "Utkarsh").map(m => ({
            ...m,
            // Give Utkarsh a default mock password if not specified
            password: m.password || "123456"
        }));
        
        const signedUpUsers = JSON.parse(localStorage.getItem("signedUpUsers") || "[]");
        allUsers = [...jsonUsers, ...signedUpUsers];
        
        allUsers.forEach(member => {
            const card = document.createElement("div");
            card.className = "user-card";
            
            const initial = member.username.charAt(0).toUpperCase();
            
            let badgeClass = "membership-badge";
            if (member.membership && member.membership.toLowerCase() === "basic") {
                badgeClass += " basic";
            }
            
            card.innerHTML = `
                <div class="avatar">${initial}</div>
                <div class="username">${member.username}</div>
                <div class="${badgeClass}">${member.membership || 'Pro'} Plan</div>
            `;
            
            // Clicking card auto-fills username and focuses password
            card.addEventListener("click", () => {
                usernameInput.value = member.username;
                passwordInput.value = "";
                passwordInput.focus();
                errorAlert.style.display = "none";
            });
            
            grid.appendChild(card);
        });
        
    } catch (error) {
        console.error("Error loading users:", error);
    }

    // Form Submission Login Logic
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        errorAlert.style.display = "none";

        const usernameVal = usernameInput.value.trim();
        const passwordVal = passwordInput.value;

        // Find user by username (case-insensitive comparison)
        const foundUser = allUsers.find(u => u.username.toLowerCase() === usernameVal.toLowerCase());

        if (!foundUser) {
            errorMessage.textContent = "Username not found. Make sure it matches your profile or sign up!";
            errorAlert.style.display = "flex";
            return;
        }

        // Verify password
        const passwordMatches = (foundUser.password === passwordVal) || 
                                (foundUser.username.toLowerCase() === "utkarsh" && (passwordVal === "123456" || passwordVal === "admin"));

        if (!passwordMatches) {
            if (foundUser.username.toLowerCase() === "utkarsh") {
                errorMessage.textContent = "Incorrect password. Try using '123456' or 'admin' for Utkarsh.";
            } else {
                errorMessage.textContent = "Incorrect password. Please try again.";
            }
            errorAlert.style.display = "flex";
            return;
        }

        // Login Success!
        localStorage.setItem("logged_in_user", foundUser.username);
        window.location.href = "Overview.html";
    });

    // Clear alert when user starts typing again
    [usernameInput, passwordInput].forEach(input => {
        input.addEventListener("input", () => {
            errorAlert.style.display = "none";
        });
    });
});
