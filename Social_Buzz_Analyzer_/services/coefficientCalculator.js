const CryptoMention = require('../models/cryptoMention');

async function calculateCoefficient(cryptoTicker) {
  try {
    const mentionsData = await CryptoMention.aggregate([
      { $match: { ticker: cryptoTicker.toUpperCase() } },
      {
        $group: {
          _id: "$ticker",
          totalMentions: { $sum: "$mentionCount" },
          totalLikes: { $sum: "$likes" },
          totalShares: { $sum: "$shares" },
          totalRetweets: { $sum: "$retweets" }
        }
      }
    ]);

    if (!mentionsData.length) {
      console.log(`No data found for ticker: ${cryptoTicker}`);
      return null;
    }

    const data = mentionsData[0];
    const { totalMentions, totalLikes, totalShares, totalRetweets } = data;

    // Example coefficient calculation logic (this can be adjusted based on further analysis)
    const coefficient = (totalLikes + totalShares + totalRetweets) / totalMentions;

    console.log(`Coefficient calculated for ${cryptoTicker}: ${coefficient}`);

    return {
      ticker: cryptoTicker,
      coefficient,
      totalMentions,
      totalLikes,
      totalShares,
      totalRetweets
    };
  } catch (error) {
    console.error('Error calculating coefficient for', cryptoTicker, error.message, error.stack);
    return null;
  }
}

module.exports = { calculateCoefficient };