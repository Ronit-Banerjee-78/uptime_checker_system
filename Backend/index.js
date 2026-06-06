import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import cron from "node-cron";
import { config } from "./config/index.js";
import { runMigrations } from "./db/migrations.js";
import { startWorker, scheduleMonitors } from "./jobs/queue.js";
import { runDailySummary } from "./services/summary.js";
import logsRouter from "./routes/logs.js";
import userRoutes from "./routes/user.js";
import monitorRoutes from "./routes/monitors.js";
import errorHandler from "./middlewares/errorMiddlewares.js";

const app = express();

// ---------------- MIDDLEWARE ----------------
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

app.use(limiter);

// ---------------- ROUTES ----------------

app.use("/monitors", monitorRoutes);
app.use("/logs", logsRouter);
app.use("/user", userRoutes);
app.get("/check", (req, res) => {
  res.json({ message: "Welcome to the Uptime Checker API" });
});
// Health check
app.get("/health", (_, res) => {
  res.json({
    status: "ok",
    ts: new Date(),
  });
});

// 404 fallback
app.use((_, res) => {
  res.status(404).json({ error: "Not found" });
});

// Global Error Handler
app.use(errorHandler);

// ---------------- STARTUP ----------------
await runMigrations();

startWorker();
await scheduleMonitors();

cron.schedule("0 0 * * *", async () => {
  console.log("[Cron] Running daily summary job...");
  await runDailySummary();
});

app.listen(config.app.port, () => {
  console.log(`\n🚀 Server running on port ${config.app.port}`);
  console.log(`Check interval: ${config.app.checkIntervalSeconds}s`);
  console.log(`Outage threshold: ${config.app.outageThresholdMs}ms`);
  console.log(`Alert after fails: ${config.app.consecutiveFailsForAlert}\n`);
});
