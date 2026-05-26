document.addEventListener("DOMContentLoaded", function() {
    // 1. Front Overview Tab Activity Chart
    const ctx = document.getElementById('activityChart');
    if (ctx) {
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Calories Burned',
                    data: [420, 500, 380, 600, 450, 700, 550],
                    backgroundColor: 'rgba(89, 209, 47, 0.8)',
                    borderRadius: 5,
                    borderWidth: 0,
                    hoverBackgroundColor: 'rgba(89, 209, 47, 1)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        },
                        ticks: {
                            color: '#a0a0a0',
                            font: {
                                family: "'Inter', sans-serif"
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#a0a0a0',
                            font: {
                                family: "'Inter', sans-serif"
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: '#1a1a1a',
                        titleColor: '#fff',
                        bodyColor: '#59d12f',
                        titleFont: {
                            family: "'Inter', sans-serif"
                        },
                        bodyFont: {
                            family: "'Inter', sans-serif"
                        },
                        padding: 10,
                        displayColors: false,
                        cornerRadius: 8
                    }
                }
            }
        });
    }

    // Keep instances globally to prevent duplication on tab switches
    window.weeklyHoursChartInstance = null;
    window.weightProgressChartInstance = null;

    // 2. Tab Analytics Page Chart Initializers
    window.initAnalyticsCharts = async function() {
        const weeklyCanvas = document.getElementById('weeklyHoursChart');
        const weightCanvas = document.getElementById('weightProgressChart');
        if (!weeklyCanvas || !weightCanvas) return;

        const currentUsername = localStorage.getItem("logged_in_user") || "Utkarsh";
        let weeklyData = [];
        let weightData = [];

        try {
            // Load chart.json data
            const res = await fetch("chart.json");
            const data = await res.json();
            const analytics = data.userAnalytics;

            if (currentUsername.toLowerCase() === "utkarsh") {
                // Link to Utkarsh's real data
                weeklyData = analytics.weeklyWorkoutHours;
                weightData = analytics.monthlyWeightProgress;
            } else {
                // Generate a highly realistic dynamic mock data for other signed-up profiles
                weeklyData = [
                    { day: "Monday", hours: 1.0 },
                    { day: "Tuesday", hours: 1.5 },
                    { day: "Wednesday", hours: 0.8 },
                    { day: "Thursday", hours: 2.0 },
                    { day: "Friday", hours: 1.2 },
                    { day: "Saturday", hours: 2.5 },
                    { day: "Sunday", hours: 0.5 }
                ];
                
                // Get starting weight of current user
                let storedWeight = 80;
                let activeUsers = JSON.parse(localStorage.getItem("signedUpUsers") || "[]");
                let matchedUser = activeUsers.find(u => u.username.toLowerCase() === currentUsername.toLowerCase());
                if (matchedUser && matchedUser.weight) {
                    storedWeight = matchedUser.weight;
                }

                weightData = [
                    { month: "January", weight: storedWeight + 4 },
                    { month: "February", weight: storedWeight + 3 },
                    { month: "March", weight: storedWeight + 2 },
                    { month: "April", weight: storedWeight + 1 },
                    { month: "May", weight: storedWeight },
                    { month: "June", weight: Math.max(45, storedWeight - 1) }
                ];
            }

            // Populate KPIs and update UI labels
            updateKPIs(weeklyData, weightData, currentUsername);

            // RENDER CHART 1: WEEKLY WORKOUT HOURS
            const days = weeklyData.map(d => d.day.substring(0, 3));
            const hours = weeklyData.map(d => d.hours);

            if (window.weeklyHoursChartInstance) {
                window.weeklyHoursChartInstance.destroy();
            }

            window.weeklyHoursChartInstance = new Chart(weeklyCanvas, {
                type: 'bar',
                data: {
                    labels: days,
                    datasets: [{
                        label: 'Training Hours',
                        data: hours,
                        backgroundColor: 'rgba(89, 209, 47, 0.85)',
                        hoverBackgroundColor: 'rgba(89, 209, 47, 1)',
                        borderRadius: 8,
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: { color: 'rgba(255, 255, 255, 0.05)' },
                            ticks: { color: '#a0a0a0', font: { family: "'Inter', sans-serif" } }
                        },
                        x: {
                            grid: { display: false },
                            ticks: { color: '#a0a0a0', font: { family: "'Inter', sans-serif" } }
                        }
                    },
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: '#1a1a1a',
                            titleColor: '#fff',
                            bodyColor: '#59d12f',
                            cornerRadius: 8,
                            padding: 12
                        }
                    }
                }
            });

            // RENDER CHART 2: WEIGHT PROGRESS TREND
            const months = weightData.map(w => w.month.substring(0, 3));
            const weights = weightData.map(w => w.weight);

            if (window.weightProgressChartInstance) {
                window.weightProgressChartInstance.destroy();
            }

            window.weightProgressChartInstance = new Chart(weightCanvas, {
                type: 'line',
                data: {
                    labels: months,
                    datasets: [{
                        label: 'Weight (kg)',
                        data: weights,
                        borderColor: '#f6a313',
                        backgroundColor: 'rgba(246, 163, 19, 0.05)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.35,
                        pointBackgroundColor: '#f6a313',
                        pointBorderColor: '#fff',
                        pointHoverRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            grid: { color: 'rgba(255, 255, 255, 0.05)' },
                            ticks: { color: '#a0a0a0', font: { family: "'Inter', sans-serif" } }
                        },
                        x: {
                            grid: { display: false },
                            ticks: { color: '#a0a0a0', font: { family: "'Inter', sans-serif" } }
                        }
                    },
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: '#1a1a1a',
                            titleColor: '#fff',
                            bodyColor: '#f6a313',
                            cornerRadius: 8,
                            padding: 12
                        }
                    }
                }
            });

        } catch (e) {
            console.error("Error setting up analytics charts:", e);
        }
    };

    function updateKPIs(weekly, weight, username) {
        // 1. Total weekly hours
        const totalHours = weekly.reduce((sum, d) => sum + d.hours, 0);
        const totalWeeklyEl = document.getElementById("total-weekly-hours");
        if (totalWeeklyEl) totalWeeklyEl.innerText = totalHours.toFixed(1);

        // 2. Avg hours / day
        const avgHours = totalHours / weekly.length;
        const avgHoursEl = document.getElementById("avg-hours-day");
        if (avgHoursEl) avgHoursEl.innerText = `${avgHours.toFixed(2)} hrs`;

        // 3. Most Active Day
        let maxDay = weekly[0];
        weekly.forEach(d => {
            if (d.hours > maxDay.hours) maxDay = d;
        });
        const activeDayEl = document.getElementById("most-active-day");
        if (activeDayEl) activeDayEl.innerText = maxDay.day;

        // 4. Weight loss calculation
        if (weight.length > 0) {
            const startW = weight[0].weight;
            const endW = weight[weight.length - 1].weight;
            const lost = Math.max(0, startW - endW);
            const lossEl = document.getElementById("weight-loss-kpis");
            if (lossEl) lossEl.innerText = lost.toFixed(1);
        }

        // 5. Goal Weight Target
        let targetWeight = 70;
        let activeUsers = JSON.parse(localStorage.getItem("signedUpUsers") || "[]");
        let matchedUser = activeUsers.find(u => u.username.toLowerCase() === username.toLowerCase());
        
        if (matchedUser && matchedUser.targetWeight) {
            targetWeight = matchedUser.targetWeight;
        } else if (username.toLowerCase() === "utkarsh") {
            targetWeight = 72; // default target weight for Utkarsh
        }
        
        const targetWeightEl = document.getElementById("target-weight-kpi");
        if (targetWeightEl) targetWeightEl.innerText = `${targetWeight}.0 kg`;
    }
});
