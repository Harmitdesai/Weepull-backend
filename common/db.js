// db.js
require('dotenv').config();
const mysql = require('mysql2/promise');
const { Pinecone } = require('@pinecone-database/pinecone');

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});


// Create a connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST, // MySQL server host
  user: process.env.DB_USER, // MySQL username
  password: process.env.DB_PASSWORD, // MySQL password
  database: process.env.DB_NAME, // Database name
  connectionLimit: 10
});

// Export both the client and the pool promise
module.exports = {
  pinecone: pinecone,
  sqlPool: pool,
};