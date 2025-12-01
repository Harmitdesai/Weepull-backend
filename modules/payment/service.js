const { sqlPool } = require("../../common/db");
const { tryCatchSqlWrapper } = require("../../common/utils/decorator");

const { getUserIdFromEmail } = require("../utils/sqlQueries");

const addBalance = tryCatchSqlWrapper(async (connection, data_ids, pricePerUnit) => {
  placeholders = data_ids.map(() => '?').join(',');
  const sql = `UPDATE users JOIN data ON users.user_id = data.user_id SET users.balance = users.balance + ${pricePerUnit} WHERE data.data_id IN (${placeholders})`;
  connection.execute(sql, data_ids);
});

async function updateStripeConnectAccountId(email, accountId) {
  // making connection with the database
  const connection = await sqlPool.getConnection();
  try {
    // Insert the new seller into the database
    const [result] = await connection.execute(
      "UPDATE users SET stripe_connected_account_id = ? WHERE email = ?",
      [accountId, email]
    );
    console.log("Stripe Connect Account ID updated:", result);
    return result;
  } catch (error) {
    console.error("Error updating stripe connect account id:", error);
    throw error;
  } finally {
    // closing connection with SQL
    connection.release();
  }
}

const createOrder = tryCatchSqlWrapper(async (connection, post_id, totalDataPoints, pricePerData, email) => {
  const user_id = await getUserIdFromEmail(email);
  console.log("✌🏻✌🏻✌🏻 User ID fetched:", user_id);

  await connection.execute("INSERT INTO orders (user_id, post_id, total_unit, price_per_unit, payment_status) VALUES (?,?,?,?,'unpaid')",[user_id, post_id, totalDataPoints, pricePerData]);
  
  const [order, orderfields] = await connection.execute("SELECT LAST_INSERT_ID() AS order_id;");

  const [rows, postfields] = await connection.execute(`SELECT data_id FROM post_data WHERE post_id = ? LIMIT ${Number(totalDataPoints)} `, [Number(post_id)]);
  values = rows.map(row => [order[0].order_id,row.data_id]);

  await connection.query("INSERT INTO order_data (order_id, data_id) VALUES ?",[values]);

  return order[0].order_id;
});

const updateOnBoardedStatus = tryCatchSqlWrapper((connection, accountId, bool) => {
  return connection.execute(
    "UPDATE users SET onBoarded = ? WHERE stripe_connected_account_id = ?",
    [bool, accountId]
  );
});

const updateOrderPaymentStatus = tryCatchSqlWrapper((connection, order_id, status) => {
  return connection.execute(
    "UPDATE orders SET payment_status = ? WHERE order_id = ?",
    [status, order_id]
  );
});

const removePostData = tryCatchSqlWrapper(async (connection, post_id, data_ids) => {
  const placeholders = data_ids.map(() => "?").join(","); // "?,?,?"
  const params = [post_id, ...data_ids]
  return await connection.execute(`DELETE FROM post_data WHERE post_id = ? AND data_id IN (${placeholders})`, params);
});

const getDataIdsFromOrderId = tryCatchSqlWrapper(async (connection, order_id) => {
  const [rows, fields] = await connection.execute(`SELECT data_id FROM order_data WHERE order_id = ?`, [Number(order_id)]);
  const result = rows.map( row => row.data_id);
  return result;
});

const getPostIdFromOrderId = tryCatchSqlWrapper(async (connection, order_id) => {
  const [rows, fields] = await connection.execute(`SELECT post_id FROM orders WHERE order_id = ?`, [Number(order_id)]);
  return rows[0].post_id;
});

async function getOnBoardingStatus(email) {
  const connection = await sqlPool.getConnection();
  try {
    const [rows, fields] = await connection.execute(
      "SELECT onBoarded, stripe_connected_account_id FROM users WHERE email = ?",
      [email]
    );
    return rows.length > 0 ? rows[0] : null
  } catch (error) {
    console.error("Error getting onboarding status:", error);
    throw error;
  } finally {
    connection.release();
  }
}

const getBalance = tryCatchSqlWrapper(async (connection, email) => {
        const [rows, fields] = await connection.execute("SELECT balance FROM users WHERE email=?", [email]);
        return rows[0].balance;
});

const reduceBalance = tryCatchSqlWrapper(async (connection, email, balance) => {
        const sql = `UPDATE users SET balance = balance - ? WHERE email = ?`;
        await connection.execute(sql, [balance, email]);
});

const getOrders = tryCatchSqlWrapper(async (connection, email) => {
        const sql = "SELECT o.order_id, DATE(o.created_at) AS order_date, TIME(o.created_at) AS order_time, dr.title AS post_title, o.total_unit AS num_datapoints FROM orders o JOIN data_requests dr ON o.post_id = dr.post_id JOIN users u ON o.user_id = u.user_id WHERE o.payment_status = 'paid' AND u.email = ? ORDER BY o.created_at DESC"
        const [rows, fields] = await connection.execute(sql, [email]);
        return rows;
});

const deleteOrder = tryCatchSqlWrapper(async (connection, order_id) => {
        const [result] = await connection.execute("DELETE FROM orders WHERE order_id = ?", [order_id]);
        if (result.affectedRows <= 0){
          throw new Error("No order found with the given order_id");
        }
});

module.exports = {
  addBalance,
  createOrder,
  getDataIdsFromOrderId,
  getOnBoardingStatus,
  getPostIdFromOrderId,
  removePostData,
  updateOnBoardedStatus,
  updateOrderPaymentStatus,
  updateStripeConnectAccountId,
  getBalance,
  reduceBalance,
  getOrders,
  deleteOrder
};