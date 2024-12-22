//------ Intialize log file configuration ------

import winston from "winston";
import appRoot from "app-root-path";
import "winston-daily-rotate-file";
const logger = winston.createLogger({
  transports: [
    new winston.transports.DailyRotateFile({
      filename: "log-%DATE%.log",
      datePattern: "DD-MM-YYYY",
      dirname: `${appRoot}/logs/`,
      level: "info",
      handleExceptions: true,
      json: false,
      zippedArchive: true,
      maxSize: "50m",
      maxFiles: "1d",
      auditFile: `${appRoot}/logs/info-audit.json`,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ level, message, timestamp }) => {
          return JSON.stringify({
            level,
            message,
            timestamp,
          });
        })
      ),
    }),
  ],
  exitOnError: false,
});

logger.stream = {
  write: function (message, encoding) {
    logger.info(message);
  },
};

export default logger;
