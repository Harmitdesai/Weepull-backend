const { updateStripeConnectAccountId, getOnBoardingStatus, createOrder } = require("./service");

const Stripe = require('stripe');
require('dotenv').config();

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const cost_per_data_point = 0.1;

async function checkOnBoardedController(req, res) {
  const { email } = req.body;

  try {

    sqlData = await getOnBoardingStatus(email);
    if (sqlData === null) {
      return res.status(404).json({ error: "User not found", success: false });
    }

    if (sqlData.onBoarded) {
      return res.status(200).json({ data:{
        onBoarded: true,
        accountLink: null
      }, success: true });
    }

    let stripe_connected_account_id = sqlData.stripe_connected_account_id

    if (!stripe_connected_account_id) {
        account = await stripe.accounts.create(
          {
          type: 'express',
          country: 'US',            // or your sellers’ country
          business_type: 'individual', // or 'company'
          }
        );
        stripe_connected_account_id = account.id;
        await updateStripeConnectAccountId(email, stripe_connected_account_id);
    }

    const linkRes = await stripe.accountLinks.create({
          account: stripe_connected_account_id,
          refresh_url: "http://localhost:3000/upload/text",   
          return_url: "http://localhost:3000/upload/text",
          type: 'account_onboarding',
          });
    
    return res.status(200).json({ data: {
      onBoarded: false,
      accountLink: linkRes.url
    }, success: true });

  } catch (error) {

    console.error("Error checking onboarding:", error);
    res.status(500).json({ error: error.message, success: false });

  } finally {

  }

}

async function getCheckoutLinkController(req, res) {
  const { postId, totalDataPoints, email, postTitle } = req.body;
  try {

    orderid = await createOrder( postId, totalDataPoints, cost_per_data_point, email);
    const session = await stripe.checkout.sessions.create({
    client_reference_id: `ORDER_#${orderid}`,
    line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Post_${postTitle}`,
            },
            unit_amount: cost_per_data_point*100,
          },
          quantity: totalDataPoints,
        },
      ],
      metadata: { order_id: orderid, total_data_points: totalDataPoints, cost_per_data_point: cost_per_data_point },
      payment_intent_data: {
        metadata: { order_id: orderid, total_data_points: totalDataPoints, cost_per_data_point: cost_per_data_point }  // This adds metadata to the PaymentIntent
      },
      mode: 'payment',
      success_url: "http://localhost:3000/",
    });
    return res.status(200).json({ data: {
      url: session.url
    }, success: true });

  } catch (error) {
    console.error("Error checking onboarding:", error);
    res.status(500).json({ error: error.message, success: false });
  }
  finally {

  }

}

module.exports = {
  checkOnBoardedController,
  getCheckoutLinkController
};