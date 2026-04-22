// src/app.js — main Express app configuration with auth

const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Auth middleware
const { clerkMw, requireAuth } = require('./middleware/auth');

// Route files
const transactionsRouter = require('./routes/transactions');
const refundsRouter = require('./routes/refunds');
const settlementsRouter = require('./routes/settlements');
const overviewRouter = require('./routes/overview');

const app = express();

// Basic middleware
app.use(cors({
  origin: true, // Allow all origins for now; tighten in production
  credentials: true,
}));
app.use(express.json());

// Clerk auth middleware — runs on every request
app.use(clerkMw);

// -------- Public routes (no auth needed) --------

// Root — health check (public so you can verify the server is up)
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
    version: '0.4.0',
  });
});

// -------- Protected routes (require valid Clerk login) --------
// DEBUG: test route to verify requireAuth works
app.use('/api/transactions', requireAuth, transactionsRouter);
app.use('/api/refunds', requireAuth, refundsRouter);
app.use('/api/settlements', requireAuth, settlementsRouter);
app.use('/api/overview', requireAuth, overviewRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.originalUrl,
  });
});

// Error handler — catches auth errors and other errors
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  if (err.statusCode === 401 || err.message?.includes('Unauthenticated')) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'You must be signed in to access this resource',
    });
  }
  res.status(err.statusCode || 500).json({
    error: 'Server error',
    message: err.message,
  });
});

module.exports = app;