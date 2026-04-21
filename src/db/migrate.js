// src/db/migrate.js
// Runs all .sql files in the migrations folder, in order.

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool } = require('../db');

async function migrate() {
  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();  // ensures 001 runs before 002, etc.

  console.log(`Found ${files.length} migration(s):`);
  files.forEach((f) => console.log(`  - ${f}`));
  console.log('');

  for (const file of files) {
    console.log(`⏳ Running ${file}...`);
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    try {
      await pool.query(sql);
      console.log(`✅ ${file} done.\n`);
   } catch (err) {
      console.log(`\n❌ ${file} failed:`);
      console.log('  Error code:', err.code);
      console.log('  Error message:', err.message);
      console.log('  Detail:', err.detail);
      console.log('  Where:', err.where);
      console.log('  Full error:', JSON.stringify(err, null, 2));
      process.exit(1);
    }
  }

  console.log('🎉 All migrations complete.');
  await pool.end();
}

migrate();