-- Datos ficticios y simplificados inspirados en Falcon Alerts; no es el esquema de CrowdStrike.
CREATE TABLE IF NOT EXISTS alerts (
  id VARCHAR(64) PRIMARY KEY,
  composite_id VARCHAR(128) NOT NULL UNIQUE,
  severity VARCHAR(10) NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  status VARCHAR(20) NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'closed')),
  tactic VARCHAR(100) NOT NULL,
  technique VARCHAR(100) NOT NULL,
  hostname VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  created_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alerts_created_timestamp ON alerts (created_timestamp);
CREATE INDEX IF NOT EXISTS idx_alerts_severity_status ON alerts (severity, status);

CREATE TABLE IF NOT EXISTS audit_log (
  id BIGSERIAL PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  action VARCHAR(100) NOT NULL,
  resource VARCHAR(255) NOT NULL,
  source_ip VARCHAR(100),
  details JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_log (timestamp DESC);
