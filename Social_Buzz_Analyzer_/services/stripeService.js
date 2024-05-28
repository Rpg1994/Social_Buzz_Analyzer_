require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');

const createSubscription = async (userId, email, paymentMethodId, priceId) => {
  try {
    const customer = await stripe.customers.create({
      payment_method: paymentMethodId,
      email: email,
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      expand: ['latest_invoice.payment_intent'],
    });

    await User.findByIdAndUpdate(userId, { stripeCustomerId: customer.id, stripeSubscriptionId: subscription.id });

    console.log(`Subscription created successfully for user ${userId}`);
    return subscription;
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
};

const cancelSubscription = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user.stripeSubscriptionId) throw new Error('No subscription found for user.');

    const canceledSubscription = await stripe.subscriptions.del(user.stripeSubscriptionId);

    await User.findByIdAndUpdate(userId, { stripeSubscriptionId: null });

    console.log(`Subscription canceled successfully for user ${userId}`);
    return canceledSubscription;
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw error;
  }
};

const handleWebhook = async (requestBody, signature, endpointSecret) => {
  let event;

  try {
    event = stripe.webhooks.constructEvent(requestBody, signature, endpointSecret);
  } catch (err) {
    console.error('Error verifying webhook signature:', err);
    throw err;
  }

  try {
    switch (event.type) {
      case 'customer.subscription.deleted':
        const subscription = event.data.object;
        await User.findOneAndUpdate({ stripeSubscriptionId: subscription.id }, { stripeSubscriptionId: null });
        console.log(`Handled customer.subscription.deleted event for subscription ID ${subscription.id}`);
        break;
      // Handle other event types as needed
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  } catch (error) {
    console.error('Error handling webhook event:', error);
    throw error;
  }

  return event;
};

const checkSubscriptionStatus = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user || !user.stripeSubscriptionId) {
      return { active: false, reason: "No subscription found" };
    }

    const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
    const isActive = subscription.status === 'active' || subscription.status === 'trialing';

    return { active: isActive, reason: isActive ? "" : "Subscription not active" };
  } catch (error) {
    console.error('Error checking subscription status:', error);
    throw error;
  }
};

module.exports = {
  createSubscription,
  cancelSubscription,
  handleWebhook,
  checkSubscriptionStatus,
};