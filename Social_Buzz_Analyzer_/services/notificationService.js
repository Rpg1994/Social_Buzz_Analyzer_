const Alert = require('../models/Alert');
const CryptoMention = require('../models/cryptoMention');
const nodeCron = require('node-cron');

// Function to check alert conditions for all users
const checkAlertConditions = async () => {
  try {
    // Fetch all active alerts
    const alerts = await Alert.find({});
    for (const alert of alerts) {
      // Depending on alertType, check the relevant conditions
      switch (alert.alertType) {
        case 'mentionCountChange':
          await checkMentionCountChange(alert);
          break;
        case 'sentimentScoreChange':
          // Implement similar logic for sentiment score change
          console.log('Sentiment score change check not implemented');
          break;
        case 'newTrendingCrypto':
          // Implement similar logic for new trending crypto
          console.log('New trending crypto check not implemented');
          break;
        default:
          console.log('Unknown alert type');
      }
    }
  } catch (error) {
    console.error('Error checking alert conditions:', error.message, error.stack);
  }
};

// Function to check 'mentionCountChange' condition
const checkMentionCountChange = async (alert) => {
  const latestMention = await CryptoMention.findOne({ ticker: alert.cryptoTicker }).sort({ timestamp: -1 });
  if (latestMention && latestMention.mentionCount >= alert.threshold) {
    // Log notification message for simplicity; replace with actual notification logic
    console.log(`Alert triggered for ${alert.cryptoTicker}: Mention count exceeds threshold.`);
  }
};

// Schedule to run every hour (can be adjusted as needed)
nodeCron.schedule('0 * * * *', () => {
  console.log('Running check for alert conditions');
  checkAlertConditions();
});

module.exports = { checkAlertConditions };