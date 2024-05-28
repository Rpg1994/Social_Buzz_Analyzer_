const fetch = require('node-fetch');
require('dotenv').config();

const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY; // INPUT_REQUIRED {insert your CoinMarketCap API key here}
const CRYPTOCOMPARE_API_KEY = process.env.CRYPTOCOMPARE_API_KEY; // INPUT_REQUIRED {insert your CryptoCompare API key here}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
let priceCache = {};

async function fetchCryptoPriceFromCoinMarketCap(ticker) {
  const url = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${ticker}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-CMC_PRO_API_KEY': COINMARKETCAP_API_KEY,
      },
    });
    if (!response.ok) {
      throw new Error(`CoinMarketCap API error: ${response.statusText}`);
    }
    const data = await response.json();
    return data.data[ticker].quote.USD.price;
  } catch (error) {
    console.error("Failed to fetch price from CoinMarketCap:", error.message, error.stack);
    throw new Error('Failed to fetch price from CoinMarketCap.');
  }
}

async function fetchCryptoPriceFromCryptoCompare(ticker) {
  const url = `https://min-api.cryptocompare.com/data/price?fsym=${ticker}&tsyms=USD&api_key=${CRYPTOCOMPARE_API_KEY}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`CryptoCompare API error: ${response.statusText}`);
    }
    const data = await response.json();
    return data.USD;
  } catch (error) {
    console.error("Failed to fetch price from CryptoCompare:", error.message, error.stack);
    throw new Error('Failed to fetch price from CryptoCompare.');
  }
}

async function getCryptoPrice(ticker) {
  const cacheKey = ticker.toUpperCase();
  const now = new Date();

  // Check if price is cached and not expired
  if (priceCache[cacheKey] && now - priceCache[cacheKey].timestamp < CACHE_DURATION) {
    console.log(`Returning cached price for ${ticker}`);
    return priceCache[cacheKey].price;
  }

  // Fetch new price (from either API as fallback)
  try {
    const price = await fetchCryptoPriceFromCoinMarketCap(ticker);
    priceCache[cacheKey] = { price, timestamp: now };
    console.log(`Fetched new price from CoinMarketCap for ${ticker}: ${price}`);
    return price;
  } catch (error) {
    try {
      const price = await fetchCryptoPriceFromCryptoCompare(ticker);
      priceCache[cacheKey] = { price, timestamp: now };
      console.log(`Fetched new price from CryptoCompare for ${ticker}: ${price}`);
      return price;
    } catch (error) {
      console.error("Failed to fetch price from both APIs:", error.message, error.stack);
      throw new Error('Failed to fetch price from both CoinMarketCap and CryptoCompare.');
    }
  }
}

module.exports = { getCryptoPrice };