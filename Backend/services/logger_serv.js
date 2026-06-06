import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: "YYYY-MM-DD HH:mm:ss",
  }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    return `${timestamp} [${level.toUpperCase()}]: ${stack || message}`;
  }),
);

const logger = winston.createLogger({
  level: "info",

  transports: [
    // Console logging
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), logFormat),
    }),

    // Error file
    new DailyRotateFile({
      filename: "logs/error-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      level: "error",
      maxSize: "20m",
      maxFiles: "14d",
    }),

    // Combined file
    new DailyRotateFile({
      filename: "logs/combined-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      maxSize: "20m",
      maxFiles: "14d",
    }),
  ],
});

export default logger;
