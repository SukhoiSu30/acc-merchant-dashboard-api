// src/routes/overview.js
const express = require('express');
const router = express.Router();
const { TRANSACTIONS } = require('../data/dummyData');

// GET /api/overview — summary for the home dashboard
router.get('/', (req, res) => {
  const today = new Date();
  const todayStr = today.toDateString();

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();

  // Today's sales (successful only)
  const todayTotal = TRANSACTIONS
    .filter((t) => new Date(t.date).toDateString() === todayStr && t.status === 'SUCCESS')
    .reduce((s, t) => s + t.amount, 0);

  // Yesterday's sales
  const yesterdayTotal = TRANSACTIONS
    .filter((t) => new Date(t.date).toDateString() === yesterdayStr && t.status === 'SUCCESS')
    .reduce((s, t) => s + t.amount, 0);

  // This month
  const monthTotal = TRANSACTIONS
    .filter((t) => t.status === 'SUCCESS' && new Date(t.date).getMonth() === today.getMonth())
    .reduce((s, t) => s + t.amount, 0);

  // Pending settlement = first 12 successful txns' net
  const pendingSettlement = TRANSACTIONS
    .filter((t) => t.status === 'SUCCESS')
    .slice(0, 12)
    .reduce((s, t) => s + (t.amount - t.fee), 0);

  const failedCount = TRANSACTIONS.filter((t) => t.status === 'FAILED').length;

  // Build 7-day chart data
  const chartData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    const sum = TRANSACTIONS
      .filter((t) => new Date(t.date).toDateString() === d.toDateString() && t.status === 'SUCCESS')
      .reduce((s, t) => s + t.amount, 0);
    return {
      day: d.toLocaleDateString('en-IN', { weekday: 'short' }),
      amount: Math.round(sum),
    };
  });

  // Method breakdown
  const methods = ['UPI', 'CARD', 'WALLET', 'NETBANKING'];
  const methodBreakdown = methods.map((m) => ({
    name: m,
    count: TRANSACTIONS.filter((t) => t.method === m && t.status === 'SUCCESS').length,
  }));

  res.json({
    stats: {
      todayTotal: Math.round(todayTotal * 100) / 100,
      yesterdayTotal: Math.round(yesterdayTotal * 100) / 100,
      monthTotal: Math.round(monthTotal * 100) / 100,
      pendingSettlement: Math.round(pendingSettlement * 100) / 100,
      failedCount,
      successfulTxnCount: TRANSACTIONS.filter((t) => t.status === 'SUCCESS').length,
    },
    chartData,
    methodBreakdown,
  });
});

module.exports = router;