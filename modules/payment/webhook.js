const { updateOnBoardedStatus, updateOrderPaymentStatus, getPostIdFromOrderId, getDataIdsFromOrderId, removePostData, addBalance } = require("./service");
const Stripe = require("stripe");

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

async function handleAccountUpdated(event) {
    const account = event.data.object;

    if (account.details_submitted) {
        updateOnBoardedStatus(account.id, true);
    }
}

async function handlePaymentSucceeded(event) {
    const paymentIntent = event.data.object;
    if (paymentIntent.status == "succeeded"){
        updateOrderPaymentStatus(paymentIntent.metadata.order_id, "paid");

        const post_id = await getPostIdFromOrderId(paymentIntent.metadata.order_id);

        const data_ids = await getDataIdsFromOrderId(paymentIntent.metadata.order_id);

        removePostData(post_id, data_ids);

        addBalance(data_ids, paymentIntent.metadata.cost_per_data_point );

    }
}

async function stripeWebhookController(req, res) {
    const sig = req.headers["stripe-signature"];

    try {
        const event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
        );

        console.log("Verified event:", event.type);

        switch (event.type) {
            case "account.updated":
                // handle account updates
                handleAccountUpdated(event);
                break;

            case "payment_intent.succeeded":
                // handle successful payments
                handlePaymentSucceeded(event);
                break;
            break;

            case "customer.subscription.deleted":
            // handle subscription cancellations
            break;

            default:
            console.log(`Unhandled event type ${event.type}`);
        }

        res.json({ success: true });
    } catch (err) {
        console.error("Stripe Webhook failed:", err.message);
        res.status(400).send(`Webhook Error: ${err.message}`);
    }
}

module.exports = { stripeWebhookController };