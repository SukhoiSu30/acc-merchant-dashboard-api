// server.js — entry point for the ACC Merchants API
require('dotenv').config();
const app = require('./src/app');

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`✅ ACC Merchants API running at http://localhost:${PORT}`);
  console.log(`   Health:       http://localhost:${PORT}/api/health`);
  console.log(`   Transactions: http://localhost:${PORT}/api/transactions`);
  console.log(`   Overview:     http://localhost:${PORT}/api/overview`);
});