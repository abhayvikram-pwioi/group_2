function calculateBMI() {
    const heightInput = document.getElementById("height");
    const weightInput = document.getElementById("weight");

    if (!heightInput || !weightInput) return;

    const heightCm = parseFloat(heightInput.value);
    const weightKg = parseFloat(weightInput.value);

    if (isNaN(heightCm) || isNaN(weightKg) || heightCm <= 0 || weightKg <= 0) {
        alert("Please enter valid height and weight values.");
        return;
    }

    const heightM = heightCm / 100;
    const bmi = weightKg / (heightM * heightM);

    const roundedBMI = bmi.toFixed(1);

    document.getElementById("bmi-value").innerText = roundedBMI;

    let status = "";
    let colorHex = "";
    let message = "";

    if (bmi < 18.5) {
        status = "Underweight";
        colorHex = "#2d8cff"; // blue
        message = "You are currently underweight. Focus on a balanced diet with a slight caloric surplus.";
    } else if (bmi >= 18.5 && bmi <= 24.9) {
        status = "Normal";
        colorHex = "#59d12f"; // green
        message = "You are in a healthy weight range. Keep up the good work and maintain your routine!";
    } else if (bmi >= 25 && bmi <= 29.9) {
        status = "Overweight";
        colorHex = "#f6a313"; // orange
        message = "You are slightly overweight. Consider incorporating more cardio and a slight caloric deficit.";
    } else {
        status = "Obese";
        colorHex = "#ff4d4d"; // red
        message = "You are in the obese range. It is recommended to consult with a healthcare provider or a professional trainer.";
    }

    const statusElement = document.getElementById("bmi-status");
    if (statusElement) {
        statusElement.innerText = status;
        statusElement.style.color = colorHex;
    }

    const bmiText = document.getElementById("bmiText");
    if (bmiText) bmiText.innerText = status;

    const bmiMessage = document.getElementById("bmi-text");
    if (bmiMessage) bmiMessage.innerText = message;

    const circle = document.getElementById("circle");
    if (circle) {
        circle.style.borderColor = colorHex;
    }
}

function saveInfo() {
    const inputIds = [
        "nameInput", "age", "gender", "height", "weight",
        "targetWeight", "goal", "type", "experience", "time", "diet"
    ];

    const values = {};
    for (const id of inputIds) {
        const el = document.getElementById(id);
        if (el) {
            values[id] = el.value;
        }
    }

    if (!values.height || !values.weight) {
        alert("Please enter at least height and weight!");
        return;
    }

    // Convert inputs to static text
    for (const id of inputIds) {
        const el = document.getElementById(id);
        if (el) {
            el.style.display = "none";

            let existingSpan = document.getElementById(`static-${id}`);
            if (existingSpan) {
                existingSpan.remove();
            }

            const span = document.createElement("span");
            span.id = `static-${id}`;
            span.innerText = el.value || "--";
            span.style.color = "white";
            span.style.fontSize = "15px";
            span.style.width = "100%";

            el.parentElement.appendChild(span);
        }
    }

    calculateBMI();
    updateInsights(values);

    const saveBtn = document.querySelector(".save-btn");
    if (saveBtn) {
        saveBtn.innerText = "Information Saved";
        saveBtn.style.background = "#59d12f";
    }

    // Reward Point System
    if (!window.profileSavedPointsAdded) {
        window.profileSavedPointsAdded = true;
        const pointsEl = document.getElementById("points");
        if (pointsEl) {
            let currentPts = parseInt(pointsEl.innerText) || 1400;
            pointsEl.innerText = currentPts + 500;
            const ptsSub = pointsEl.nextElementSibling;
            if (ptsSub) ptsSub.innerText = "+500 pts for profile completion!";
        }
    }

    if (document.getElementById("heightText")) document.getElementById("heightText").innerText = `${values.height} cm`;
    if (document.getElementById("weightText")) document.getElementById("weightText").innerText = `${values.weight} kg`;
    if (document.getElementById("experienceText")) document.getElementById("experienceText").innerText = values.experience || "--";
    if (document.getElementById("goalText")) document.getElementById("goalText").innerText = values.goal || "--";
    if (document.getElementById("dietText")) document.getElementById("dietText").innerText = values.diet || "--";
}

