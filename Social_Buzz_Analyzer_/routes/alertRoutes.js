const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('./middleware/authMiddleware');
const alertService = require('../services/alertService');

// POST endpoint to create an alert
router.post('/api/alerts', isAuthenticated, async (req, res) => {
  try {
    const { userId, cryptoTicker, alertType, threshold } = req.body;
    const alert = await alertService.createAlert(userId, cryptoTicker, alertType, threshold);
    console.log(`Alert created successfully for user ${userId} and cryptoTicker ${cryptoTicker}`);
    res.status(201).json(alert);
  } catch (error) {
    console.error(`Error creating alert: ${error.message}`, error);
    res.status(400).json({ message: error.message });
  }
});

// PUT endpoint to update an alert
router.put('/api/alerts/:id', isAuthenticated, async (req, res) => {
  try {
    const alertId = req.params.id;
    const updateFields = req.body;
    const updatedAlert = await alertService.updateAlert(alertId, updateFields);
    console.log(`Alert ${alertId} updated successfully`);
    res.status(200).json(updatedAlert);
  } catch (error) {
    console.error(`Error updating alert: ${error.message}`, error);
    res.status(400).json({ message: error.message });
  }
});

// DELETE endpoint to delete an alert
router.delete('/api/alerts/:id', isAuthenticated, async (req, res) => {
  try {
    const alertId = req.params.id;
    await alertService.deleteAlert(alertId);
    console.log(`Alert ${alertId} deleted successfully`);
    res.status(204).send();
  } catch (error) {
    console.error(`Error deleting alert: ${error.message}`, error);
    res.status(400).json({ message: error.message });
  }
});

// PUT endpoint to update user alert preferences
router.put('/api/user/alert-preferences', isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.userId; // Adjusted to use session for user ID retrieval
    const preferences = req.body;
    await alertService.updateUserAlertPreferences(userId, preferences);
    console.log(`Alert preferences updated successfully for user ${userId}.`);
    res.status(200).json({ message: 'Alert preferences updated successfully.' });
  } catch (error) {
    console.error(`Error updating alert preferences: ${error.message}`, error);
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;