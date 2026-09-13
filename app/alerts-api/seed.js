const fs = require('node:fs');
const path = require('node:path');
const { pool } = require('./src/db');

async function seed() {
  const schema = fs.readFileSync(path.join(__dirname, 'db', 'schema.sql'), 'utf8');
  const data = fs.readFileSync(path.join(__dirname, 'db', 'seed.sql'), 'utf8');
  await pool.query(schema);
  await pool.query(data);
  console.log('alerts-api database schema and fictional seed loaded');
}

seed().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}).finally(() => pool.end());
