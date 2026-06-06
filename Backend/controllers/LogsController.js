import CheckLog from "../models/CheckLog.js";
import Incident from "../models/Incident.js";
import DailySummary from "../models/DailySummary.js";

class LogsController {
  // GET /logs/:monitorId — recent check logs (last 200)
  static async getCheckLogs(req, res, next) {
    try {
      const logs = await CheckLog.getByMonitorId(req.params.monitorId, 200);
      res.json(logs);
    } catch (err) {
      next(err);
      console.error("[Error] Getting check logs:", err.message);
      res.status(500).json({ error: "Failed to fetch check logs" });
    }
  }

  // GET /logs/:monitorId/summary — daily summaries
  static async getDailySummaries(req, res, next) {
    try {
      const { days = 30 } = req.query;
      const summaries = await DailySummary.getByMonitorId(
        req.params.monitorId,
        days,
      );
      res.json(summaries);
    } catch (err) {
      next(err);
      console.error("[Error] Getting daily summaries:", err.message);
      res.status(500).json({ error: "Failed to fetch summaries" });
    }
  }

  // GET /logs/:monitorId/incidents — incident history
  static async getIncidents(req, res, next) {
    try {
      const incidents = await Incident.getByMonitorId(req.params.monitorId, 50);
      res.json(incidents);
    } catch (err) {
      next(err);
      console.error("[Error] Getting incidents:", err.message);
      res.status(500).json({ error: "Failed to fetch incidents" });
    }
  }

  // GET /logs/overview/all — uptime stats for all monitors (last 24h)
  static async getOverview(req, res, next) {
    try {
      const overview = await CheckLog.getAllMonitorsOverview();
      res.json(overview);
    } catch (err) {
      next(err);
      console.error("[Error] Getting overview:", err.message);
      res.status(500).json({ error: "Failed to fetch overview" });
    }
  }
}

export default LogsController;
