import { Queue, Worker, QueueEvents } from "bullmq";
import { config } from "../config/index.js";
import { checkUrl } from "../services/checker.js";
import Monitor from "../models/Monitor.js";

const connection = {
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
};

export const checkQueue = new Queue("url-checks", { connection });

// Worker processes each check job
export function startWorker() {
  const worker = new Worker(
    "url-checks",
    async (job) => {
      const { monitor } = job.data;
      const result = await checkUrl(monitor);
      return result;
    },
    {
      connection,
      concurrency: 10, // check 10 URLs in parallel
    },
  );

  worker.on("completed", (job, result) => {
    console.log(
      `[✓] ${job.data.monitor.url} → ${result.status} (${result.responseMs}ms)`,
    );
  });

  worker.on("failed", (job, err) => {
    console.error(
      `[✗] Job failed for ${job?.data?.monitor?.url}:`,
      err.message,
    );
  });

  return worker;
}

// Schedule recurring check jobs for all active monitors
export async function scheduleMonitors() {
  const monitors = await Monitor.getActive();

  for (const monitor of monitors) {
    const jobId = `monitor-${monitor.id}`;

    // Remove old repeatable job if exists
    await checkQueue
      .removeRepeatable(jobId, {
        every: monitor.interval * 1000,
      })
      .catch(() => {});

    await checkQueue.add(
      jobId,
      { monitor },
      {
        repeat: { every: monitor.interval * 1000 },
        jobId,
        removeOnComplete: 50,
        removeOnFail: 20,
      },
    );

    console.log(
      `[Queue] Scheduled "${monitor.name}" every ${monitor.interval}s`,
    );
  }
}

// Add or update a single monitor's job
export async function upsertMonitorJob(monitor) {
  const jobId = `monitor-${monitor.id}`;
  await checkQueue
    .removeRepeatable(jobId, { every: monitor.interval * 1000 })
    .catch(() => {});

  if (monitor.enabled) {
    await checkQueue.add(
      jobId,
      { monitor },
      {
        repeat: { every: monitor.interval * 1000 },
        jobId,
        removeOnComplete: 50,
        removeOnFail: 20,
      },
    );
  }
}

// Remove a monitor's job entirely
export async function removeMonitorJob(monitorId, interval) {
  const jobId = `monitor-${monitorId}`;
  await checkQueue
    .removeRepeatable(jobId, { every: interval * 1000 })
    .catch(() => {});
}
