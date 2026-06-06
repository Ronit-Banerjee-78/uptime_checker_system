import Monitor from "../models/Monitor.js";
import { upsertMonitorJob, removeMonitorJob } from "../jobs/queue.js";

class MonitorController {
  // GET /monitors — list all
  static async getAll(req, res, next) {
    try {
      const monitors = await Monitor.getAll();
      res.json(monitors);
    } catch (err) {
      next(err);

      console.error("[Error] Getting monitors:", err.message);
      res.status(500).json({ error: "Failed to fetch monitors" });
    }
  }

  // POST /monitors — create new monitor
  static async create(req, res, next) {
    try {
      const { name, url, interval = 60 } = req.body;

      if (!name || !url) {
        return res.status(400).json({ error: "name and url required" });
      }

      const monitor = await Monitor.create(name, url, interval);
      await upsertMonitorJob(monitor);

      res.status(201).json(monitor);
    } catch (err) {
      next(err);
      console.error("[Error] Creating monitor:", err.message);
      res.status(500).json({ error: "Failed to create monitor" });
    }
  }

  // PATCH /monitors/:id — update monitor
  static async update(req, res, next) {
    try {
      const { name, url, interval, enabled } = req.body;
      const monitor = await Monitor.update(
        req.params.id,
        name,
        url,
        interval,
        enabled,
      );

      if (!monitor) {
        return res.status(404).json({ error: "Not found" });
      }

      await upsertMonitorJob(monitor);
      res.json(monitor);
    } catch (err) {
      next(err);
      console.error("[Error] Updating monitor:", err.message);
      res.status(500).json({ error: "Failed to update monitor" });
    }
  }

  // DELETE /monitors/:id — delete monitor
  static async delete(req, res, next) {
    try {
      const monitor = await Monitor.delete(req.params.id);

      if (!monitor) {
        return res.status(404).json({ error: "Not found" });
      }

      await removeMonitorJob(monitor.id, monitor.interval);
      res.json({ deleted: true });
    } catch (err) {
      next(err);
      console.error("[Error] Deleting monitor:", err.message);
      res.status(500).json({ error: "Failed to delete monitor" });
    }
  }

  static async getMonitorByUser(req, res, next) {
    const userId = req.params.userId;
    try {
      const monitors = await Monitor.getMonitorsByUserId(userId);
      res.status(200).json(monitors);
    } catch (err) {
      next(err);
      console.error("[Error] Getting monitors by user:", err.message);
      res.status(500).json({ error: "Failed to fetch monitors for user" });
    }
  }
}

export default MonitorController;
