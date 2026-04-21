// src/routes/settlements.js
const express = require('express');
const router = express.Router();
const { query } = require('../db');

function rowToSettlement(row) {
  return {
    id: row.id,
    date: row.date,
    gross: parseFloat(row.gross),
    fee: parseFloat(row.fee),
    net: parseFloat(row.net),
    utr: row.utr,
    status: row.status,
    txnCount: row.txn_count,
  };
}

// GET /api/settlements
router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM settlements ORDER BY date DESC');
    const settlements = result.rows.map(rowToSettlement);

    const totalCredited = settlements
      .filter((s) => s.status === 'CREDITED')
      .reduce((sum, s) => sum + s.net, 0);

    const pending = settlements.find((s) => s.status === 'PROCESSING');

    res.json({
      summary: {
        totalCredited: Math.round(totalCredited * 100) / 100,
        pending: pending ? pending.net : 0,
        nextSettlement: 'T+1 days',
      },
      total: settlements.length,
      settlements,
    });
  } catch (err) {
    console.error('GET /api/settlements failed:', err.message);
    res.status(500).json({ error: 'Failed to fetch settlements' });
  }
});

module.exports = router;