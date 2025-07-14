const { sqlPool } = require("../../common/db");

async function createSeller(email, accountId) {
  // making connection with the database
  const connection = await sqlPool.getConnection();
  try {
    // Insert the new seller into the database
    const [result] = await connection.execute(
      "INSERT INTO users (sellerId) VALUES (?) WHERE email = ?",
      [email, accountId]
    );
    connection.release();
    return result;
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    // closing connection with SQL
    connection.release();
  }
}

async function checkSellerId(email){
  // making connection with the database
  const connection = await sqlPool.getConnection();
  try {
    // Check if the seller already exists
    const [rows, fields] = await connection.execute(
      "SELECT sellerId FROM users WHERE email = ?",
      [email]
    );
    connection.release();
    return rows[0].sellerId;
  } catch (error) {
    console.error("Error checking seller ID:", error);
    throw error;
  }
  finally {
    // closing connection with SQL
    connection.release();
  }
}

async function updateOnBoardStatus(email) {
  // making connection with the database
  const connection = await sqlPool.getConnection();
  try {
    // Update the onboarded status of the seller
    const [row, field] = await connection.execute(
      "UPDATE users SET onBoarded = ? WHERE email = ?",
      [true, email]
    );
    connection.release();
    return row[0].onBoarded;
  } catch (error) {
    console.error("Error updating onboarded status:", error);
    throw error;
  }
  finally {
    // closing connection with SQL
    connection.release();
  }
}

module.exports = {
  createSeller,
  checkSellerId,
  updateOnBoardStatus
};