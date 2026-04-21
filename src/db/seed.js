// src/db/seed.js
// Populates the database with dummy data for development.

require('dotenv').config();
const { pool } = require('../db');
const { TRANSACTIONS, SETTLEMENTS, REFUNDS } = require('../data/dummyData');

async function seed() {
  console.log('🌱 Starting seed...\n');

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    console.log('🧹 Clearing existing data...');
    await client.query('TRUNCATE refunds, settlements, transactions RESTART IDENTITY CASCADE');

    console.log(`📥 Inserting ${TRANSACTIONS.length} transactions...`);
    for (const t of TRANSACTIONS) {
      await client.query(
        `INSERT INTO transactions
          (id, order_id, date, amount, fee, status, method, customer, customer_phone, gateway, last4)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [t.id, t.orderId, t.date, t.amount, t.fee, t.status, t.method, t.customer, t.customerPhone, t.gateway, t.last4]
      );
    }

    console.log(`📥 Inserting ${SETTLEMENTS.length} settlements...`);
    for (const s of SETTLEMENTS) {
      await client.query(
        `INSERT INTO settlements
          (id, date, gross, fee, net, utr, status, txn_count)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [s.id, s.date, s.gross, s.fee, s.net, s.utr, s.status, s.txnCount]
      );
    }

    console.log(`📥 Inserting ${REFUNDS.length} refunds...`);
    for (const r of REFUNDS) {
      await client.query(
        `INSERT INTO refunds
          (id, txn_id, amount, customer, date, status, reason)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [r.id, r.txnId, r.amount, r.customer, r.date, r.status, r.reason]
      );
    }

    await client.query('COMMIT');
    console.log('\n✅ Seed complete.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('\n❌ Seed failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();