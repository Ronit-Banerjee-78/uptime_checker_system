import axios from "axios";
import dayjs from "dayjs";
import CheckLog from "../models/CheckLog.js";
import Incident from "../models/Incident.js";
import { config } from "../config/index.js";
import { sendOutageAlert } from "./notification.js";

// Perform a single URL check and persist the result
export async function checkUrl(monitor) {
  const start = Date.now();
  let status = "up";
  let statusCode = null;
  let responseMs = null;
  let errorMessage = null;

  try {
    const res = await axios.get(monitor.url, {
      timeout: config.app.outageThresholdMs,
      validateStatus: () => true, // accept any HTTP status
    });

    statusCode = res.status;
    responseMs = Date.now() - start;
    status = statusCode >= 200 && statusCode < 400 ? "up" : "down";
  } catch (err) {
    responseMs = Date.now() - start;
    if (err.code === "ECONNABORTED") {
      status = "timeout";
      errorMessage = "Request timed out";
    } else {
      status = "error";
      errorMessage = err.message;
    }
  }

  // Save check log
  await CheckLog.create(
    monitor.id,
    status,
    statusCode,
    responseMs,
    errorMessage,
  );

  // Handle incident tracking + notification
  await handleIncident(monitor, status);

  return { status, statusCode, responseMs, errorMessage };
}

// Opens/closes incidents and triggers alerts on consecutive failures
async function handleIncident(monitor, status) {
  const openIncident = await Incident.getOpenIncident(monitor.id);

  if (status !== "up") {
    if (!openIncident) {
      // Count recent consecutive fails
      const recentLogs = await CheckLog.getRecentLogs(
        monitor.id,
        config.app.consecutiveFailsForAlert,
      );

      const allFailing = recentLogs.every((r) => r.status !== "up");

      if (
        allFailing &&
        recentLogs.length >= config.app.consecutiveFailsForAlert
      ) {
        const incident = await Incident.create(monitor.id, status);
        await sendOutageAlert(monitor, incident);
        await Incident.markNotified(incident.id);
      }
    }
  } else if (openIncident) {
    // URL is back up — resolve incident
    await Incident.resolve(openIncident.id);
    console.log(`[✓] Monitor "${monitor.name}" is back UP`);
  }
}
