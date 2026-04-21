// src/app.js — main Express app configuration
// We keep server.js minimal; this file holds the app setup.

const express = require('express');
const cors = require('cors');

// Import route files
const transactionsRouter = require('./routes/transactions');
const refundsRouter = require('./routes/refunds');
const settlementsRouter = require('./routes/settlements');
const overviewRouter = require('./routes/overview');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Root + health endpoints
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'ACC Merchants API is running',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'acc-merchants-api',
    version: '0.3.0',
  });
});

// Mount routers
app.use('/api/transactions', transactionsRouter);
app.use('/api/refunds', refundsRouter);
app.use('/api/settlements', settlementsRouter);
app.use('/api/overview', overviewRouter);

// 404 handler — any unknown route
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.originalUrl,
  });
});

module.exports = app;