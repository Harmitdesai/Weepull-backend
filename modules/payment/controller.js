const { updateStripeConnectAccountId, getOnBoardingStatus, createOrder, getBalance, reduceBalance, getOrders, deleteOrder } = require("./service");

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
        metadata: { order_id: orderid, total_data_points: totalDataPoints, cost_per_data_point: cost_per_data_point },  // This adds metadata to the PaymentIntent
        transfer_group: `ORDER_#${orderid}`,
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

async function proceedRedeemController(req, res) {
  const { email } = req.body;
  const balance = await getBalance(email);
  const stripe_connected_account_id = (await getOnBoardingStatus(email)).stripe_connected_account_id;

  try {
    const transfer = await stripe.transfers.create({
      amount: balance * 100,
      currency: 'usd',
      destination: stripe_connected_account_id
    });

    await reduceBalance(email, balance);

    const loginLink = await stripe.accounts.createLoginLink(stripe_connected_account_id);

    return res.status(200).json({ data: { loginLink: loginLink.url }, success: true });

  } catch (error) {
    console.error('Transfer failed:', error.message);
    res.status(500).json({ error: error.message, success: false });
  }
}

async function getOrdersController(req, res) {
  const { email } = req.body;
  try {
    const orders = await getOrders(email);
    return res.status(200).json({ data: { orders: orders }, success: true });

  } catch (error) {
    console.error("Error getting orders:", error);
    res.status(500).json({ error: error.message, success: false });
  }
}

async function deleteOrderController(req, res) {
  const { order_id } = req.body;
  try {
    await deleteOrder(order_id);
    return res.status(200).json({ data: { success: true }, success: true });
  } catch (error) {
    return res.status(500).json({ error: error.message, success: false });
  }
}

module.exports = {
  checkOnBoardedController,
  getCheckoutLinkController,
  proceedRedeemController,
  getOrdersController,
  deleteOrderController
};