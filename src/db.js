// src/db.js
// A single, shared connection pool for the whole backend.

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
    require: true,
  },
  // Wait up to 30s before timing out (Render free tier can be slow to wake)
  connectionTimeoutMillis: 30000,
  // Keep connections alive
  idleTimeoutMillis: 30000,
  max: 5,
});

// Log connection errors for debugging
pool.on('error', (err) => {
  console.error('⚠️  Database pool error:', err.message);
});

async function query(text, params) {
  const result = await pool.query(text, params);
  return result;
}

module.exports = { pool, query };