import { query } from "../db/pool.js";

class Monitor {
  // Get all monitors
  static async getAll() {
    const { rows } = await query(
      `SELECT * FROM monitors ORDER BY created_at DESC`,
    );
    return rows;
  }

  // Get monitor by ID
  static async getById(id) {
    const {
      rows: [monitor],
    } = await query(`SELECT * FROM monitors WHERE id=$1`, [id]);
    return monitor;
  }

  // Create new monitor
  static async create(name, url, interval = 60) {
    const {
      rows: [monitor],
    } = await query(
      `INSERT INTO monitors (name, url, interval) VALUES ($1, $2, $3) RETURNING *`,
      [name, url, interval],
    );
    return monitor;
  }

  // Update monitor
  static async update(id, name, url, interval, enabled) {
    const {
      rows: [monitor],
    } = await query(
      `UPDATE monitors SET
         name=COALESCE($1,name),
         url=COALESCE($2,url),
         interval=COALESCE($3,interval),
         enabled=COALESCE($4,enabled)
       WHERE id=$5 RETURNING *`,
      [name, url, interval, enabled, id],
    );
    return monitor;
  }

  // Delete monitor
  static async delete(id) {
    const {
      rows: [monitor],
    } = await query(`DELETE FROM monitors WHERE id=$1 RETURNING *`, [id]);
    return monitor;
  }

  // Get all enabled monitors
  static async getActive() {
    const { rows: monitors } = await query(
      `SELECT * FROM monitors WHERE enabled=TRUE`,
    );
    return monitors;
  }
  static async getMonitorsByUserId(userId) {
    const { rows: monitors } = await query(
      `SELECT * FROM monitors WHERE user_id=$1 ORDER BY created_at DESC`,
      [userId],
    );
    return monitors;
  }
  static async getUserByMonitorId(monitorId) {
    const {
      rows: [user],
    } = await query(
      `SELECT users.* FROM users
       JOIN monitors ON monitors.user_id = users.id
       WHERE monitors.id = $1`,
      [monitorId],
    );
    return user;
  }
}

export default Monitor;
