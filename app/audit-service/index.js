const { pool } = require('../alerts-api/src/db');

async function recordAudit({ action, resource, sourceIp, details = {} }) {
  await pool.query(
    'INSERT INTO audit_log (action, resource, source_ip, details) VALUES ($1, $2, $3, $4)',
    [action, resource, sourceIp || null, details]
  );
}

async function listAudit(limit = 100) {
  const result = await pool.query(
    'SELECT id, timestamp, action, resource, source_ip, details FROM audit_log ORDER BY timestamp DESC LIMIT $1',
    [limit]
  );
  return result.rows;
}

module.exports = { recordAudit, listAudit };
