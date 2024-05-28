const DashboardWidget = require('../models/DashboardWidget');
const User = require('../models/User');
const logger = require('../services/loggerService');

// Function to save user dashboard configuration
const saveUserDashboardConfig = async (userId, config) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    const newWidget = new DashboardWidget({
      userId,
      ...config
    });
    await newWidget.save();
    logger.info(`Dashboard configuration saved successfully for user ${userId}`);
  } catch (error) {
    logger.error(`Error saving dashboard configuration for user ${userId}: ${error.stack}`);
    throw error;
  }
};

// Function to fetch user dashboard configuration
const getUserDashboardConfig = async (userId) => {
  try {
    const widgets = await DashboardWidget.find({ userId });
    logger.info(`Fetched dashboard widgets for user ${userId}`);
    return widgets;
  } catch (error) {
    logger.error(`Error fetching dashboard widgets for user ${userId}: ${error.stack}`);
    throw error;
  }
};

module.exports = {
  saveUserDashboardConfig,
  getUserDashboardConfig,
};