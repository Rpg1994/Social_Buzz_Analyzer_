const ApiAccessKey = require('../models/ApiAccessKey');

const validateDeveloperApiKey = async (req, res, next) => {
  try {
    const apiKey = req.header('apiKey');
    if (!apiKey) {
      console.log("API key is required for authentication.");
      return res.status(403).json({ message: "API key is required for authentication." });
    }

    const isValidApiKey = await ApiAccessKey.validateApiKey(apiKey);
    if (!isValidApiKey) {
      console.log(`Invalid API key: ${apiKey}`);
      return res.status(403).json({ message: "Invalid API key." });
    }

    console.log(`API key validated successfully: ${apiKey}`);
    next();
  } catch (error) {
    console.error(`API Key validation error: ${error.message}`, error.stack);
    res.status(500).json({ message: "Internal server error during API key validation." });
  }
};

module.exports = validateDeveloperApiKey;