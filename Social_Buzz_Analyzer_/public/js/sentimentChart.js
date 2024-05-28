document.addEventListener('DOMContentLoaded', function() {
    const sentimentChartCanvas = document.getElementById('sentimentAnalysisChart').getContext('2d');
    let sentimentChart;

    document.getElementById('cryptoSentimentSelect').addEventListener('change', function() {
        const ticker = this.value;
        fetch(`/api/sentiment/${ticker}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                const sentiments = data.sentiments;
                const sentimentData = {
                    labels: Object.keys(sentiments),
                    datasets: [{
                        label: 'Sentiment Analysis',
                        data: Object.values(sentiments),
                        backgroundColor: [
                            'rgba(54, 162, 235, 0.2)',
                            'rgba(255, 99, 132, 0.2)',
                            'rgba(255, 206, 86, 0.2)'
                        ],
                        borderColor: [
                            'rgba(54, 162, 235, 1)',
                            'rgba(255,99,132,1)',
                            'rgba(255, 206, 86, 1)'
                        ],
                        borderWidth: 1
                    }]
                };
                if (sentimentChart) {
                    sentimentChart.destroy();
                }
                sentimentChart = new Chart(sentimentChartCanvas, {
                    type: 'pie',
                    data: sentimentData,
                    options: {
                        responsive: true,
                        legend: {
                            position: 'top',
                        },
                        title: {
                            display: true,
                            text: `Sentiment Analysis for ${ticker}`
                        }
                    }
                });
            })
            .catch(error => {
                console.error('Error fetching sentiment data:', error.message, error.stack);
            });
    });
});