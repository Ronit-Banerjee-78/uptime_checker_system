import { query } from "../db/pool.js";

class DailySummary {
  // Create or update daily summary
  static async upsert(
    monitorId,
    date,
    total,
    upCount,
    downCount,
    avg,
    min,
    max,
    uptimePct,
    incidents,
  ) {
    await query(
      `INSERT INTO daily_summaries
         (monitor_id, summary_date, total_checks, up_count, down_count,
          avg_response_ms, min_response_ms, max_response_ms, uptime_pct, incidents)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       ON CONFLICT (monitor_id, summary_date) DO UPDATE SET
         total_checks=EXCLUDED.total_checks,
         up_count=EXCLUDED.up_count,
         down_count=EXCLUDED.down_count,
         avg_response_ms=EXCLUDED.avg_response_ms,
         min_response_ms=EXCLUDED.min_response_ms,
         max_response_ms=EXCLUDED.max_response_ms,
         uptime_pct=EXCLUDED.uptime_pct,
         incidents=EXCLUDED.incidents`,
      [
        monitorId,
        date,
        total,
        upCount,
        downCount,
        avg,
        min,
        max,
        uptimePct,
        JSON.stringify(incidents),
      ],
    );
  }

  // Get summaries for a monitor
  static async getByMonitorId(monitorId, days = 30) {
    const { rows } = await query(
      `SELECT * FROM daily_summaries
       WHERE monitor_id=$1
         AND summary_date >= NOW() - INTERVAL '${parseInt(days)} days'
       ORDER BY summary_date DESC`,
      [monitorId],
    );
    return rows;
  }
}

export default DailySummary;
