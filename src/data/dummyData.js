// src/data/dummyData.js
// Generates realistic dummy transaction data for the ACC Merchants API.
// In a later step, this will be replaced with real database queries.

const TXN_STATUS = ['SUCCESS', 'FAILED', 'PENDING', 'REFUNDED'];
const METHODS = ['UPI', 'CARD', 'WALLET', 'NETBANKING'];
const CUSTOMER_NAMES = [
  'Rohan Sharma', 'Priya Iyer', 'Arjun Mehta', 'Sneha Reddy', 'Vikram Nair',
  'Aisha Khan', 'Karan Patel', 'Meera Joshi', 'Siddharth Rao', 'Tanvi Desai',
  'Rahul Verma', 'Nisha Pillai', 'Aditya Singh', 'Isha Kapoor', 'Neel Bhatia',
];
const GATEWAYS = ['Razorpay', 'PayU', 'Cashfree', 'Paytm'];

// A reproducible pseudo-random generator (so we get same data every time).
function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Build 80 transactions.
const TRANSACTIONS = Array.from({ length: 80 }, (_, i) => {
  const r = seededRandom(i + 1);
  const daysAgo = Math.floor(r * 30);
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(Math.floor(seededRandom(i + 2) * 24));
  date.setMinutes(Math.floor(seededRandom(i + 3) * 60));

  const roll = seededRandom(i + 4);
  let status;
  if (roll < 0.75) status = 'SUCCESS';
  else if (roll < 0.88) status = 'FAILED';
  else if (roll < 0.95) status = 'PENDING';
  else status = 'REFUNDED';

  const amount = Math.round((seededRandom(i + 5) * 9500 + 50) * 100) / 100;

  return {
    id: `TXN${String(10234560 + i).padStart(10, '0')}`,
    orderId: `ORD${String(80010 + i).padStart(6, '0')}`,
    date: date.toISOString(),
    amount,
    fee: Math.round(amount * 0.02 * 100) / 100,
    status,
    method: METHODS[Math.floor(seededRandom(i + 6) * METHODS.length)],
    customer: CUSTOMER_NAMES[Math.floor(seededRandom(i + 7) * CUSTOMER_NAMES.length)],
    customerPhone: `+91 9${String(Math.floor(seededRandom(i + 8) * 900000000) + 100000000)}`,
    gateway: GATEWAYS[Math.floor(seededRandom(i + 9) * GATEWAYS.length)],
    last4: String(Math.floor(seededRandom(i + 10) * 9000) + 1000),
  };
});

// Build 12 settlements.
const SETTLEMENTS = Array.from({ length: 12 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - i * 2 - 1);
  const gross = Math.round((seededRandom(i + 100) * 80000 + 15000) * 100) / 100;
  const fee = Math.round(gross * 0.021 * 100) / 100;
  return {
    id: `STL${String(50010 + i).padStart(6, '0')}`,
    date: d.toISOString(),
    gross,
    fee,
    net: Math.round((gross - fee) * 100) / 100,
    utr: `HDFC${Math.floor(seededRandom(i + 200) * 900000000) + 100000000}`,
    status: i === 0 ? 'PROCESSING' : 'CREDITED',
    txnCount: Math.floor(seededRandom(i + 300) * 40) + 10,
  };
});

// Build 8 refunds from refunded transactions.
const REFUNDS = TRANSACTIONS
  .filter((t) => t.status === 'REFUNDED')
  .slice(0, 8)
  .map((t, i) => ({
    id: `REF${String(30010 + i).padStart(6, '0')}`,
    txnId: t.id,
    amount: t.amount,
    customer: t.customer,
    date: new Date(new Date(t.date).getTime() + 86400000).toISOString(),
    status: seededRandom(i + 500) > 0.2 ? 'PROCESSED' : 'INITIATED',
    reason: ['Customer request', 'Duplicate payment', 'Item unavailable', 'Cancelled order'][i % 4],
  }));

module.exports = {
  TRANSACTIONS,
  SETTLEMENTS,
  REFUNDS,
};