### Data Flow

```
Cron / API add monitor
      ↓
BullMQ repeating job (per monitor interval)
      ↓
Worker → checker.js → axios GET URL
      ↓
Save to check_logs (PostgreSQL)
      ↓
Consecutive failures? → Open incident + send alert
URL back up?          → Close incident
      ↓
Midnight cron → summary.js
      ↓
Aggregate check_logs → daily_summaries
Purge raw check_logs (24h old)
```

---

## Database Tables

| Table             | Purpose                                     |
| ----------------- | ------------------------------------------- |
| `monitors`        | URLs to watch, interval, enabled flag       |
| `check_logs`      | Raw per-check results (purged after 24h)    |
| `daily_summaries` | Aggregated daily stats kept permanently     |
| `incidents`       | Outage events with start/resolve timestamps |

---

## Setup

### 1. Prerequisites

- Node.js 18+
- PostgreSQL running
- Redis running (for BullMQ)

### 2. Install

```bash
npm install
cp .env.example .env
# Edit .env with your DB, Redis, SMTP credentials
```

### 3. Run

```bash
npm start          # production
npm run dev        # with file watching
```

---

## API Endpoints

### Monitors

| Method | Path          | Description       |
| ------ | ------------- | ----------------- |
| GET    | /monitors     | List all monitors |
| POST   | /monitors     | Add a new monitor |
| PATCH  | /monitors/:id | Update monitor    |
| DELETE | /monitors/:id | Remove monitor    |

**POST /monitors body:**

```json
{
  "name": "My Site",
  "url": "https://example.com",
  "interval": 60
}
```

### Logs

| Method | Path                       | Description                       |
| ------ | -------------------------- | --------------------------------- |
| GET    | /logs/overview/all         | 24h stats for all monitors        |
| GET    | /logs/:monitorId           | Last 200 raw check logs           |
| GET    | /logs/:monitorId/summary   | Daily summaries (default 30 days) |
| GET    | /logs/:monitorId/incidents | Incident history                  |

---

## Configuration (.env)

| Key                           | Default | Description                          |
| ----------------------------- | ------- | ------------------------------------ |
| `DB_*`                        | —       | PostgreSQL connection                |
| `REDIS_*`                     | —       | Redis connection (for BullMQ)        |
| `CHECK_INTERVAL_SECONDS`      | 60      | Default check frequency per monitor  |
| `OUTAGE_THRESHOLD_MS`         | 5000    | Timeout before marking as down       |
| `CONSECUTIVE_FAILS_FOR_ALERT` | 2       | Failures needed before sending alert |
| `SMTP_*`                      | —       | Gmail/SMTP credentials               |
| `ALERT_EMAIL`                 | —       | Where outage emails are sent         |
| `WEBHOOK_URL`                 | —       | Slack/Discord webhook (optional)     |

---

## Key Libraries

| Library      | Purpose                              |
| ------------ | ------------------------------------ |
| `bullmq`     | Distributed job queue for URL checks |
| `ioredis`    | Redis client (required by BullMQ)    |
| `axios`      | HTTP requests with timeout support   |
| `pg`         | PostgreSQL client                    |
| `nodemailer` | SMTP email notifications             |
| `node-cron`  | Midnight cron for daily summaries    |
| `dayjs`      | Date manipulation                    |
| `express`    | REST API server                      |
