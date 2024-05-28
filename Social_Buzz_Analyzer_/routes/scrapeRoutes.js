const express = require('express');
const router = express.Router();
const { exec, spawn } = require('child_process');
const CryptoMention = require('../models/cryptoMention');
const InfluenceScore = require('../models/influenceScore'); // Include the InfluenceScore model
const anomalyDetectionService = require('../services/anomalyDetectionService');

router.post('/scrape', async (req, res) => {
    const { platform, cryptoTicker } = req.body;
    let scraperCommand;

    switch (platform) {
        case 'Twitter':
            scraperCommand = `python ./scraper/twitterScraper.py ${cryptoTicker}`;
            break;
        case 'Reddit':
            scraperCommand = `python ./scraper/redditScraper.py ${cryptoTicker}`;
            break;
        case 'Telegram':
            scraperCommand = `python ./scraper/telegramScraper.py ${cryptoTicker}`;
            break;
        default:
            console.error(`Invalid platform specified: ${platform}`);
            return res.status(400).json({ error: 'Invalid platform specified' });
    }

    exec(scraperCommand, async (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            console.error(error.stack);
            return res.status(500).json({ error: 'Failed to execute scraper script' });
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
            return res.status(500).json({ error: 'Error during scraper script execution' });
        }

        try {
            const data = JSON.parse(stdout);
            const influenceScoreProcess = spawn('python', ['./scraper/influenceScoreCalculator.py']);
            let enhancedData = [];

            influenceScoreProcess.stdin.write(JSON.stringify(data));
            influenceScoreProcess.stdin.end();

            influenceScoreProcess.stdout.on('data', async (data) => {
                enhancedData = JSON.parse(data.toString());
                // Save each influence score to the database
                for (const score of enhancedData) {
                    const scoreDocument = new InfluenceScore({
                        ticker: cryptoTicker,
                        sourcePlatform: platform,
                        influenceScore: score.influence_score,
                        postDetails: score // Store the entire post details along with the calculated influence score
                    });
                    await scoreDocument.save().catch((dbError) => {
                        console.error("Error saving influence score to database:", dbError.message);
                        console.error(dbError.stack);
                    });
                }
            });

            influenceScoreProcess.stderr.on('data', (data) => {
                console.error(`stderr: ${data}`);
            });

            influenceScoreProcess.on('error', (error) => {
                console.error(`Failed to start influence score process: ${error.message}`);
                console.error(error.stack);
            });

            influenceScoreProcess.on('close', async (code) => {
                if (code !== 0) {
                    console.error(`Influence score process exited with code ${code}`);
                    return res.status(500).json({ error: 'Influence score process failed' });
                }
                console.log(`Influence score process exited with code ${code}`);
                res.json({ message: 'Data scraped, analyzed, and saved successfully', anomaliesDetected: enhancedData.some(mention => mention.suspiciousActivityFlag) ? 'Yes' : 'No' });
            });

        } catch (parseError) {
            console.error(`Parse error: ${parseError}`);
            console.error(parseError.stack);
            return res.status(500).json({ error: 'Failed to parse scraper script output' });
        }
    });
});

module.exports = router;