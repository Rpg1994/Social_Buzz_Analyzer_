const mongoose = require('mongoose');
const logger = require('../services/loggerService'); // Assuming there's a logger service based on comprehensive codebase insight

const dashboardWidgetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  widgetType: {
    type: String,
    required: true,
    enum: ['cryptoMentions', 'sentimentAnalysis', 'priceData']
  },
  cryptoTickers: [{
    type: String,
    required: true
  }],
  layout: {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    w: { type: Number, required: true }, // width
    h: { type: Number, required: true } // height
  }
}, { timestamps: true });

dashboardWidgetSchema.pre('save', function(next) {
  logger.info(`Saving widget for user ${this.userId}`);
  next();
});

dashboardWidgetSchema.post('save', function(error, doc, next) {
  if (error) {
    logger.error(`Error saving widget for user ${this.userId}: ${error.stack}`);
    next(error);
  } else {
    logger.info(`Widget saved successfully for user ${this.userId}`);
    next();
  }
});

const DashboardWidget = mongoose.model('DashboardWidget', dashboardWidgetSchema);

module.exports = DashboardWidget;