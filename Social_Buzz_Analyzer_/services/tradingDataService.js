const fetch = require('node-fetch');
const redis = require('redis');
const { promisify } = require('util');
require('dotenv').config();

const client = redis.createClient({
  url: process.env.REDIS_URL // Ensure this environment variable is set in your .env file
});
const GET_ASYNC = promisify(client.get).bind(client);
const SET_ASYNC = promisify(client.setex).bind(client);
const CACHE_DURATION = 300; // 5 minutes in seconds

client.on('error', (err) => console.log('Redis Client Error', err));

const API_URL = 'https://api.coingecko.com/api/v3/simple/price';

async function getRealTimeTradingData(ticker) {
  try {
    const cacheKey = `tradingData:${ticker.toLowerCase()}`;
    const cachedData = await GET_ASYNC(cacheKey);
    if (cachedData) {
      console.log(`Cache hit for ticker: ${ticker}`);
      return JSON.parse(cachedData);
    }

    const params = new URLSearchParams({
      ids: ticker.toLowerCase(), // Coingecko uses lowercase IDs for cryptocurrencies
      vs_currencies: 'usd',
      include_market_cap: 'true',
      include_24hr_vol: 'true',
      include_24hr_change: 'true',
      include_last_updated_at: 'true',
    });

    const response = await fetch(`${API_URL}?${params}`);
    if (!response.ok) {
      console.error(`Error fetching data from CoinGecko for ticker ${ticker}: ${response.statusText}`);
      throw new Error(`Error fetching data from CoinGecko: ${response.statusText}`);
    }
    const data = await response.json();
    if (data[ticker.toLowerCase()]) {
      const tradingData = {
        price: data[ticker.toLowerCase()].usd,
        volume: data[ticker.toLowerCase()].usd_24h_vol,
        changePercentage: data[ticker.toLowerCase()].usd_24h_change,
      };
      await SET_ASYNC(cacheKey, CACHE_DURATION, JSON.stringify(tradingData));
      console.log(`Cache miss for ticker: ${ticker}. Data cached.`);
      return tradingData;
    } else {
      console.error(`Ticker not found for ${ticker}`);
      throw new Error('Ticker not found');
    }
  } catch (error) {
    console.error(`Failed to fetch real-time trading data for ${ticker}:`, error.message, error.stack);
    throw error;
  }
}

module.exports = { getRealTimeTradingData };