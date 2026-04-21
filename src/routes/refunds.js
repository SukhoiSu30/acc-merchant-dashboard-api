// src/routes/refunds.js
const express = require('express');
const router = express.Router();
const { REFUNDS } = require('../data/dummyData');

// GET /api/refunds — list all refunds
router.get('/', (req, res) => {
  res.json({
    total: REFUNDS.length,
    refunds: REFUNDS,
  });
});

// GET /api/refunds/:id — get one refund by ID
router.get('/:id', (req, res) => {
  const refund = REFUNDS.find((r) => r.id === req.params.id);
  if (!refund) {
    return res.status(404).json({ error: 'Refund not found' });
  }
  res.json(refund);
});

module.exports = router;