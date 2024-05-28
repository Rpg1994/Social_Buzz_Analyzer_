const { checkSubscriptionStatus } = require('../../services/stripeService');

const isAuthenticated = async (req, res, next) => {
  if (req.session && req.session.userId) {
    try {
      const { active, reason } = await checkSubscriptionStatus(req.session.userId);
      if (active) {
        return next(); // Proceed if subscription is active or in trial
      } else {
        console.log(`Access denied due to subscription status: ${reason}`);
        return res.status(403).json({ message: "Access denied", reason: reason });
      }
    } catch (error) {
      console.error(`Error checking subscription status: ${error.message}`, error);
      return res.status(500).send('Internal server error');
    }
  } else {
    console.log('User is not authenticated');
    return res.status(401).send('You are not authenticated');
  }
};

module.exports = {
  isAuthenticated
};