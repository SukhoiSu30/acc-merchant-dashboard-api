// src/routes/settlements.js
const express = require('express');
const router = express.Router();
const { SETTLEMENTS } = require('../data/dummyData');

// GET /api/settlements — list all settlements
router.get('/', (req, res) => {
  const totalCredited = SETTLEMENTS
    .filter((s) => s.status === 'CREDITED')
    .reduce((sum, s) => sum + s.net, 0);

  const pending = SETTLEMENTS.find((s) => s.status === 'PROCESSING');

  res.json({
    summary: {
      totalCredited: Math.round(totalCredited * 100) / 100,
      pending: pending ? pending.net : 0,
      nextSettlement: 'T+1 days',
    },
    total: SETTLEMENTS.length,
    settlements: SETTLEMENTS,
  });
});

module.exports = router;