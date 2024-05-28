document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('dynamicChartForm');
    const chartTypeSelect = document.getElementById('chartTypeSelect');
    const cryptoTickerSelect = document.getElementById('cryptoTickerSelect');
    const canvas = document.getElementById('cryptoChartCanvas');
    let chart;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const chartType = chartTypeSelect.value;
        const cryptoTicker = cryptoTickerSelect.value;

        try {
            const responseData = await fetchChartData(chartType, cryptoTicker);
            if (responseData) {
                updateChart(canvas, chartType, responseData);
            }
        } catch (error) {
            console.error('Failed to fetch chart data:', error);
            console.error('Error stack:', error.stack);
        }
    });

    async function fetchChartData(chartType, ticker) {
        try {
            const response = await fetch('/api/get-chart-data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ chartType, ticker }),
            });

            if (!response.ok) {
                throw new Error(`Network response was not ok. Status: ${response.status}`);
            }

            return response.json();
        } catch (error) {
            console.error('Error fetching chart data:', error);
            console.error('Error stack:', error.stack);
            throw error;
        }
    }

    function updateChart(canvas, chartType, data) {
        if (chart) {
            chart.destroy();
        }

        chart = new Chart(canvas, {
            type: chartType,
            data: {
                labels: data.labels,
                datasets: [{
                    label: data.label,
                    data: data.dataPoints,
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
});