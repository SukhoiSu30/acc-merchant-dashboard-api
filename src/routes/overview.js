// src/routes/overview.js
const express = require('express');
const router = express.Router();
const { query } = require('../db');

// GET /api/overview
router.get('/', async (req, res) => {
  try {
    // Run all queries in parallel for speed
    const [statsRes, chartRes, methodRes] = await Promise.all([
      // Summary stats
      query(`
        SELECT
          COALESCE(SUM(CASE
            WHEN status = 'SUCCESS' AND DATE(date) = CURRENT_DATE THEN amount
            ELSE 0 END), 0) AS today_total,
          COALESCE(SUM(CASE
            WHEN status = 'SUCCESS' AND DATE(date) = CURRENT_DATE - INTERVAL '1 day' THEN amount
            ELSE 0 END), 0) AS yesterday_total,
          COALESCE(SUM(CASE
            WHEN status = 'SUCCESS' AND DATE_TRUNC('month', date) = DATE_TRUNC('month', CURRENT_DATE) THEN amount
            ELSE 0 END), 0) AS month_total,
          COUNT(CASE WHEN status = 'FAILED' THEN 1 END) AS failed_count,
          COUNT(CASE WHEN status = 'SUCCESS' THEN 1 END) AS successful_txn_count
        FROM transactions
      `),

      // Chart data — last 7 days
      query(`
        SELECT
          DATE(date) AS day,
          COALESCE(SUM(amount), 0) AS amount
        FROM transactions
        WHERE status = 'SUCCESS'
          AND date >= CURRENT_DATE - INTERVAL '6 days'
        GROUP BY DATE(date)
        ORDER BY day
      `),

      // Payment method breakdown
      query(`
        SELECT method, COUNT(*) AS count
        FROM transactions
        WHERE status = 'SUCCESS'
        GROUP BY method
      `),
    ]);

    const stats = statsRes.rows[0];

    // Pending settlement = first 12 successful txns' net
    const pendingRes = await query(`
      SELECT COALESCE(SUM(amount - fee), 0) AS pending
      FROM (
        SELECT amount, fee FROM transactions
        WHERE status = 'SUCCESS'
        ORDER BY date DESC
        LIMIT 12
      ) t
    `);

    // Build chart data for the last 7 days (fill missing days with 0)
    const dayMap = {};
    chartRes.rows.forEach((r) => {
      dayMap[new Date(r.day).toDateString()] = Math.round(parseFloat(r.amount));
    });

    const chartData = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return {
        day: d.toLocaleDateString('en-IN', { weekday: 'short' }),
        amount: dayMap[d.toDateString()] || 0,
      };
    });

    // Build method breakdown (include all 4 even if count is 0)
    const methods = ['UPI', 'CARD', 'WALLET', 'NETBANKING'];
    const methodCounts = {};
    methodRes.rows.forEach((r) => { methodCounts[r.method] = parseInt(r.count, 10); });
    const methodBreakdown = methods.map((m) => ({
      name: m,
      count: methodCounts[m] || 0,
    }));

    res.json({
      stats: {
        todayTotal: Math.round(parseFloat(stats.today_total) * 100) / 100,
        yesterdayTotal: Math.round(parseFloat(stats.yesterday_total) * 100) / 100,
        monthTotal: Math.round(parseFloat(stats.month_total) * 100) / 100,
        pendingSettlement: Math.round(parseFloat(pendingRes.rows[0].pending) * 100) / 100,
        failedCount: parseInt(stats.failed_count, 10),
        successfulTxnCount: parseInt(stats.successful_txn_count, 10),
      },
      chartData,
      methodBreakdown,
    });
  } catch (err) {
    console.error('GET /api/overview failed:', err.message);
    res.status(500).json({ error: 'Failed to fetch overview' });
  }
});

module.exports = router;