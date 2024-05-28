document.getElementById('cryptoSearchForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const ticker = document.getElementById('cryptoTicker').value;
  const loadingIndicator = document.getElementById('loadingIndicator');
  const tradingDataError = document.getElementById('tradingDataError');

  // Show loading indicator
  loadingIndicator.style.display = 'block';
  tradingDataError.textContent = ''; // Clear previous errors

  fetch(`/api/mentions/${ticker}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      const ctx = document.getElementById('cryptoMentionChart').getContext('2d');
      if (data.length === 0) {
        console.log('No data found for the specified ticker:', ticker);
        return;
      }
      const chartData = {
        labels: data.map(entry => entry.date),
        datasets: [{
          label: `Mentions for ${ticker}`,
          data: data.map(entry => entry.mentionCount),
          fill: false,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        }]
      };
      new Chart(ctx, {
        type: 'line',
        data: chartData,
      });
    })
    .catch(error => {
      console.error('Error fetching mention data:', error);
    });

  // Fetch and display trading data
  fetch(`/api/trading-data/${ticker}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      document.getElementById('price').textContent = `Price: $${data.price}`;
      document.getElementById('volume').textContent = `24h Volume: ${data.volume}`;
      document.getElementById('changePercentage').textContent = `24h Change: ${data.changePercentage}%`;
    })
    .catch(error => {
      console.error('Error fetching trading data:', error);
      document.getElementById('tradingDataError').textContent = 'Failed to fetch trading data. Please try again.';
    })
    .finally(() => {
      // Hide loading indicator
      loadingIndicator.style.display = 'none';
    });

  // Fetch and display trading platform data
  fetchTradingPlatformData(ticker);

  // Fetch and display influence scores
  fetchInfluenceScores(ticker);
});

document.getElementById('showTrendingBtn').addEventListener('click', function() {
  fetch('/api/trending')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(trendingCryptos => {
      const trendingContainer = document.getElementById('trendingCryptos');
      trendingContainer.innerHTML = ''; // Clear previous content
      const list = document.createElement('ul');
      list.className = 'list-group';

      trendingCryptos.forEach(crypto => {
        const item = document.createElement('li');
        item.className = 'list-group-item d-flex justify-content-between align-items-center';
        item.innerHTML = `
          ${crypto.name} (${crypto.ticker})
          <a href="/crypto/${crypto.ticker}" class="badge bg-primary rounded-pill">View Trends</a>
        `;
        list.appendChild(item);
      });

      trendingContainer.appendChild(list);
    })
    .catch(error => {
      console.error('Error fetching trending cryptocurrencies:', error);
      document.getElementById('trendingCryptos').innerHTML = 'Failed to fetch trending cryptocurrencies. Please try again.';
    });
});

// Prediction Form Submission
document.getElementById('cryptoPredictionForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const ticker = document.getElementById('cryptoTickerForPrediction').value;
  
  fetch(`/api/predictions?ticker=${ticker}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(prediction => {
      const resultContainer = document.getElementById('predictionResult');
      resultContainer.innerHTML = `
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">${prediction.name} (${prediction.ticker}) Prediction</h5>
            <p class="card-text">Projected Movement: <strong>${prediction.projectedMovement}</strong></p>
            <p class="card-text">Confidence Level: <strong>${prediction.confidenceLevel}%</strong></p>
            <p class="card-text">Prediction Timestamp: <strong>${new Date(prediction.predictionTimestamp).toLocaleString()}</strong></p>
          </div>
        </div>
      `;
    })
    .catch(error => {
      console.error('Error fetching prediction data:', error);
      document.getElementById('predictionResult').innerHTML = `<div class="alert alert-danger" role="alert">
        Failed to fetch prediction data. Please try again.
      </div>`;
    });
});

function fetchTradingPlatformData(ticker) {
  console.log(`Fetching trading platform data for: ${ticker}`);

  // Fetch order book data
  fetch(`/api/order-book/${ticker}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch order book data');
      }
      return response.json();
    })
    .then(data => {
      const orderBookCtx = document.getElementById('orderBookChart').getContext('2d');
      const bidsData = data.bids.map(bid => bid[1]);
      const asksData = data.asks.map(ask => ask[1]);
      const labels = data.bids.map((bid, index) => `Level ${index + 1}`);
      
      new Chart(orderBookCtx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Bids',
              data: bidsData,
              backgroundColor: 'rgba(54, 162, 235, 0.2)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1
            },
            {
              label: 'Asks',
              data: asksData,
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 1
            }
          ]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    })
    .catch(error => {
      console.error('Error fetching order book data:', error);
      document.getElementById('orderBookChart').textContent = 'Failed to load order book data.';
    });

  // Fetch recent trades data
  fetch(`/api/recent-trades/${ticker}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch recent trades data');
      }
      return response.json();
    })
    .then(data => {
      const recentTradesList = document.getElementById('recentTrades');
      recentTradesList.innerHTML = ''; // Clear existing list
      data.forEach(trade => {
        const listItem = document.createElement('li');
        listItem.className = 'list-group-item';
        listItem.textContent = `Price: ${trade.price}, Quantity: ${trade.quantity}, Time: ${new Date(trade.timestamp).toLocaleTimeString()}`;
        recentTradesList.appendChild(listItem);
      });
    })
    .catch(error => console.error('Error fetching recent trades data:', error));

  // Placeholder for Market Depth Chart
  // Implement market depth chart fetching and rendering here
}

function fetchInfluenceScores(ticker) {
  fetch(`/api/influence-scores/${ticker}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      const container = document.getElementById('influenceScoresContainer');
      container.innerHTML = ''; // Clear previous content
      if (data.length === 0) {
        container.innerHTML = '<p>No influence scores available.</p>';
        return;
      }
      const list = document.createElement('ul');
      list.className = 'list-group';
      data.forEach(score => {
        const item = document.createElement('li');
        item.className = 'list-group-item';
        item.textContent = `Source: ${score.sourcePlatform}, Score: ${score.influenceScore}`;
        list.appendChild(item);
      });
      container.appendChild(list);
    })
    .catch(error => {
      console.error('Error fetching influence scores:', error);
      document.getElementById('influenceScoresContainer').innerHTML = '<p>Failed to fetch influence scores. Please try again.</p>';
    });
}

fetch('/api/trending')
    .then(response => response.json())
    .then(trendingCryptos => {
        const sentimentSelect = document.getElementById('cryptoSentimentSelect');
        trendingCryptos.forEach(crypto => {
            const option = document.createElement('option');
            option.value = crypto.ticker;
            option.textContent = `${crypto.name} (${crypto.ticker})`;
            sentimentSelect.appendChild(option);
        });
    })
    .catch(error => console.error('Error fetching trending cryptocurrencies:', error));