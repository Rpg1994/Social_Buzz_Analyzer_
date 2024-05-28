const express = require('express');
const bodyParser = require('body-parser');
const stripeService = require('../services/stripeService');
const router = express.Router();

router.post('/webhook', bodyParser.raw({type: 'application/json'}), async (req, res) => {
  const signature = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  try {
    const event = await stripeService.handleWebhook(req.body, signature, endpointSecret);
    console.log(`Webhook received and processed successfully for event type: ${event.type}`);
    res.json({received: true});
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
});

module.exports = router;