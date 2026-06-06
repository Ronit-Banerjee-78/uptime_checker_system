import { query } from "../db/pool.js";

class Incident {
  // Get open incident for a monitor
  static async getOpenIncident(monitorId) {
    const {
      rows: [incident],
    } = await query(
      `SELECT * FROM incidents WHERE monitor_id=$1 AND resolved_at IS NULL LIMIT 1`,
      [monitorId],
    );
    return incident;
  }

  // Create new incident
  static async create(monitorId, type) {
    const {
      rows: [incident],
    } = await query(
      `INSERT INTO incidents (monitor_id, type) VALUES ($1, $2) RETURNING *`,
      [monitorId, type],
    );
    return incident;
  }

  // Update incident to mark as notified
  static async markNotified(incidentId) {
    await query(`UPDATE incidents SET notified=TRUE WHERE id=$1`, [incidentId]);
  }

  // Close incident
  static async resolve(incidentId) {
    await query(`UPDATE incidents SET resolved_at=NOW() WHERE id=$1`, [
      incidentId,
    ]);
  }

  // Get incidents by date
  static async getByDate(monitorId, date) {
    const { rows } = await query(
      `SELECT type, started_at, resolved_at
       FROM incidents
       WHERE monitor_id=$1
         AND started_at::DATE = $2::DATE`,
      [monitorId, date],
    );
    return rows;
  }

  // Get incident history
  static async getByMonitorId(monitorId, limit = 50) {
    const { rows } = await query(
      `SELECT * FROM incidents
       WHERE monitor_id=$1
       ORDER BY started_at DESC LIMIT $2`,
      [monitorId, limit],
    );
    return rows;
  }
}

export default Incident;
