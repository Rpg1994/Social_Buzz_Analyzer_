import mongoose from 'mongoose';

const cryptocurrencySchema = new mongoose.Schema({
  name: { type: String, required: true },
  ticker: { type: String, required: true, unique: true },
  lastUpdated: { type: Date, default: Date.now },
});

export const Cryptocurrency = mongoose.model('Cryptocurrency', cryptocurrencySchema);