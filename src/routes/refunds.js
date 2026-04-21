// src/routes/refunds.js
const express = require('express');
const router = express.Router();
const { query } = require('../db');

function rowToRefund(row) {
  return {
    id: row.id,
    txnId: row.txn_id,
    amount: parseFloat(row.amount),
    customer: row.customer,
    date: row.date,
    status: row.status,
    reason: row.reason,
  };
}

// GET /api/refunds
router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM refunds ORDER BY date DESC');
    res.json({
      total: result.rows.length,
      refunds: result.rows.map(rowToRefund),
    });
  } catch (err) {
    console.error('GET /api/refunds failed:', err.message);
    res.status(500).json({ error: 'Failed to fetch refunds' });
  }
});

// GET /api/refunds/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await query('SELECT * FROM refunds WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Refund not found' });
    }
    res.json(rowToRefund(result.rows[0]));
  } catch (err) {
    console.error('GET /api/refunds/:id failed:', err.message);
    res.status(500).json({ error: 'Failed to fetch refund' });
  }
});

module.exports = router;