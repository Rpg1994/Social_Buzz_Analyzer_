import express from 'express';
const router = express.Router();
import { isAuthenticated } from './middleware/authMiddleware.js';
import { updateTrendingCryptocurrencies } from '../services/cryptoUpdater.js';
import Cryptocurrency from '../models/Cryptocurrency.js';
import { getCryptoMentions, getPredictionForTicker } from '../services/cryptoDataService.js'; // Assuming these services are implemented
import CryptoMention from '../models/cryptoMention.js';
import { getRealTimeTradingData } from '../services/tradingDataService.js';
import { getOrderBookData, getRecentTradesData } from '../services/mockTradingPlatformService.js'; // Placeholder service
import validateDeveloperApiKey from '../middlewares/validateDeveloperApiKey.js'; // Importing the new middleware
import ApiAccessKey from '../models/ApiAccessKey.js'; // Import the ApiAccessKey model

router.get('/api/trending', isAuthenticated, async (req, res) => {
  try {
    await updateTrendingCryptocurrencies(); // Refresh the list of trending cryptos in the database
    const trendingCryptos = await Cryptocurrency.find({ trending: true }); // Assuming there's a 'trending' field

    res.json(trendingCryptos.map(crypto => ({
      name: crypto.name,
      ticker: crypto.ticker,
      lastUpdated: crypto.lastUpdated,
    })));
    console.log('Successfully fetched trending cryptocurrencies');
  } catch (error) {
    console.error('Failed to fetch trending cryptocurrencies:', error.message, error.stack);
    res.status(500).json({ message: "Failed to fetch trending cryptocurrencies due to an internal error." });
  }
});

router.get('/api/crypto-data/:ticker', isAuthenticated, async (req, res) => {
  try {
    const ticker = req.params.ticker.toUpperCase();
    const [mentionData, predictionData] = await Promise.all([
      getCryptoMentions(ticker),
      getPredictionForTicker(ticker)
    ]);
    res.json({ mentionData, predictionData });
    console.log(`Successfully fetched combined data for ${ticker}`);
  } catch (error) {
    console.error(`Error fetching combined data for ${req.params.ticker}:`, error.message, error.stack);
    res.status(500).json({ message: `Failed to fetch data for ${ticker}` });
  }
});

router.post('/get-chart-data', isAuthenticated, async (req, res) => {
  const { chartType, ticker } = req.body;
  try {
    const chartData = await CryptoMention.getChartData(ticker, chartType);
    if (!chartData || chartData.length === 0) {
      console.log(`No data found for ${ticker} with chart type ${chartType}.`);
      return res.status(404).json({ message: `No data found for ${ticker} with chart type ${chartType}.` });
    }
    console.log(`Successfully fetched chart data for ${ticker} with chart type ${chartType}.`);
    res.json({ label: `${ticker} ${chartType} chart`, dataPoints: chartData });
  } catch (error) {
    console.error(`Failed to fetch chart data for ${ticker}:`, error.message, error.stack);
    res.status(500).json({ message: `Failed to fetch chart data for ${ticker}` });
  }
});

router.get('/api/trading-data/:ticker', isAuthenticated, async (req, res) => {
  try {
    const ticker = req.params.ticker.toUpperCase();
    const tradingData = await getRealTimeTradingData(ticker);
    res.json(tradingData);
    console.log(`Successfully fetched trading data for ${ticker}`);
  } catch (error) {
    console.error(`Failed to fetch trading data for ${req.params.ticker}:`, error.message, error.stack);
    if (error.message === 'Ticker not found') {
      res.status(404).json({ message: `Ticker ${req.params.ticker} not found` });
    } else {
      res.status(500).json({ message: `Failed to fetch trading data for ${req.params.ticker}` });
    }
  }
});

router.get('/api/order-book/:ticker', isAuthenticated, async (req, res) => {
  try {
    const ticker = req.params.ticker.toUpperCase();
    const orderBookData = await getOrderBookData(ticker);
    res.json(orderBookData);
    console.log(`Successfully fetched order book data for ${ticker}`);
  } catch (error) {
    console.error(`Failed to fetch order book data for ${req.params.ticker}:`, error.message, error.stack);
    res.status(500).json({ message: `Failed to fetch order book data for ${req.params.ticker}` });
  }
});

router.get('/api/recent-trades/:ticker', isAuthenticated, async (req, res) => {
  try {
    const ticker = req.params.ticker.toUpperCase();
    const recentTradesData = await getRecentTradesData(ticker);
    res.json(recentTradesData);
    console.log(`Successfully fetched recent trades data for ${ticker}`);
  } catch (error) {
    console.error(`Failed to fetch recent trades data for ${req.params.ticker}:`, error.message, error.stack);
    res.status(500).json({ message: `Failed to fetch recent trades data for ${req.params.ticker}` });
  }
});

