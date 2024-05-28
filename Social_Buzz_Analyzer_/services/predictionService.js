const { spawn } = require('child_process');
const path = require('path');

const runPredictionModel = async (ticker) => {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn('python', [path.join(__dirname, '../scraper/trendPredictionModel.py'), ticker]);

    let dataString = '';
    pythonProcess.stdout.on('data', (data) => {
      dataString += data.toString();
    });

    pythonProcess.stdout.on('end', () => {
      try {
        const result = JSON.parse(dataString);
        resolve(result);
      } catch (error) {
        console.error("Error parsing prediction model output:", error.message, error.stack);
        reject("Error parsing prediction model output.");
      }
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
      reject(data.toString());
    });

    pythonProcess.on('close', (code) => {
      console.log(`Prediction model process exited with code ${code}`);
      if (code !== 0) {
        reject(`Prediction model process exited with code ${code}`);
      }
    });

    pythonProcess.on('error', (error) => {
      console.error("Failed to start prediction model process:", error.message, error.stack);
      reject("Failed to start prediction model process.");
    });
  });
};

module.exports = { runPredictionModel };