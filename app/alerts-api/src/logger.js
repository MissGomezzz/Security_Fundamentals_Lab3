const fs = require('node:fs');
const path = require('node:path');

const logDirectory = path.join(__dirname, '..', 'logs');
const logFile = path.join(logDirectory, 'app.log');
fs.mkdirSync(logDirectory, { recursive: true });

function writeLog(event) {
  fs.appendFileSync(logFile, `${JSON.stringify({ timestamp: new Date().toISOString(), ...event })}\n`);
}

function requestLogger(req, res, next) {
  const startedAt = Date.now();
  res.on('finish', () => writeLog({
    event: 'http_request',
    method: req.method,
    path: req.originalUrl,
    status: res.statusCode,
    duration_ms: Date.now() - startedAt,
    ip: req.ip
  }));
  next();
}

module.exports = { requestLogger, writeLog };
