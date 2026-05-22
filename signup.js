document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("signup-form");
  const submitBtn = document.getElementById("signup-submit");
  const successMsg = document.getElementById("success-message");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Clear previous errors
    form.querySelectorAll(".form-group").forEach(g => g.classList.remove("error"));
    form.querySelectorAll(".error-text").forEach(e => e.remove());

    // Collect values
    const name = document.getElementById("signup-name").value.trim();
    const age = document.getElementById("signup-age").value;
    const email = document.getElementById("signup-email").value.trim();
    const gender = document.getElementById("signup-gender").value;
    const plan = document.getElementById("signup-plan").value;
    const height = document.getElementById("signup-height").value;
    const weight = document.getElementById("signup-weight").value;
    const goal = document.getElementById("signup-goal").value;
    const password = document.getElementById("signup-password").value;

    let valid = true;

    function showError(id, msg) {
      const group = document.getElementById(id).closest(".form-group");
      group.classList.add("error");
      const errEl = document.createElement("div");
      errEl.className = "error-text";
      errEl.textContent = msg;
      group.appendChild(errEl);
      valid = false;
    }

    if (!name) showError("signup-name", "Name is required");
    if (!age || age < 14 || age > 80) showError("signup-age", "Enter a valid age (14-80)");
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) showError("signup-email", "Enter a valid email");
    if (!gender) showError("signup-gender", "Select a gender");
    if (!plan) showError("signup-plan", "Select a plan");
    if (!height || height < 100 || height > 250) showError("signup-height", "Enter valid height");
    if (!weight || weight < 30 || weight > 200) showError("signup-weight", "Enter valid weight");
    if (!goal) showError("signup-goal", "Select a goal");
    if (!password || password.length < 6) showError("signup-password", "Password must be at least 6 characters");

    if (!valid) return;

    // Loading state
    submitBtn.classList.add("loading");

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Store user data in localStorage
    const newUser = {
      username: name,
      password: password,
      age: parseInt(age),
      height: parseInt(height),
      weight: parseInt(weight),
      gender: gender,
      membership: plan,
      renewalDate: getOneYearFromNow(),
      daysRemainingForRenewal: 365,
      targetWeight: parseInt(weight) - 5
    };

    // Save to localStorage for demo purposes
    let signedUpUsers = JSON.parse(localStorage.getItem("signedUpUsers") || "[]");
    signedUpUsers.push(newUser);
    localStorage.setItem("signedUpUsers", JSON.stringify(signedUpUsers));

    // Show success
    submitBtn.classList.remove("loading");
    successMsg.classList.add("show");

    // Redirect to login after 2 seconds
    setTimeout(() => {
      window.location.href = "login.html";
    }, 2000);
  });

  function getOneYearFromNow() {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().split("T")[0];
  }

  // Remove error state on input
  form.querySelectorAll("input, select").forEach(el => {
    el.addEventListener("input", () => {
      const group = el.closest(".form-group");
      group.classList.remove("error");
      const errText = group.querySelector(".error-text");
      if (errText) errText.remove();
    });
  });
});
