const mongoose = require('mongoose');
const { Schema } = mongoose;

const alertSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  cryptoTicker: { type: String, required: true, index: true },
  alertType: { type: String, required: true, enum: ['mentionCountChange', 'sentimentScoreChange', 'newTrendingCrypto'] },
  threshold: { type: Number, required: true }
});

alertSchema.index({ userId: 1, cryptoTicker: 1 }, { unique: true });

alertSchema.pre('save', function(next) {
  console.log(`Saving alert for user ${this.userId} and cryptoTicker ${this.cryptoTicker}`);
  next();
});

alertSchema.post('save', function(error, doc, next) {
  if (error.name === 'MongoError' && error.code === 11000) {
    console.log('There was a duplicate key error');
    next(new Error('There is already an alert set for this user and cryptocurrency ticker.'));
  } else {
    console.log('Error saving the alert:', error);
    next(error);
  }
});

const Alert = mongoose.model('Alert', alertSchema);

module.exports = Alert;