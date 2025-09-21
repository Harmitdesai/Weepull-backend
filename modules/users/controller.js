// controllers/userController.js
const { verifyUser, saveUser, checkOnBoarded } = require("./service");

// Verify User - Login
async function verifyUserController(req, res) {
  const { email } = req.body;

  try {
    const user = await verifyUser(email);
    if (user.length > 0) {
      return res.json({ success: true, user });
    } else {
      return res.status(401).json({ success: false, message: "User not found" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

// Save User - Signup
async function saveUserController(req, res) {
  const { name, email } = req.body;

  try {
    const newUser = await saveUser(name, email);
    const data = res.json({ success: true, user: newUser });
    return data;
  } catch (error) {
    console.error(error);
    return res.status(400).json({ success: false, message: error.message });
  }
}

async function checkOnBoardedController(req, res) {
  const { email } = req.body;

  try {
    const status = await checkOnBoarded(email);
    const data = res.json({ success: true, data: status });
    return data;
  } catch (error) {
    console.error(error);
    return res.status(400).json({ success: false, message: error.message });
  }
}

module.exports = {
  verifyUserController,
  saveUserController,
  checkOnBoardedController,
};
