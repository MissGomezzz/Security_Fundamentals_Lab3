const { Pool } = require('pg');
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '..', '.env') });

const pool = new Pool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || 'muvautomation_lab3',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  max: 10
});

pool.on('error', (error) => {
  console.error(JSON.stringify({ event: 'db_pool_error', message: error.message, timestamp: new Date().toISOString() }));
});

module.exports = { pool };
