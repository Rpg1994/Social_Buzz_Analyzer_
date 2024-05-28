const { spawn } = require('child_process');
const CryptoMention = require('../models/cryptoMention');
const Anomaly = require('../models/Anomaly.js'); // Assuming Anomaly model exists

async function detectAndStoreAnomalies() {
  try {
    const mentions = await CryptoMention.find({});
    const data = JSON.stringify(mentions.map(mention => ({
      name: mention.name,
      ticker: mention.ticker,
      sourcePlatform: mention.sourcePlatform,
      mentionCount: mention.mentionCount,
      likes: mention.likes,
      shares: mention.shares,
      retweets: mention.retweets,
      timestamp: mention.timestamp,
      sentiment: mention.sentiment
    })));
    
    const pythonProcess = spawn('python', ['./scraper/anomalyDetection.py']);
    pythonProcess.stdin.write(data);
    pythonProcess.stdin.end();

    pythonProcess.stdout.on('data', async (data) => {
      const anomalies = JSON.parse(data.toString());
      // Save anomalies to the database
      await Anomaly.insertMany(anomalies.map(anomaly => ({
        name: anomaly.name,
        ticker: anomaly.ticker,
        sourcePlatform: anomaly.sourcePlatform,
        mentionCount: anomaly.mentionCount,
        likes: anomaly.likes,
        shares: anomaly.shares,
        retweets: anomaly.retweets,
        timestamp: anomaly.timestamp,
        anomaly: anomaly.anomaly
      })));
      console.log('Anomalies detected and stored:', anomalies.length);
    });

    pythonProcess.stderr.on('data', (data) => console.error(`stderr: ${data.toString()}`));
    pythonProcess.on('close', (code) => console.log(`child process exited with code ${code}`));

  } catch (error) {
    console.error('Error detecting anomalies:', error.message, error.stack);
  }
}

module.exports = { detectAndStoreAnomalies };