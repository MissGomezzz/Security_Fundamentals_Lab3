const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { pool } = require('./db');
const { requestLogger, writeLog } = require('./logger');
const { recordAudit, listAudit } = require('../../audit-service');

const app = express();
const port = Number(process.env.PORT_API || 3001);
const severities = new Set(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);
const statuses = new Set(['new', 'in_progress', 'closed']);
const tactics = new Set(['severity', 'status', 'tactic']);

app.use(cors());
app.use(express.json({ limit: '100kb' }));
app.use(morgan('combined'));
app.use(requestLogger);

function parsePositiveInteger(value, fallback, maximum) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed < 0) return fallback;
  return Math.min(parsed, maximum);
}

function alertPayload(body) {
  if (!body || !severities.has(body.severity) || !statuses.has(body.status || 'new')) return null;
  if (!body.tactic || !body.technique || !body.hostname || !body.description) return null;
  return {
    id: body.id || `alert-${crypto.randomUUID()}`,
    composite_id: body.composite_id || `lab3:${crypto.randomUUID()}`,
    severity: body.severity,
    status: body.status || 'new',
    tactic: String(body.tactic),
    technique: String(body.technique),
    hostname: String(body.hostname),
    description: String(body.description)
  };
}

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', service: 'alerts-api', database: 'ok' });
  } catch (error) {
    writeLog({ event: 'health_check_failed', message: error.message });
    res.status(503).json({ status: 'degraded', service: 'alerts-api', database: 'unavailable' });
  }
});

app.get('/api/alerts', async (req, res, next) => {
  try {
    const limit = parsePositiveInteger(req.query.limit, 50, 100);
    const offset = parsePositiveInteger(req.query.offset, 0, 100000);
    const values = [limit, offset];
    const filters = [];
    if (req.query.severity && severities.has(req.query.severity)) {
      values.push(req.query.severity);
      filters.push(`severity = $${values.length}`);
    }
    if (req.query.status && statuses.has(req.query.status)) {
      values.push(req.query.status);
      filters.push(`status = $${values.length}`);
    }
    const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
    const result = await pool.query(
      `SELECT id, composite_id, severity, status, tactic, technique, hostname, description, created_timestamp, updated_timestamp
       FROM alerts ${where} ORDER BY created_timestamp DESC LIMIT $1 OFFSET $2`, values
    );
    res.json({ data: result.rows, limit, offset, count: result.rowCount });
  } catch (error) { next(error); }
});

app.get('/api/alerts/:id', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM alerts WHERE id = $1', [req.params.id]);
    if (!result.rowCount) return res.status(404).json({ error: 'alert_not_found' });
    res.json(result.rows[0]);
  } catch (error) { next(error); }
});

app.post('/api/alerts', async (req, res, next) => {
  try {
    const alert = alertPayload(req.body);
    if (!alert) return res.status(400).json({ error: 'invalid_alert_payload' });
    const result = await pool.query(
      `INSERT INTO alerts (id, composite_id, severity, status, tactic, technique, hostname, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [alert.id, alert.composite_id, alert.severity, alert.status, alert.tactic, alert.technique, alert.hostname, alert.description]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) { next(error); }
});

app.patch('/api/alerts/:id/status', async (req, res, next) => {
  try {
    if (!statuses.has(req.body && req.body.status)) return res.status(400).json({ error: 'invalid_status' });
    const result = await pool.query(
      'UPDATE alerts SET status = $1, updated_timestamp = NOW() WHERE id = $2 RETURNING *',
      [req.body.status, req.params.id]
    );
    if (!result.rowCount) return res.status(404).json({ error: 'alert_not_found' });
    await recordAudit({
      action: 'alert_status_changed',
      resource: `alert:${req.params.id}`,
      sourceIp: req.ip,
      details: { status: req.body.status }
    });
    res.json(result.rows[0]);
  } catch (error) { next(error); }
});

app.post('/api/alerts/aggregates', async (req, res, next) => {
  try {
    const field = req.body && req.body.field;
    if (!tactics.has(field)) return res.status(400).json({ error: 'field_must_be_severity_status_or_tactic' });
    const ranges = Array.isArray(req.body.date_ranges) ? req.body.date_ranges : [];
    const range = ranges[0] || {};
    const from = range.from || range.start || '1970-01-01T00:00:00.000Z';
    const to = range.to || range.end || new Date().toISOString();
    const result = await pool.query(
      `SELECT ${field} AS value, COUNT(*)::int AS count FROM alerts
       WHERE created_timestamp >= $1::timestamptz AND created_timestamp <= $2::timestamptz
       GROUP BY ${field} ORDER BY count DESC`, [from, to]
    );
    await recordAudit({
      action: 'alerts_aggregated',
      resource: 'alerts',
      sourceIp: req.ip,
      details: { field, date_ranges: ranges }
    });
    res.json({ resources: result.rows, field, date_ranges: [{ from, to }] });
  } catch (error) { next(error); }
});

app.get('/api/audit', async (req, res, next) => {
  try {
    const limit = parsePositiveInteger(req.query.limit, 100, 500);
    res.json({ data: await listAudit(limit), limit });
  } catch (error) { next(error); }
});

app.use((error, req, res, next) => {
  writeLog({ event: 'application_error', method: req.method, path: req.originalUrl, message: error.message, stack: error.stack });
  res.status(500).json({ error: 'internal_server_error' });
});

if (require.main === module) {
  app.listen(port, () => console.log(`alerts-api listening on port ${port}`));
}

module.exports = app;
