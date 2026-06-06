import { Router } from "express";
import LogsController from "../controllers/LogsController.js";

const router = Router();

// GET /logs/:monitorId — recent check logs (last 200)
router.get("/:monitorId", (req, res) => LogsController.getCheckLogs(req, res));

// GET /logs/:monitorId/summary — daily summaries
router.get("/:monitorId/summary", (req, res) =>
  LogsController.getDailySummaries(req, res),
);

// GET /logs/:monitorId/incidents — incident history
router.get("/:monitorId/incidents", (req, res) =>
  LogsController.getIncidents(req, res),
);

// GET /logs/overview/all — uptime stats for all monitors (last 24h)
router.get("/overview/all", (req, res) => LogsController.getOverview(req, res));

export default router;
