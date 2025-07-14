const express = require("express");
const router = express.Router();
const { verifyUserController, saveUserController, checkOnBoardedController } = require("./controller");

router.post("/verifyUser", verifyUserController); // POST to verify user (login)
router.post("/saveUser", saveUserController); // POST to save user (signup)
router.post("/checkOnBoarded", checkOnBoardedController); // POST to check if user is onboarded for stripe

module.exports = router;
