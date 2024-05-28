const mongoose = require('mongoose');

const influenceScoreSchema = new mongoose.Schema({
  ticker: { type: String, required: true },
  sourcePlatform: { type: String, required: true },
  influenceScore: { type: Number, required: true },
  postDetails: { type: mongoose.Schema.Types.Mixed, required: true },
  timestamp: { type: Date, default: Date.now }
});

influenceScoreSchema.pre('save', function(next) {
  console.log(`Saving influence score for ${this.ticker} from ${this.sourcePlatform}`);
  next();
});

influenceScoreSchema.post('save', function(doc) {
  console.log(`Influence score for ${doc.ticker} from ${doc.sourcePlatform} saved successfully`);
});

const InfluenceScore = mongoose.model('InfluenceScore', influenceScoreSchema);

module.exports = InfluenceScore;