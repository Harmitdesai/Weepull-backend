const express = require('express');
const cors = require("cors");
const app = express();
const Stripe = require('stripe');
require('dotenv').config();


const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const userRoutes = require('./modules/users/route');
const dataUploadRoutes = require('./modules/dataUpload/route');
const dataFetchRoutes = require('./modules/dataFetch/route');
const paymentRoutes = require('./modules/payment/route');
app.use(express.json());
app.use(cors());


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