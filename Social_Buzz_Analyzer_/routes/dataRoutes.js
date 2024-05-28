const express = require('express');
const router = express.Router();
const CryptoMention = require('../models/cryptoMention');
const Cryptocurrency = require('../models/Cryptocurrency'); // Import the Cryptocurrency model
const InfluenceScore = require('../models/influenceScore'); // Import the InfluenceScore model
const { isAuthenticated } = require('./middleware/authMiddleware');
const { getCryptoPrice } = require('../services/cryptoPricingService');

// Placeholder for the database operation
const getCryptoMentions = async (ticker) => {
  try {
    const mentions = await CryptoMention.find({ ticker: ticker.toUpperCase() }).sort({ timestamp: -1 });
    return mentions.map(mention => ({
      date: mention.timestamp,
      mentionCount: mention.mentionCount,
      likes: mention.likes,
      shares: mention.shares,
      retweets: mention.retweets
    }));
  } catch (error) {
    console.error('Error fetching mention data from database:', error.message);
    console.error(error.stack);
    throw error; // Rethrowing the error to be handled by the caller
  }
};

router.get('/mentions/:ticker', isAuthenticated, async (req, res) => {
  const { ticker } = req.params;
  try {
    const mentionData = await getCryptoMentions(ticker);
    const price = await getCryptoPrice(ticker); // Fetch the current price
    if (mentionData.length === 0) {
      return res.status(404).json({ message: `No data found for ticker: ${ticker}` });
    }
    res.json({ mentionData, price }); // Include price in the response
  } catch (error) {
    console.error('Error in /mentions/:ticker route:', error.message);
    console.error(error.stack);
    res.status(500).send('Internal Server Error');
  }
});

// New route for serving the crypto chart page
router.get('/chart', isAuthenticated, (req, res) => {
  res.render('cryptoChart', {
    cryptoName: 'Placeholder Name', // Placeholder values, to be dynamically updated
    ticker: 'Placeholder Ticker',
  });
});

// Implementing new route for dynamic charts
router.get('/dynamic-charts', isAuthenticated, async (req, res) => {
  try {
    const cryptos = await Cryptocurrency.find({}, 'ticker name -_id').lean(); // Fetch tickers and names, excluding the _id
    res.render('dynamicCharts', { cryptos }); // Pass the list of cryptos to the view
  } catch (error) {
    console.error('Error fetching cryptocurrency tickers for dynamic charts:', error.message);
    console.error(error.stack);
    res.status(500).send('Internal Server Error');
  }
});

// Route to get influence scores for a given cryptocurrency ticker
router.get('/api/influence-scores/:ticker', isAuthenticated, async (req, res) => {
  const { ticker } = req.params;
  try {
    const scores = await InfluenceScore.find({ ticker: ticker.toUpperCase() })
                                        .sort({ timestamp: -1 });
    if (scores.length === 0) {
      return res.status(404).json({ message: `No influence scores found for ticker: ${ticker}` });
    }
    res.json(scores);
  } catch (error) {
    console.error(`Error fetching influence scores for ticker ${ticker}:`, error.message);
    console.error(error.stack);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;