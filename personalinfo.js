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
    statusElement.innerText = status;
    statusElement.style.color = colorHex;
    
    document.getElementById("bmi-text").innerText = message;
    
    const circle = document.getElementById("circle");
    if (circle) {
        circle.style.borderColor = colorHex;
    }
}
