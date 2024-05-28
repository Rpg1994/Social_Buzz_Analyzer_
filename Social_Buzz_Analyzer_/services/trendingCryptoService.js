import fetch from 'node-fetch';
const CACHE_DURATION = 3600000; // 1 hour in milliseconds

let cache = {
  timestamp: null,
  data: null
};

export async function getTrendingCryptos() {
  const now = new Date();

  // If cache exists and is valid, return cached data
  if (cache.timestamp && (now - cache.timestamp) < CACHE_DURATION) {
    console.log('Returning cached data for trending cryptocurrencies');
    return cache.data;
  }

  const API_URL = 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/trending/latest';
  const API_KEY = process.env.COINMARKETCAP_API_KEY; // INPUT_REQUIRED {insert your CoinMarketCap API key here}

  try {
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: {
        'X-CMC_PRO_API_KEY': API_KEY,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Error fetching trending cryptocurrencies: ${response.statusText}`);
    }

    const data = await response.json();
    const trendingCryptos = data.data.map(crypto => ({
      name: crypto.name,
      symbol: crypto.symbol,
      tradingVolume: crypto.quote.USD.volume_24h // Adjust based on API response structure
    }));

    // Update cache
    cache = {
      timestamp: now,
      data: trendingCryptos
    };

    console.log('Trending cryptocurrencies data updated and cached');
    return trendingCryptos;
  } catch (error) {
    console.error('Failed to fetch trending cryptocurrencies:', error.message, error.stack);
    throw error;
  }
}