function updateInsights(values) {
    const weight = parseFloat(values.weight);
    const height = parseFloat(values.height);
    const age = parseFloat(values.age) || 25;
    const gender = values.gender || "Male";

    if (isNaN(weight) || isNaN(height)) return;

    let bmr;
    if (gender.toLowerCase() === "male") {
        bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
    } else {
        bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
    }

    let multiplier = 1.375;
    if (values.experience === "Intermediate") multiplier = 1.55;
    if (values.experience === "Advanced") multiplier = 1.725;

    let calories = Math.round(bmr * multiplier);

    if (values.goal === "Fat Loss") {
        calories -= 300;
    } else if (values.goal === "Muscle Gain") {
        calories += 300;
    }

    let proteinMultiplier = 1.8;
    if (values.goal === "Muscle Gain") proteinMultiplier = 2.2;
    if (values.goal === "Fat Loss") proteinMultiplier = 2.0;

    const protein = Math.round(weight * proteinMultiplier);
    const water = (weight * 0.033).toFixed(1);

    let workouts = "3/week";
    if (values.experience === "Intermediate") workouts = "4/week";
    if (values.experience === "Advanced") workouts = "5-6/week";
    if (values.type === "Cardio" && values.experience === "Beginner") workouts = "4/week";

    const calEl = document.getElementById("calorie-need");
    if (calEl) calEl.innerText = `${calories} kcal`;

    // Connect to Overview Summary Section
    const overviewCal = document.getElementById("calories");
    if (overviewCal) {
        overviewCal.innerText = calories;
        const calTitle = overviewCal.previousElementSibling?.querySelector("h4");
        if (calTitle) calTitle.innerText = "Daily Calorie Target";
        const calSub = overviewCal.nextElementSibling;
        if (calSub) calSub.innerText = "Based on your fitness goals";
    }

    const proEl = document.getElementById("protein-intake");
    if (proEl) proEl.innerText = `${protein} g`;

    const watEl = document.getElementById("water-intake");
    if (watEl) watEl.innerText = `${water} L/day`;

    const workEl = document.getElementById("workouts");
    if (workEl) workEl.innerText = workouts;
}

window.initializePersonalInfo = function (userData) {
    if (!userData) return;

    // Map JSON to form inputs (IDs must match the HTML)
    const map = {
        "nameInput": userData.username,
        "age": userData.age,
        "gender": userData.gender,
        "height": userData.height,
        "weight": userData.weight,
        "targetWeight": userData.targetWeight,
        "goal": "Muscle Gain",
        "type": userData.exerciseSchedule && userData.exerciseSchedule.length > 0 ? userData.exerciseSchedule[0] : "Strength Training",
        "experience": "Intermediate",
        "time": userData.workoutTime || "Morning",
        "diet": "Balanced"
    };

    // Set input values and make static
    const inputIds = ["nameInput", "age", "gender", "height", "weight", "targetWeight", "goal", "type", "experience", "time", "diet"];

    for (const id of inputIds) {
        const el = document.getElementById(id);
        if (el) {
            // For select elements, find matching option
            if (el.tagName === "SELECT") {
                const options = el.querySelectorAll("option");
                for (const opt of options) {
                    if (opt.text === String(map[id])) {
                        opt.selected = true;
                        break;
                    }
                }
            } else {
                el.value = map[id] || "";
            }

            el.style.display = "none";

            let existingSpan = document.getElementById(`static-${id}`);
            if (existingSpan) {
                existingSpan.remove();
            }

            const displayVal = el.tagName === "SELECT" ? el.options[el.selectedIndex].text : el.value;

            const span = document.createElement("span");
            span.id = `static-${id}`;
            span.innerText = displayVal || "--";
            span.style.color = "white";
            span.style.fontSize = "15px";
            span.style.width = "100%";

            el.parentElement.appendChild(span);
        }
    }

    // Calculate BMI from JSON data
    calculateBMI();

    // Populate Additional Insights from JSON data
    const values = {
        height: userData.height,
        weight: userData.weight,
        age: userData.age,
        gender: userData.gender,
        goal: map["goal"],
        type: map["type"],
        experience: map["experience"],
        time: map["time"],
        diet: map["diet"]
    };
    updateInsights(values);

    // Update overview summary fields
    if (document.getElementById("heightText")) document.getElementById("heightText").innerText = `${userData.height} cm`;
    if (document.getElementById("weightText")) document.getElementById("weightText").innerText = `${userData.weight} kg`;
    if (document.getElementById("experienceText")) document.getElementById("experienceText").innerText = map["experience"];
    if (document.getElementById("goalText")) document.getElementById("goalText").innerText = map["goal"];
    if (document.getElementById("dietText")) document.getElementById("dietText").innerText = map["diet"];

    const saveBtn = document.querySelector(".save-btn");
    if (saveBtn) {
        saveBtn.innerText = "Information Saved";
        saveBtn.style.background = "#59d12f";
        saveBtn.style.pointerEvents = "none";
    }
};
