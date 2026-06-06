import { Router } from "express";
import MonitorController from "../controllers/MonitorController.js";
import authenticate from "../middlewares/authMiddlewares.js";

const router = Router();

// GET /monitors — list all
router.get("/", MonitorController.getAll);

// POST /monitors — create
router.post("/", MonitorController.create);

// PATCH /monitors/:id — update
router.patch("/:id", MonitorController.update);

// DELETE /monitors/:id
router.delete("/:id", MonitorController.delete);
router.get("/:id", authenticate, MonitorController.getMonitorByUser);

export default router;
