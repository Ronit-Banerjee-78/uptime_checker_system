import 'dotenv/config';

export const config = {
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'uptime_checker',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
  },
  app: {
    port: Number(process.env.PORT) || 3000,
    checkIntervalSeconds: Number(process.env.CHECK_INTERVAL_SECONDS) || 60,
    outageThresholdMs: Number(process.env.OUTAGE_THRESHOLD_MS) || 5000,
    consecutiveFailsForAlert: Number(process.env.CONSECUTIVE_FAILS_FOR_ALERT) || 2,
  },
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    alertEmail: process.env.ALERT_EMAIL || '',
  },
  webhookUrl: process.env.WEBHOOK_URL || '',
};
