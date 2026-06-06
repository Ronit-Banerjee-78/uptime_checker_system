import { query } from "./pool.js";

export async function runMigrations() {
  //users tables

  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id          SERIAL UNIQUE PRIMARY KEY,
      name        TEXT NOT NULL,
      email       TEXT UNIQUE NOT NULL,
      password    TEXT NOT NULL,
      created_at  TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // Monitored URLs
  await query(`
    CREATE TABLE IF NOT EXISTS monitors (
      id          SERIAL PRIMARY KEY,
      name        TEXT NOT NULL,
      url         TEXT NOT NULL ,
      user_id     INTEGER REFERENCES users(id) ON DELETE CASCADE,
      interval    INTEGER NOT NULL DEFAULT 60,   -- seconds
      enabled     BOOLEAN NOT NULL DEFAULT TRUE,
      created_at  TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS check_logs (
      id              SERIAL PRIMARY KEY,
      monitor_id      INTEGER REFERENCES monitors(id) ON DELETE CASCADE,
      checked_at      TIMESTAMPTZ DEFAULT NOW(),
      status          TEXT NOT NULL,           -- 'up' | 'down' | 'timeout' | 'error'
      status_code     INTEGER,
      response_ms     INTEGER,
      error_message   TEXT
    );
  `);

  // Index for fast time-based queries
  await query(`
    CREATE INDEX IF NOT EXISTS idx_monitors_user
    ON monitors(user_id);
  `);
  await query(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_check_logs_monitor_time
    ON check_logs(monitor_id, checked_at DESC);
  `);

  // Daily summary table — one row per monitor per day
  await query(`
    CREATE TABLE IF NOT EXISTS daily_summaries (
      id SERIAL PRIMARY KEY,
  monitor_id INTEGER REFERENCES monitors(id) ON DELETE CASCADE,
  summary_date DATE NOT NULL,
  total_checks INTEGER DEFAULT 0,
  up_count INTEGER DEFAULT 0,
  down_count INTEGER DEFAULT 0,
  avg_response_ms INTEGER,
  min_response_ms INTEGER,
  max_response_ms INTEGER,
  uptime_pct NUMERIC(5,2),
  incidents JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(monitor_id, summary_date)
    );
  `);

  // Outage incidents (for notifications + tracking)
  await query(`
    CREATE TABLE IF NOT EXISTS incidents (
     id SERIAL PRIMARY KEY,
  monitor_id INTEGER REFERENCES monitors(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  type TEXT CHECK (type IN ('down','timeout','error')),
  notified BOOLEAN DEFAULT FALSE
    );
  `);

  console.log("[DB] Migrations complete");
}
