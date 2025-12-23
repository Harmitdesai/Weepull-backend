const express = require("express");
const router = express.Router();
const { checkOnBoardedController, getCheckoutLinkController, proceedRedeemController, getOrdersController, deleteOrderController } = require("./controller");
const { stripeWebhookConnectedController, stripeWebhookPlatformController } = require("./webhook");

router.post("/checkOnBoarded", checkOnBoardedController); // POST to check if a seller is onboarded and return the link if not
router.post("/stripeWebhook/connected", express.raw({ type: "application/json" }), stripeWebhookConnectedController); // POST to handle Stripe webhook events for connected accounts
router.post("/stripeWebhook/platform", express.raw({ type: "application/json" }), stripeWebhookPlatformController); // POST to handle Stripe webhook events for platform
router.post("/getCheckoutLink", getCheckoutLinkController); // POST to create a Stripe Checkout session and return the link
router.post("/redeem", proceedRedeemController); // POST to create a Stripe Checkout session for redeeming balance and return the link
router.post("/orders", getOrdersController); // POST to get all orders of a user
router.delete("/deleteOrder", deleteOrderController); // DELETE to delete an order

module.exports = router;