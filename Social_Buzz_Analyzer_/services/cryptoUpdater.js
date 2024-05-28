import { Cryptocurrency } from '../models/Cryptocurrency.js';
import { getTrendingCryptos } from './trendingCryptoService.js';
import dotenv from 'dotenv';
dotenv.config();

const API_URL = 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest';
const API_KEY = process.env.COINMARKETCAP_API_KEY;

async function fetchWithDynamicImport(url, options) {
  const { default: fetch } = await import('node-fetch');
  return fetch(url, options);
}

async function updateCryptocurrencyList() {
  console.log('Starting to update cryptocurrency list from external API');
  try {
    const response = await fetchWithDynamicImport(API_URL, {
      method: 'GET',
      headers: {
        'X-CMC_PRO_API_KEY': API_KEY,
        'Accept': 'application/json'
      }
    });
    if (!response.ok) {
      throw new Error(`Error fetching data from API: ${response.statusText}`);
    }
    const data = await response.json();
    // Adjust according to the actual structure of the API response
    const cryptocurrencies = data.data; 

    for (const crypto of cryptocurrencies) {
      const { name, symbol: ticker } = crypto;
      // Check if cryptocurrency already exists and update or create accordingly
      const updateResult = await Cryptocurrency.findOneAndUpdate({ ticker }, { name, ticker }, { upsert: true, new: true });
      if (updateResult) {
        console.log(`Updated or added cryptocurrency: ${name} (${ticker})`);
      }
    }

    console.log('Cryptocurrency list updated successfully');
  } catch (error) {
    console.error('Failed to update cryptocurrency list:', error.message, error.stack);
  }
}

async function updateTrendingCryptocurrencies() {
  console.log('Starting to update trending cryptocurrencies');

  try {
    const trendingCryptos = await getTrendingCryptos();
    for (const crypto of trendingCryptos) {
      const { name, symbol: ticker } = crypto;
      const exists = await Cryptocurrency.findOne({ ticker });

      if (!exists) {
        const newCrypto = new Cryptocurrency({
          name,
          ticker,
          lastUpdated: new Date(),
          trending: true
        });
        await newCrypto.save();
        console.log(`Added new trending cryptocurrency: ${name} (${ticker})`);
      }
    }

    console.log('Trending cryptocurrencies updated successfully');
  } catch (error) {
    console.error('Failed to update trending cryptocurrencies:', error.message, error.stack);
  }
}