import dayjs from "dayjs";
import Monitor from "../models/Monitor.js";
import CheckLog from "../models/CheckLog.js";
import DailySummary from "../models/DailySummary.js";
import Incident from "../models/Incident.js";

// Called by cron every 24h — builds summary then deletes raw logs
export async function runDailySummary() {
  const yesterday = dayjs().subtract(1, "day").format("YYYY-MM-DD");
  console.log(`[Summary] Running daily summary for ${yesterday}`);

  const monitors = await Monitor.getAll();

  for (const monitor of monitors) {
    await buildSummary(monitor.id, yesterday);
    await purgeLogs(monitor.id, yesterday);
  }

  console.log("[Summary] Daily summary complete, old logs purged");
}

async function buildSummary(monitorId, date) {
  const rows = await CheckLog.getByDate(monitorId, date);

  if (!rows.length) return;

  const total = rows.length;
  const upCount = rows.filter((r) => r.status === "up").length;
  const downCount = total - upCount;
  const responseTimes = rows
    .filter((r) => r.response_ms)
    .map((r) => r.response_ms);

  const avg = responseTimes.length
    ? Math.round(
        responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length,
      )
    : null;
  const min = responseTimes.length ? Math.min(...responseTimes) : null;
  const max = responseTimes.length ? Math.max(...responseTimes) : null;
  const uptimePct = ((upCount / total) * 100).toFixed(2);

  // Collect incidents for the day
  const incidents = await Incident.getByDate(monitorId, date);

  const incidentSummary = incidents.map((i) => ({
    type: i.type,
    start: i.started_at,
    end: i.resolved_at,
    duration_s: i.resolved_at
      ? Math.round((new Date(i.resolved_at) - new Date(i.started_at)) / 1000)
      : null,
  }));

  await DailySummary.upsert(
    monitorId,
    date,
    total,
    upCount,
    downCount,
    avg,
    min,
    max,
    uptimePct,
    incidentSummary,
  );

  console.log(
    `[Summary] Monitor ${monitorId} — ${uptimePct}% uptime on ${date}`,
  );
}

async function purgeLogs(monitorId, date) {
  const rowCount = await CheckLog.deleteByDate(monitorId, date);
  console.log(
    `[Summary] Purged ${rowCount} logs for monitor ${monitorId} on ${date}`,
  );
}
