const express = require("express");
const router = express.Router();
const { checkOnBoardedController, getCheckoutLinkController } = require("./controller");
const { stripeWebhookController } = require("./webhook");

router.post("/checkOnBoarded", checkOnBoardedController); // POST to check if a seller is onboarded and return the link if not
router.post("/stripeWebhook", express.raw({ type: "application/json" }), stripeWebhookController); // POST to handle Stripe webhook events
router.post("/getCheckoutLink", getCheckoutLinkController); // POST to create a Stripe Checkout session and return the link

module.exports = router;