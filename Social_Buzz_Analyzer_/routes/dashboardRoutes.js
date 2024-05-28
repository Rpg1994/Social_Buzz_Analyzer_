const express = require('express');
const DashboardWidget = require('../models/DashboardWidget');
const { isAuthenticated } = require('./middleware/authMiddleware');

const router = express.Router();

// POST method to create a new dashboard widget
router.post('/dashboard/widgets', isAuthenticated, async (req, res) => {
  try {
    const { widgetType, cryptoTickers, layout } = req.body;
    const userId = req.session.userId; // Assuming userId is stored in session upon authentication

    const newWidget = await DashboardWidget.create({
      userId,
      widgetType,
      cryptoTickers,
      layout,
    });

    console.log(`New dashboard widget created for user ${userId}`);
    res.status(201).json(newWidget);
  } catch (error) {
    console.error(`Dashboard widget creation failed for user ${req.session.userId}: ${error}`);
    console.error(error.stack);
    res.status(500).send('Internal Server Error');
  }
});

// GET method to fetch all widgets for the authenticated user
router.get('/dashboard/widgets', isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.userId;

    const widgets = await DashboardWidget.find({ userId }).lean();
    console.log(`Fetched dashboard widgets for user ${userId}`);
    res.json(widgets);
  } catch (error) {
    console.error(`Fetching dashboard widgets failed for user ${req.session.userId}: ${error}`);
    console.error(error.stack);
    res.status(500).send('Internal Server Error');
  }
});

// PUT method to update widget layout
router.put('/dashboard/widgets/:widgetId', isAuthenticated, async (req, res) => {
  const { widgetId } = req.params;
  const { layout } = req.body;
  const userId = req.session.userId;

  try {
    const widget = await DashboardWidget.findOneAndUpdate(
      { _id: widgetId, userId: userId },
      { $set: { layout: layout } },
      { new: true }
    );

    if (!widget) {
      console.log(`Widget not found or user not authorized to update this widget.`);
      return res.status(404).send('Widget not found or user not authorized to update this widget.');
    }

    console.log(`Widget ${widgetId} layout updated for user ${userId}`);
    res.json(widget);
  } catch (error) {
    console.error(`Error updating widget layout for user ${userId}: ${error}`);
    console.error(error.stack);
    res.status(500).send('Internal Server Error');
  }
});

// DELETE method to remove a dashboard widget
router.delete('/dashboard/widgets/:widgetId', isAuthenticated, async (req, res) => {
  const { widgetId } = req.params;
  const userId = req.session.userId;

  try {
    const widget = await DashboardWidget.findOneAndDelete({ _id: widgetId, userId: userId });
    if (!widget) {
      console.log(`Widget not found or user not authorized to delete this widget.`);
      return res.status(404).send('Widget not found or user not authorized to delete this widget.');
    }
    console.log(`Widget ${widgetId} deleted for user ${userId}`);
    res.status(204).send(); // 204 No Content
  } catch (error) {
    console.error(`Error deleting widget for user ${userId}: ${error}`);
    console.error(error.stack);
    res.status(500).send('Internal Server Error');
  }
});

// POST endpoint to save dashboard configuration
router.post('/dashboard/config', isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.userId;
    const config = req.body;
    await dashboardService.saveUserDashboardConfig(userId, config);
    console.log(`Dashboard configuration saved successfully for user ${userId}.`);
    res.status(201).json({ message: 'Dashboard configuration saved successfully.' });
  } catch (error) {
    console.error(`Failed to save dashboard configuration for user ${userId}: ${error}`);
    console.error(error.stack);
    res.status(500).send('Internal Server Error');
  }
});

// GET endpoint to fetch dashboard configuration
router.get('/dashboard/config', isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.userId;
    const config = await dashboardService.getUserDashboardConfig(userId);
    console.log(`Fetched dashboard configuration for user ${userId}.`);
    res.status(200).json(config);
  } catch (error) {
    console.error(`Failed to fetch dashboard configuration for user ${userId}: ${error}`);
    console.error(error.stack);
    res.status(500).send('Internal Server Error');
  }
});

export default router;