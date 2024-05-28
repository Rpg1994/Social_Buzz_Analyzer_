const Alert = require('../models/Alert');
const User = require('../models/User'); // Assuming User model exists and includes alert preferences

// Function to create a new alert
const createAlert = async (userId, cryptoTicker, alertType, threshold) => {
  try {
    const alert = new Alert({ userId, cryptoTicker, alertType, threshold });
    await alert.save();
    console.log(`Alert created successfully for user ${userId} and cryptoTicker ${cryptoTicker}`);
    return alert;
  } catch (error) {
    console.error('Error creating alert:', error);
    throw error;
  }
};

// Function to update an existing alert
const updateAlert = async (alertId, updateFields) => {
  try {
    const alert = await Alert.findByIdAndUpdate(alertId, updateFields, { new: true });
    if (!alert) {
      throw new Error('Alert not found');
    }
    console.log(`Alert ${alertId} updated successfully`);
    return alert;
  } catch (error) {
    console.error('Error updating alert:', error);
    throw error;
  }
};

// Function to delete an alert
const deleteAlert = async (alertId) => {
  try {
    const result = await Alert.findByIdAndDelete(alertId);
    if (!result) {
      throw new Error('Alert not found');
    }
    console.log(`Alert ${alertId} deleted successfully`);
    return result;
  } catch (error) {
    console.error('Error deleting alert:', error);
    throw error;
  }
};

// Function to update user preferences for alerts
const updateUserAlertPreferences = async (userId, preferences) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    user.alertPreferences = preferences; // Assuming the User model has an alertPreferences field
    await user.save();
    console.log(`Alert preferences updated successfully for user ${userId}`);
  } catch (error) {
    console.error('Error updating user alert preferences:', error);
    throw error;
  }
};

module.exports = {
  createAlert,
  updateAlert,
  deleteAlert,
  updateUserAlertPreferences,
};