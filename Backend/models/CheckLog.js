import { query } from "../db/pool.js";

class CheckLog {
  // Create check log entry
  static async create(monitorId, status, statusCode, responseMs, errorMessage) {
    await query(
      `INSERT INTO check_logs (monitor_id, status, status_code, response_ms, error_message)
       VALUES ($1, $2, $3, $4, $5)`,
      [monitorId, status, statusCode, responseMs, errorMessage],
    );
  }

  // Get recent logs for a monitor
  static async getByMonitorId(monitorId, limit = 200) {
    const { rows } = await query(
      `SELECT * FROM check_logs
       WHERE monitor_id=$1
       ORDER BY checked_at DESC LIMIT $2`,
      [monitorId, limit],
    );
    return rows;
  }

  // Get logs by date range
  static async getByDate(monitorId, date) {
    const { rows } = await query(
      `SELECT status, response_ms, checked_at
       FROM check_logs
       WHERE monitor_id=$1
         AND checked_at::DATE = $2::DATE`,
      [monitorId, date],
    );
    return rows;
  }

  // Get recent logs for checking consecutive failures
  static async getRecentLogs(monitorId, limit) {
    const { rows } = await query(
      `SELECT status FROM check_logs
       WHERE monitor_id=$1 ORDER BY checked_at DESC
       LIMIT $2`,
      [monitorId, limit],
    );
    return rows;
  }

  // Delete logs by date
  static async deleteByDate(monitorId, date) {
    const { rowCount } = await query(
      `DELETE FROM check_logs
       WHERE monitor_id=$1 AND checked_at::DATE = $2::DATE`,
      [monitorId, date],
    );
    return rowCount;
  }

  // Get last check status for all monitors (last 24h)
  static async getAllMonitorsOverview() {
    const { rows } = await query(`
      SELECT
        m.id, m.name, m.url, m.enabled,
        COUNT(cl.id) AS total_checks,
        SUM(CASE WHEN cl.status='up' THEN 1 ELSE 0 END) AS up_count,
        ROUND(AVG(cl.response_ms)) AS avg_response_ms,
        MAX(cl.checked_at) AS last_checked,
        (SELECT cl2.status FROM check_logs cl2
         WHERE cl2.monitor_id=m.id ORDER BY checked_at DESC LIMIT 1) AS current_status
      FROM monitors m
      LEFT JOIN check_logs cl ON cl.monitor_id=m.id
        AND cl.checked_at > NOW() - INTERVAL '24 hours'
      GROUP BY m.id
      ORDER BY m.created_at DESC
    `);
    return rows;
  }
}

export default CheckLog;
