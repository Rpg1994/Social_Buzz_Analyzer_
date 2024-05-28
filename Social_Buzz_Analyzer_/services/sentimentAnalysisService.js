import { exec } from 'child_process';
import { promisify } from 'util';
import { Cryptocurrency } from '../models/Cryptocurrency.js';
import { CryptoMention } from '../models/cryptoMention.js';
import fs from 'fs';
import path from 'path';

const execPromise = promisify(exec);

async function runSentimentAnalysis() {
  try {
    const cryptocurrencies = await Cryptocurrency.find({});
    console.log(`Starting enhanced sentiment analysis for ${cryptocurrencies.length} cryptocurrencies.`);
    for (const crypto of cryptocurrencies) {
      const mentionsFilePath = path.join(__dirname, `../data/mentions/${crypto.ticker}.json`);
      if (!fs.existsSync(mentionsFilePath)) {
        console.log(`No mentions data found for ${crypto.ticker}, skipping sentiment analysis.`);
        continue;
      }
      const command = `python ./scraper/sentimentAnalyzer.py < ${mentionsFilePath}`;
      const { stdout, stderr } = await execPromise(command);
      if (stderr) {
        console.error(`Error executing enhanced sentiment analysis for ${crypto.ticker}: ${stderr}`);
        continue;
      }
      
      const analysisResults = JSON.parse(stdout);
      for (const result of analysisResults) {
        await CryptoMention.findOneAndUpdate(
          { ticker: crypto.ticker, 'sentimentScoreOverTime.timestamp': result.analysisTimestamp },
          { $push: { sentimentScoreOverTime: result } },
          { upsert: true }
        ).catch(error => {
          console.error(`Failed to update enhanced sentiment analysis result for ${crypto.ticker}:`, error.message);
          console.error(error.stack);
        });
      }
      console.log(`Enhanced sentiment analysis completed for ${crypto.ticker}.`);
    }
  } catch (error) {
    console.error('Failed to run enhanced sentiment analysis:', error.message);
    console.error(error.stack);
  }
}

export { runSentimentAnalysis };