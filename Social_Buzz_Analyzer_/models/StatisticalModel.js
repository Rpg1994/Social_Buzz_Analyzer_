const mongoose = require('mongoose');

const statisticalModelSchema = new mongoose.Schema({
  ticker: { type: String, required: true },
  name: { type: String, required: true },
  projectedMovement: { type: String, required: true, enum: ['up', 'down', 'stable'] },
  confidenceLevel: { type: Number, required: true },
  predictionTimestamp: { type: Date, default: Date.now }
});

// Indexes for efficient querying
statisticalModelSchema.index({ ticker: 1, predictionTimestamp: 1 }, { unique: false });

statisticalModelSchema.methods.logError = function(error) {
  console.error("Error in StatisticalModel model: ", error.message, error.stack);
};

const StatisticalModel = mongoose.model('StatisticalModel', statisticalModelSchema);

module.exports = StatisticalModel;