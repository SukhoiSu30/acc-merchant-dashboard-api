// src/routes/transactions.js
// API endpoints for transactions

const express = require('express');
const router = express.Router();
const { TRANSACTIONS } = require('../data/dummyData');

// GET /api/transactions — list all transactions (with optional filters)
router.get('/', (req, res) => {
  const { status, method, search, limit } = req.query;

  let results = [...TRANSACTIONS];

  if (status && status !== 'ALL') {
    results = results.filter((t) => t.status === status);
  }

  if (method && method !== 'ALL') {
    results = results.filter((t) => t.method === method);
  }

  if (search) {
    const s = search.toLowerCase();
    results = results.filter(
      (t) =>
        t.id.toLowerCase().includes(s) ||
        t.customer.toLowerCase().includes(s) ||
        t.orderId.toLowerCase().includes(s)
    );
  }

  // Sort by date, most recent first
  results.sort((a, b) => new Date(b.date) - new Date(a.date));

  if (limit) {
    results = results.slice(0, parseInt(limit, 10));
  }

  res.json({
    total: results.length,
    transactions: results,
  });
});

// GET /api/transactions/:id — get one transaction by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const txn = TRANSACTIONS.find((t) => t.id === id);

  if (!txn) {
    return res.status(404).json({
      error: 'Transaction not found',
      id,
    });
  }

  res.json(txn);
});

module.exports = router;