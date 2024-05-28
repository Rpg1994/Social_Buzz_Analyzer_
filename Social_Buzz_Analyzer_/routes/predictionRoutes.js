const express = require('express');
const router = express.Router();
const statisticalModelingService = require('../services/statisticalModelingService');
const predictionService = require('../services/predictionService'); // Import the prediction service

// GET request to fetch prediction data for a given cryptocurrency ticker
router.get('/predictions', async (req, res) => {
  const { ticker } = req.query;
  
  if (!ticker) {
    console.log('Ticker query parameter is required.');
    return res.status(400).json({ error: 'Ticker query parameter is required.' });
  }
  
  try {
    // Using the prediction service to run the model
    const predictionResult = await predictionService.runPredictionModel(ticker.toUpperCase());
    console.log(`Prediction result for ticker: ${ticker.toUpperCase()} is ${predictionResult}`);
    try {
      // Assuming predictionResult is JSON formatted as { direction: 'up/down/stable', confidence: 'percentage' }
      const formattedResult = JSON.parse(predictionResult); // Parse the JSON string to an object
      if (formattedResult.direction && formattedResult.confidence) {
        res.json({
          ticker: ticker.toUpperCase(),
          predictedMovement: formattedResult.direction,
          confidenceLevel: formattedResult.confidence
        });
      } else {
        throw new Error('Invalid prediction result format');
      }
    } catch (parseError) {
      console.error('Error parsing prediction data:', parseError.message);
      res.status(500).json({ error: 'Internal server error while parsing prediction data.' });
    }
  } catch (error) {
    console.error('Error fetching prediction data:', error.message, error.stack);
    res.status(500).json({ error: 'Internal server error while fetching prediction data.' });
  }
});

module.exports = router;