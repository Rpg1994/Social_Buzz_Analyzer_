import mongoose from 'mongoose';
import moment from 'moment';

const sentimentScoreOverTimeSchema = new mongoose.Schema({
  sentiment: { type: String, required: true, enum: ['positive', 'negative', 'neutral'] },
  score: { type: Number, required: true },
  timestamp: { type: Date, required: true, default: Date.now },
  enhancedSentiment: {
    compound: { type: Number },
    positive: { type: Number },
    negative: { type: Number },
    neutral: { type: Number }
  }
}, { _id: false });

const cryptoMentionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  ticker: { type: String, required: true },
  sourcePlatform: { type: String, required: true, enum: ['Twitter', 'Reddit', 'Telegram'] },
  mentionCount: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  shares: { type: Number, default: 0 },
  retweets: { type: Number, default: 0 },
  timestamp: { type: Date, default: Date.now },
  suspiciousActivityFlag: { type: Boolean, default: false },
  activitySpikeDetails: {
    spikeInMentions: { type: Boolean, default: false },
    spikeInLikes: { type: Boolean, default: false },
    spikeInShares: { type: Boolean, default: false },
    spikeInRetweets: { type: Boolean, default: false },
    details: { type: String, default: '' }
  },
  sentiment: { type: String, required: true, enum: ['positive', 'negative', 'neutral'] },
  sentimentScoreOverTime: [sentimentScoreOverTimeSchema]
});

// Indexes for efficient querying
cryptoMentionSchema.index({ name: 1, ticker: 1, sourcePlatform: 1 }, { unique: true });

// Aggregation methods
cryptoMentionSchema.statics.aggregateDataByCryptocurrency = function() {
  console.log("Aggregating data by cryptocurrency.");
};

cryptoMentionSchema.statics.aggregateDataByPlatform = function() {
  console.log("Aggregating data by platform.");
};

cryptoMentionSchema.statics.getChartData = async function(ticker, chartType) {
  const aggregationPipeline = [];
  const groupByFormat = chartType === 'candlestick' ? 'YYYY-MM-DD HH' : 'YYYY-MM-DD';

  if (chartType === 'bar' || chartType === 'line') {
    aggregationPipeline.push(
      { $match: { ticker: ticker } },
      {
        $group: {
          _id: { $dateToString: { format: groupByFormat, date: "$timestamp" } },
          mentionCount: { $sum: "$mentionCount" },
          likes: { $sum: "$likes" },
          shares: { $sum: "$shares" },
          retweets: { $sum: "$retweets" }
        }
      },
      { $sort: { "_id": 1 } }
    );
  } else if (chartType === 'candlestick') {
    aggregationPipeline.push(
      { $match: { ticker: ticker } },
      {
        $group: {
          _id: { $dateToString: { format: groupByFormat, date: "$timestamp" } },
          open: { $first: "$mentionCount" },
          high: { $max: "$mentionCount" },
          low: { $min: "$mentionCount" },
          close: { $last: "$mentionCount" }
        }
      },
      { $sort: { "_id": 1 } }
    );
  }

  try {
    const result = await this.aggregate(aggregationPipeline);
    return result.map(data => {
      return chartType === 'candlestick' ? {
        t: data._id,
        o: data.open,
        h: data.high,
        l: data.low,
        c: data.close
      } : {
        t: data._id,
        y: data.mentionCount
      };
    });
  } catch (error) {
    console.error("Error in getChartData: ", error.message, error.stack);
    throw error;
  }
};

// Method to add a new sentiment score
cryptoMentionSchema.methods.addSentimentScore = function(sentiment, score, enhancedSentiment) {
  this.sentimentScoreOverTime.push({ sentiment, score, timestamp: new Date(), enhancedSentiment });
  return this.save();
};

// Method to retrieve sentiment analysis results over time
cryptoMentionSchema.statics.getSentimentOverTime = async function(ticker, startDate, endDate) {
  const query = {
    ticker: ticker,
    'sentimentScoreOverTime.timestamp': { $gte: new Date(startDate), $lte: new Date(endDate) }
  };
  return this.find(query, { 'sentimentScoreOverTime.$': 1 });
};

cryptoMentionSchema.methods.logError = function(error) {
  console.error("Error in CryptoMention model: ", error.message, error.stack);
};

export const CryptoMention = mongoose.model('CryptoMention', cryptoMentionSchema);
