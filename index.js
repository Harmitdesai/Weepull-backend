const express = require('express');
const cors = require("cors");
const app = express();
const Stripe = require('stripe');
require('dotenv').config();

console.log("Starting server with DB config:", {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const userRoutes = require('./modules/users/route');
const dataUploadRoutes = require('./modules/dataUpload/route');
const dataFetchRoutes = require('./modules/dataFetch/route');
const paymentRoutes = require('./modules/payment/route');
app.use((req, res, next) => {
  if (req.originalUrl === "/payment/stripeWebhook/connected" || req.originalUrl === "/payment/stripeWebhook/platform") {
    next();
  } else {
    express.json()(req, res, next);
  }
});
app.use(cors());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Database test endpoint
app.get('/api/db-test', async (req, res) => {
  try {
    const { sqlPool } = require('./common/db');
    const connection = await sqlPool.getConnection();
    const [result] = await connection.execute("SELECT 1");
    connection.release();
    res.json({ status: 'ok', message: 'Database connected successfully', result });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// app.use('/dataUpload', dataUploadRoutes);
app.use('/users', userRoutes);
app.use('/dataUpload', dataUploadRoutes);
app.use('/dataFetch', dataFetchRoutes);
app.use('/payment', paymentRoutes)


// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});