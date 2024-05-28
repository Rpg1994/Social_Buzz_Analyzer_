// Function to make AJAX requests
async function fetchData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching data:", error.message, error.stack);
    throw error; // Rethrowing the error for further handling
  }
}

// Function to populate the cryptocurrency ticker dropdown
async function populateTickerDropdown() {
  try {
    const tickersData = await fetchData('/api/crypto-tickers');
    const dropdown = document.getElementById('cryptoTickerSelect');
    tickersData.forEach(({ ticker, name }) => {
      const option = document.createElement('option');
      option.value = ticker;
      option.textContent = `${name} (${ticker})`;
      dropdown.appendChild(option);
    });
    // Trigger chart update for the first ticker by default
    if (tickersData.length > 0) {
      updateChart(tickersData[0].ticker);
      updateCryptoInfo(tickersData[0].ticker);
    }
  } catch (error) {
    console.error("Error populating ticker dropdown:", error.message, error.stack);
  }
}

// Function to update cryptocurrency's name and current price
async function updateCryptoInfo(ticker) {
  try {
    // Assuming there's an endpoint `/api/crypto-info/${ticker}` that provides name and price
    const cryptoInfo = await fetchData(`/api/crypto-info/${ticker}`);
    document.getElementById('cryptoName').textContent = `Name: ${cryptoInfo.name}`;
    document.getElementById('cryptoPrice').textContent = `Current Price: $${cryptoInfo.price}`;
  } catch (error) {
    console.error("Error updating crypto info:", error.message, error.stack);
  }
}

// Function to update chart with fetched data
async function updateChart(ticker) {
  try {
    // Fetching mention data and prediction data for the given ticker
    const mentionData = await fetchData(`/api/crypto-data/${ticker}`);
  
    // Extracting dates, mention counts, and prediction data for chart plotting
    const labels = mentionData.mentionData.map(data => new Date(data.date).toLocaleDateString());
    const mentionCounts = mentionData.mentionData.map(data => data.mentionCount);
    const predictionData = mentionData.predictionData.map(data => ({
      x: new Date(data.predictionTimestamp).toLocaleDateString(),
      y: data.projectedMovement === 'up' ? Math.max(...mentionCounts) : Math.min(...mentionCounts), // Simplified logic for demonstration
      confidence: data.confidence // Assuming confidence level is provided
    }));
  
    const ctx = document.getElementById('cryptoChartCanvas').getContext('2d');
  
    // Clearing previous chart instance if exists
    if (window.cryptoChart) {
      window.cryptoChart.destroy();
    }
  
    // Creating a new chart instance with the fetched data
    window.cryptoChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: `Mentions for ${ticker}`,
          data: mentionCounts,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        }, {
          label: 'Predicted Movement',
          data: predictionData.map(dp => ({x: dp.x, y: dp.y})),
          borderColor: 'rgb(255, 99, 132)',
          borderDash: [10, 5],
          fill: false,
          pointRadius: 6,
          pointHoverRadius: 10,
          pointStyle: 'triangle'
        }]
      },
      options: {
        scales: {
          x: {
            type: 'time',
            time: {
              unit: 'day'
            }
          },
          y: {
            beginAtZero: true
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';
                if (label === 'Predicted Movement') {
                  label += `: ${context.raw.y > 0 ? 'Up' : 'Down'}`;
                  label += `, Confidence: ${predictionData[context.dataIndex].confidence}%`; // Display confidence level
                } else {
                  label += `: ${context.raw.y}`;
                }
                return label;
              }
            }
          }
        }
      }
    });
  } catch (error) {
    console.error("Error updating chart:", error.message, error.stack);
  }
}

// Event listener for the dropdown or search box to trigger chart update
document.getElementById('cryptoTickerSelect').addEventListener('change', (event) => {
  const selectedTicker = event.target.value;
  updateChart(selectedTicker);
  updateCryptoInfo(selectedTicker);
});

// Call populateTickerDropdown to fill the dropdown when the page loads
populateTickerDropdown();