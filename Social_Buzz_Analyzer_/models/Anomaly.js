const mongoose = require('mongoose');

const anomalySchema = new mongoose.Schema({
  name: String,
  ticker: String,
  sourcePlatform: String,
  mentionCount: Number,
  likes: Number,
  shares: Number,
  retweets: Number,
  timestamp: Date,
  anomaly: Boolean
});

anomalySchema.pre('save', function(next) {
  console.log(`Saving anomaly for ticker ${this.ticker}`);
  next();
});

anomalySchema.post('save', function(error, doc, next) {
  if (error) {
    console.log('Error saving the anomaly:', error);
    next(error);
  } else {
    console.log(`Anomaly saved successfully for ticker ${doc.ticker}`);
    next();
  }
});

const Anomaly = mongoose.model('Anomaly', anomalySchema);

module.exports = Anomaly;