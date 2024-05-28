document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('sentimentAnalysisForm');
    const chartCanvas = document.getElementById('sentimentChart');
    let sentimentChart;

    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        const ticker = document.getElementById('ticker').value;
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;

        try {
            const responseData = await fetchSentimentData(ticker, startDate, endDate);
            const chartData = prepareChartData(responseData);

            if (sentimentChart) {
                sentimentChart.destroy();
            }
            sentimentChart = new Chart(chartCanvas, {
                type: 'line',
                data: {
                    labels: chartData.labels,
                    datasets: [{
                        label: `Sentiment over time for ${ticker}`,
                        data: chartData.data,
                        borderColor: 'rgb(75, 192, 192)',
                        tension: 0.1
                    }]
                }
            });
        } catch (error) {
            console.error("Failed to fetch and display sentiment data:", error.message, error.stack);
            alert("Failed to fetch sentiment data. Please try again.");
        }
    });

    async function fetchSentimentData(ticker, startDate, endDate) {
        const response = await fetch(`/api/sentiment-over-time/${ticker}?startDate=${startDate}&endDate=${endDate}`);
        if (!response.ok) {
            throw new Error('Failed to fetch sentiment data');
        }
        return response.json();
    }

    function prepareChartData(responseData) {
        const labels = responseData.map(entry => entry.date);
        const data = responseData.map(entry => entry.averageScore);
        return { labels, data };
    }
});