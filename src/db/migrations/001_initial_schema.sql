-- src/db/migrations/001_initial_schema.sql
-- Creates the initial tables for the ACC Merchants dashboard

-- Drop tables if they already exist (safe for re-running during development)
DROP TABLE IF EXISTS refunds CASCADE;
DROP TABLE IF EXISTS settlements CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;

-- Transactions table
CREATE TABLE transactions (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  fee NUMERIC(12, 2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('SUCCESS', 'FAILED', 'PENDING', 'REFUNDED')),
  method TEXT NOT NULL CHECK (method IN ('UPI', 'CARD', 'WALLET', 'NETBANKING')),
  customer TEXT NOT NULL,
  customer_phone TEXT,
  gateway TEXT NOT NULL,
  last4 TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster filtering/sorting
CREATE INDEX idx_transactions_date ON transactions (date DESC);
CREATE INDEX idx_transactions_status ON transactions (status);
CREATE INDEX idx_transactions_method ON transactions (method);

-- Refunds table
CREATE TABLE refunds (
  id TEXT PRIMARY KEY,
  txn_id TEXT NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) NOT NULL,
  customer TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('PROCESSED', 'INITIATED')),
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_refunds_date ON refunds (date DESC);

-- Settlements table
CREATE TABLE settlements (
  id TEXT PRIMARY KEY,
  date TIMESTAMPTZ NOT NULL,
  gross NUMERIC(12, 2) NOT NULL,
  fee NUMERIC(12, 2) NOT NULL,
  net NUMERIC(12, 2) NOT NULL,
  utr TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('CREDITED', 'PROCESSING')),
  txn_count INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_settlements_date ON settlements (date DESC);