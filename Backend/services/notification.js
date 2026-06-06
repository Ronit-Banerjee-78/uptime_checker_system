import nodemailer from 'nodemailer';
import axios from 'axios';
import { config } from '../config/index.js';

const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  auth: { user: config.smtp.user, pass: config.smtp.pass },
});

export async function sendOutageAlert(monitor, incident) {
  const subject = `🚨 Outage Detected: ${monitor.name}`;
  const body = `
    Monitor: ${monitor.name}
    URL: ${monitor.url}
    Status: ${incident.type.toUpperCase()}
    Detected at: ${new Date(incident.started_at).toUTCString()}
  `.trim();

  const promises = [];

  // Email
  if (config.smtp.alertEmail && config.smtp.user) {
    promises.push(
      transporter.sendMail({
        from: config.smtp.user,
        to: config.smtp.alertEmail,
        subject,
        text: body,
      }).catch(err => console.error('[Notify] Email error:', err.message))
    );
  }

  // Webhook (Slack / Discord / custom)
  if (config.webhookUrl) {
    promises.push(
      axios.post(config.webhookUrl, {
        text: `${subject}\n\n${body}`,
        embeds: [{
          title: subject,
          description: body,
          color: 0xff0000,
        }],
      }).catch(err => console.error('[Notify] Webhook error:', err.message))
    );
  }

  await Promise.allSettled(promises);
  console.log(`[Notify] Outage alert sent for "${monitor.name}"`);
}
