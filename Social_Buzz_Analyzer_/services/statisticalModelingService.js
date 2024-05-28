const CryptoMention = require('../models/cryptoMention');
const StatisticalModel = require('../models/StatisticalModel');
const simpleStatistics = require('simple-statistics');

async function fetchHistoricalMentionData(ticker) {
  try {
    return await CryptoMention.find({ ticker }).lean();
  } catch (error) {
    console.error('Error fetching historical mention data:', error.message, error.stack);
    throw error;
  }
}

async function calculateStatisticsAndPredict(mentions) {
  if (mentions.length === 0) return null;

  const mentionCounts = mentions.map(mention => mention.mentionCount);
  const mean = simpleStatistics.mean(mentionCounts);
  const standardDeviation = simpleStatistics.standardDeviation(mentionCounts);
  const recentMentionCount = mentionCounts[mentionCounts.length - 1];

  let projectedMovement = 'stable';
  if (recentMentionCount > mean + standardDeviation) {
    projectedMovement = 'up';
  } else if (recentMentionCount < mean - standardDeviation) {
    projectedMovement = 'down';
  }

  const confidenceLevel = Math.min(100, (standardDeviation / mean) * 100);

  return { projectedMovement, confidenceLevel };
}

async function updateStatisticalModel(ticker) {
  try {
    const mentions = await fetchHistoricalMentionData(ticker);
    const prediction = await calculateStatisticsAndPredict(mentions);
    if (!prediction) {
      console.log(`No prediction could be made for ${ticker} due to insufficient data.`);
      return;
    }
    const { projectedMovement, confidenceLevel } = prediction;
    const predictionTimestamp = new Date();

    await StatisticalModel.findOneAndUpdate(
      { ticker },
      {
        name: mentions[0]?.name || ticker,
        projectedMovement,
        confidenceLevel,
        predictionTimestamp
      },
      { upsert: true, new: true }
    );
    console.log(`Statistical model updated for ${ticker} with movement ${projectedMovement} and confidence level ${confidenceLevel}%`);
  } catch (error) {
    console.error('Error updating statistical model:', error.message, error.stack);
    throw error;
  }
}

async function fetchPredictionForTicker(ticker) {
  try {
    const prediction = await StatisticalModel.findOne({ ticker }).sort({ predictionTimestamp: -1 }).lean();
    if (!prediction) {
      console.log(`No prediction data found for ticker: ${ticker}`);
      return null;
    }
    return prediction;
  } catch (error) {
    console.error('Error fetching prediction for ticker:', error.message, error.stack);
    throw error;
  }
}

module.exports = { updateStatisticalModel, fetchPredictionForTicker };