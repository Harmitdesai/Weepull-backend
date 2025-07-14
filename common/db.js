// db.js
require('dotenv').config();
const mysql = require('mysql2/promise');
const { Pinecone } = require('@pinecone-database/pinecone');

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});


// Create a connection pool
const pool = mysql.createPool({
  host: 'localhost', // MySQL server host
  user: 'root', // MySQL username
  password: process.env.SQL_PASS, // MySQL password
  database: process.env.SQL_DB, // Database name
  connectionLimit: 10
});

// Export both the client and the pool promise
module.exports = {
  pinecone: pinecone,
  sqlPool: pool,
};