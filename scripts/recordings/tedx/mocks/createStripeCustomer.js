// Stands in for src/stripe/createStripeCustomer.js. No call to Stripe.
module.exports = async user => ({ stripe_id: "cus_mock", email: user.email });
