document.addEventListener("DOMContentLoaded", () => {
    const username = sessionStorage.getItem("username");
    const logoutBtn = document.getElementById("logout");
    const expertBtn = document.getElementById("hexpert");
    const correctMsg = document.getElementById("correctmsg");
    const incorrectMsg = document.getElementById("incorrectmsg");
    const footer = document.getElementById("footer");
    const userIdDisplay = document.getElementById("userIdDisplay");

    if (userIdDisplay && username) {
        const numericId = username.replace(/\D/g, '');
        userIdDisplay.textContent = `Expert ID: #${numericId}`;
    }

    if (!username) {
        window.location.href = "/login";
        return;
    }

    logoutBtn.addEventListener("click", () => {
        sessionStorage.removeItem("username");
        window.location.href = "/login";
    });

    expertBtn.addEventListener("click", () => {
        window.location.href = "/mainExpert";
    });

    pieChartInstance = initializePieChart();
    startPolling();

    fetch("/statistics", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const validatedAnswers = data.validatedAnswers;
            const correctAnswers = data.correctAnswers;
            const incorrectAnswers = validatedAnswers - correctAnswers;

            if (correctMsg && incorrectMsg && footer) {
                correctMsg.textContent = `Correct: ${correctAnswers}`;
                incorrectMsg.textContent = `Incorrect: ${incorrectAnswers}`;
                footer.textContent = `Stats fetched from a total of ${validatedAnswers} validated messages`;
            }

            updatePieChart(correctAnswers, incorrectAnswers);
        })
        .catch(error => {
            console.error("Error fetching statistics:", error);
            if (correctMsg && incorrectMsg) {
                correctMsg.textContent = "Correct: N/A";
                incorrectMsg.textContent = "Incorrect: N/A";
            }
            if (footer) {
                footer.textContent = "Stats could not be loaded";
            }
        });
});

let pieChartInstance = null;

function initializePieChart() {
    const pieChartEl = document.getElementById('pieChart');
    if (!pieChartEl) {
        console.error("Canvas element not found!");
        return null;
    }

    const pieChartCtx = pieChartEl.getContext('2d');
    if (!pieChartCtx) {
        console.error("Could not get 2D context");
        return null;
    }

    pieChartInstance = new Chart(pieChartCtx, {
        type: 'pie',
        data: {
            labels: ['Number of Correct Messages', 'Number of Incorrect Messages'],
            datasets: [{
                data: [0, 0],
                backgroundColor: [
                    '#8aa277',
                    'rgba(255, 255, 255, 0.45)'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                },
                datalabels: {
                    formatter: (value, ctx) => {
                        const datasets = ctx.chart.data.datasets;
                        if (datasets.indexOf(ctx.dataset) === -1) return null;
                        const total = datasets[0].data.reduce((a, b) => a + b, 0);
                        const percentage = Math.round((value / total) * 100);
                        return percentage > 0 ? `${percentage}%` : '';
                    },
                    color: '#ffffff',
                    font: {
                        size: 32,
                        weight: 'bold'
                    }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
    return pieChartInstance;
}

function updatePieChart(correctAnswers, incorrectAnswers) {
    const pieChartEl = document.getElementById('pieChart');
    if (!pieChartEl) return;

    if (!pieChartInstance) {
        pieChartInstance = initializePieChart();
    }

    pieChartInstance.data.datasets[0].data = [correctAnswers, incorrectAnswers];
    pieChartInstance.update();
}

function startPolling() {
    setInterval(() => {
        fetch("/statistics", {
            method: "POST",
            headers: { "Content-Type": "application/json" }
        })
            .then(response => response.json())
            .then(data => {
                const validatedAnswers = data.validatedAnswers;
                const correctAnswers = data.correctAnswers;
                const incorrectAnswers = validatedAnswers - correctAnswers;

                document.getElementById("correctmsg").textContent = `Correct: ${correctAnswers}`;
                document.getElementById("incorrectmsg").textContent = `Incorrect: ${incorrectAnswers}`;
                document.getElementById("footer").textContent = `Stats fetched from a total of ${validatedAnswers} validated messages`;
                updatePieChart(correctAnswers, incorrectAnswers);
            })
            .catch(error => console.error("Polling error:", error));
    }, 5000);
}
