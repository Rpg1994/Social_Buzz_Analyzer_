import moment from 'moment';
import { CryptoMention } from '../models/cryptoMention.js';

const getAnalyticsData = async (cryptoTicker, dateRange = {}) => {
  try {
    const matchStage = {
      $match: {
        ticker: cryptoTicker.toUpperCase(),
      },
    };

    if (dateRange.start && dateRange.end) {
      matchStage.$match.timestamp = {
        $gte: moment(dateRange.start).toDate(),
        $lte: moment(dateRange.end).toDate(),
      };
    }

    const aggregationPipeline = [
      matchStage,
      {
        $group: {
          _id: "$sentiment",
          count: { $sum: 1 },
          averageLikes: { $avg: "$likes" },
          averageShares: { $avg: "$shares" },
          averageRetweets: { $avg: "$retweets" },
        },
      },
    ];

    const sentimentAnalysis = await CryptoMention.aggregate(aggregationPipeline);

    console.log(`Analytics data fetched successfully for ${cryptoTicker.toUpperCase()}`);

    return sentimentAnalysis;
  } catch (error) {
    console.error(`Error fetching analytics data for ${cryptoTicker.toUpperCase()}:`, error.message, error.stack);
    throw error;
  }
};

export { getAnalyticsData };