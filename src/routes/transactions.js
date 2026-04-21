// src/routes/transactions.js
// API endpoints for transactions — now backed by PostgreSQL

const express = require('express');
const router = express.Router();
const { query } = require('../db');

// Helper: convert DB row (snake_case) to API response (camelCase)
function rowToTransaction(row) {
  return {
    id: row.id,
    orderId: row.order_id,
    date: row.date,
    amount: parseFloat(row.amount),
    fee: parseFloat(row.fee),
    status: row.status,
    method: row.method,
    customer: row.customer,
    customerPhone: row.customer_phone,
    gateway: row.gateway,
    last4: row.last4,
  };
}

// GET /api/transactions — list transactions with optional filters
router.get('/', async (req, res) => {
  try {
    const { status, method, search, limit } = req.query;

    // Build dynamic SQL based on filters
    const conditions = [];
    const params = [];

    if (status && status !== 'ALL') {
      params.push(status);
      conditions.push(`status = $${params.length}`);
    }

    if (method && method !== 'ALL') {
      params.push(method);
      conditions.push(`method = $${params.length}`);
    }

    if (search) {
      params.push(`%${search.toLowerCase()}%`);
      conditions.push(`(
        LOWER(id) LIKE $${params.length} OR
        LOWER(customer) LIKE $${params.length} OR
        LOWER(order_id) LIKE $${params.length}
      )`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const limitClause = limit ? `LIMIT ${parseInt(limit, 10)}` : '';

    const sql = `
      SELECT * FROM transactions
      ${whereClause}
      ORDER BY date DESC
      ${limitClause}
    `;

    const result = await query(sql, params);

    res.json({
      total: result.rows.length,
      transactions: result.rows.map(rowToTransaction),
    });
  } catch (err) {
    console.error('GET /api/transactions failed:', err.message);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// GET /api/transactions/:id — get one transaction by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM transactions WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Transaction not found', id });
    }

    res.json(rowToTransaction(result.rows[0]));
  } catch (err) {
    console.error('GET /api/transactions/:id failed:', err.message);
    res.status(500).json({ error: 'Failed to fetch transaction' });
  }
});

module.exports = router;