router.get('/api/sentiment/:ticker', isAuthenticated, async (req, res) => {
  try {
    const ticker = req.params.ticker.toUpperCase();
    const sentimentCounts = await CryptoMention.aggregate([
      { $match: { ticker: ticker } },
      { $group: {
          _id: '$sentiment',
          count: { $sum: 1 }
        }
      }
    ]);
    const responseData = {
      ticker: ticker,
      sentiments: sentimentCounts.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {})
    };
    res.json(responseData);
    console.log(`Successfully fetched sentiment data for ${ticker}`);
  } catch (error) {
    console.error(`Failed to fetch sentiment data for ${req.params.ticker}:`, error.message, error.stack);
    res.status(500).json({ message: `Failed to fetch sentiment data for ${req.params.ticker}` });
  }
});

router.get('/api/sentiment-over-time/:ticker', isAuthenticated, async (req, res) => {
  const { ticker } = req.params;
  const { startDate, endDate } = req.query;
  if (!startDate || !endDate) {
    return res.status(400).json({ message: "Please provide both startDate and endDate query parameters." });
  }
  try {
    const sentimentData = await CryptoMention.aggregate([
      { $match: { ticker: ticker.toUpperCase(), 'sentimentScoreOverTime.timestamp': { $gte: new Date(startDate), $lte: new Date(endDate) } } },
      { $unwind: "$sentimentScoreOverTime" },
      { $match: { 'sentimentScoreOverTime.timestamp': { $gte: new Date(startDate), $lte: new Date(endDate) } } },
      {
        $group: {
          _id: {
            day: { $dayOfMonth: "$sentimentScoreOverTime.timestamp" },
            month: { $month: "$sentimentScoreOverTime.timestamp" },
            year: { $year: "$sentimentScoreOverTime.timestamp" }
          },
          averageScore: { $avg: "$sentimentScoreOverTime.score" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
    ]);
    res.json(sentimentData.map(data => ({
      date: `${data._id.year}-${data._id.month}-${data._id.day}`,
      averageScore: data.averageScore
    })));
    console.log(`Successfully fetched sentiment data over time for ${ticker}`);
  } catch (error) {
    console.error(`Failed to fetch sentiment data over time for ${ticker}:`, error.message, error.stack);
    res.status(500).json({ message: `Failed to fetch sentiment data over time for ${ticker}` });
  }
});

router.post('/api/developer', isAuthenticated, validateDeveloperApiKey, async (req, res) => {
  const { cryptoTicker, dateRange } = req.body;
  if (!cryptoTicker) {
    return res.status(400).json({ message: "Missing required parameter: 'cryptoTicker'" });
  }
  
  try {
    // Placeholder for calling the getAnalyticsData service function
    // This will be implemented in the next task
    // const analyticsData = await getAnalyticsData(cryptoTicker, dateRange);

    // Temporary response until the service function is implemented
    res.json({ message: "Service function not yet implemented.", cryptoTicker, dateRange });
    console.log(`Analytics data request received for ${cryptoTicker} with date range: ${dateRange}`);
  } catch (error) {
    console.error(`Error fetching analytics data for ${cryptoTicker}:`, error.message, error.stack);
    res.status(500).json({ message: "Failed to fetch analytics data due to an internal error." });
  }
});

// POST route to generate a new API key
router.post('/api/developer/key', isAuthenticated, async (req, res) => {
  try {
    const user = req.session.userId;
    let newKey = new ApiAccessKey({ userId: user });
    await newKey.save();
    res.status(200).json({ message: "API key generated successfully.", apiKey: newKey.apiKey });
    console.log("API key generated successfully.");
  } catch (error) {
    console.error(`Error generating API key:`, error.message, error.stack);
    res.status(500).json({ message: "Failed to generate API key due to an internal error." });
  }
});

// PUT route to activate an API key
router.put('/api/developer/key/activate', isAuthenticated, async (req, res) => {
  try {
    const { apiKey } = req.body;
    const activatedKey = await ApiAccessKey.activateApiKey(apiKey);
    if (activatedKey) {
      res.status(200).json({ message: "API key activated successfully.", apiKey: activatedKey.apiKey });
      console.log("API key activated successfully.");
    } else {
      res.status(404).json({ message: "API key not found or already active." });
    }
  } catch (error) {
    console.error(`Error activating API key:`, error.message, error.stack);
    res.status(500).json({ message: "Failed to activate API key due to an internal error." });
  }
});

// PUT route to deactivate an API key
router.put('/api/developer/key/deactivate', isAuthenticated, async (req, res) => {
  try {
    const { apiKey } = req.body;
    const deactivatedKey = await ApiAccessKey.deactivateApiKey(apiKey);
    if (deactivatedKey) {
      res.status(200).json({ message: "API key deactivated successfully.", apiKey: deactivatedKey.apiKey });
      console.log("API key deactivated successfully.");
    } else {
      res.status(404).json({ message: "API key not found or already inactive." });
    }
  } catch (error) {
    console.error(`Error deactivating API key:`, error.message, error.stack);
    res.status(500).json({ message: "Failed to deactivate API key due to an internal error." });
  }
});

export default router;