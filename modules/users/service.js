// services/userService.js
const { sqlPool } = require("../../common/db");

// Check if the user exists
async function verifyUser(email) {
  try {
    const connection = await sqlPool.getConnection();
    const [result, fields] = await connection.execute("SELECT * FROM users WHERE email = ?", [email]);
    connection.release();
    console.log("User verification result:", result);
    return result; // Return user if found, else undefined
  } catch (error) {
    throw new Error("Error verifying user");
  }
}

// Save a new user
async function saveUser(name, email) {
  try {
    // Check if the user already exists
    const connection = await sqlPool.getConnection();
    const [existingUser, fields] = await connection.execute("SELECT * FROM users WHERE username = ?", [name]);

    if (existingUser.length > 0) {
      throw new Error("User already exists");
    }

    // Insert the new user
    const [result] = await connection.execute("INSERT INTO users (username, email) VALUES (?, ?)", [name, email]);
    connection.release();
    console.log("User saved:", result);
    return { id: result.userid, name, email };
  } catch (error) {
    console.log("Error saving user:", error);
    throw new Error("Error saving user");
  }
}

async function checkOnBoarded(email) {
  try {
    const connection = await sqlPool.getConnection();
    const [result, fields] = await connection.execute("SELECT onBoarded FROM users WHERE email = ?", [email]);
    connection.release();

    if (result.length > 0) {
      return result[0].onBoarded; // Return the onboarded status
    } else {
      throw new Error("User not found");
    }
  } catch (error) {
    throw new Error("Error checking onboarded status :" + error.message);
  }
}

module.exports = {
  verifyUser,
  saveUser,
  checkOnBoarded
};
