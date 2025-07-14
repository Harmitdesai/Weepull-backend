const express = require("express");
const router = express.Router();
const { createSellerController, onboardSellerController } = require("./controller");

router.post("/createSeller", createSellerController); // POST to create a seller
router.post("/onboardSeller", onboardSellerController); // POST to onboard a seller

module.exports = router;