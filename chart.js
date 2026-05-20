document.addEventListener("DOMContentLoaded", function() {
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
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#a0a0a0',
                            font: {
                                family: "'Outfit', sans-serif"
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
                                family: "'Outfit', sans-serif"
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
                            family: "'Outfit', sans-serif"
                        },
                        bodyFont: {
                            family: "'Outfit', sans-serif"
                        },
                        padding: 10,
                        displayColors: false,
                        cornerRadius: 8
                    }
                }
            }
        });
    }
});
