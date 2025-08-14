// src/logger/logger.ts

import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

export const LogLevel = {
  none: "none",
  error: "error",
  info: "info",
  debug: "debug",
  all: "debug",
} as const;

export class Logger {
  private logger: winston.Logger;

  constructor() {
    const consoleTransport = new winston.transports.Console();
    const infoTransport = new DailyRotateFile({
      filename: "logs/info/%DATE%.info.log",
      level: "info",
      datePattern: "YYYY-MM-DD",
      maxFiles: "90d",
      // zippedArchive: true,
    });
    const errorTransport = new DailyRotateFile({
      filename: "logs/error/%DATE%.error.log",
      level: "error",
      datePattern: "YYYY-MM-DD",
      maxFiles: "90d",
      // zippedArchive: true,
    });
    const debugTransport = new DailyRotateFile({
      filename: "logs/debug/%DATE%.debug.log",
      level: "debug",
      datePattern: "YYYY-MM-DD",
      maxFiles: "90d",
      // zippedArchive: true,
    });

    this.logger = winston.createLogger({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ level, message, timestamp }) => {
          return `${timestamp} [${level.toUpperCase()}]: ${message}`;
        })
      ),
      defaultMeta: { service: "app-service" },
      transports: [
        consoleTransport,
        infoTransport,
        errorTransport,
        debugTransport,
      ],
    });
  }

  debug = (...args: unknown[]): void => {
    this.write(LogLevel.debug, ...args);
  };

  info = (...args: unknown[]): void => {
    this.write(LogLevel.info, ...args);
  };

  error = (...args: unknown[]): void => {
    this.write(LogLevel.error, ...args);
  };

  private write(level: keyof typeof LogLevel, ...args: unknown[]): void {
    try {
      const formattedArgsStr = args
        .map((arg) => {
          return typeof arg === "object"
            ? arg instanceof Error
              ? `${
                  arg.stack
                    ? `${arg.name} - ${arg.message} Stack: ${arg.stack}`
                    : `${arg.name} - ${arg.message}`
                }${arg.cause ? `Cause: ${JSON.stringify(arg.cause)}` : ""}`
              : JSON.stringify(arg)
            : arg;
        })
        .join(" ");

      switch (level) {
        case "error":
          this.logger.error(formattedArgsStr);
          break;
        case "debug":
          this.logger.debug(formattedArgsStr);
          break;
        default:
          this.logger.info(formattedArgsStr);
          break;
      }
    } catch (err) {
      console.log("Logger Error: ", err);
      console.log(...args);
    }
  }
}

export function createLogger(): Logger {
  return new Logger();
}
