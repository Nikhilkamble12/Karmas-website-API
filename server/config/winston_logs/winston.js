import winston from "winston";
import "winston-daily-rotate-file";
import appRoot from "app-root-path";
import path from "path";

// -----------------------------------------------------------------------------
// 1. Constants: Emojis & Levels
// -----------------------------------------------------------------------------
const LOG_LEVELS = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
  },
  colors: {
    error: "red",
    warn: "yellow",
    info: "green",
    http: "magenta",
    debug: "blue",
  },
};

const EMOJIS = {
  error: "❌",
  warn: "⚠️",
  info: "🚀",
  http: "🌐",
  debug: "🐛",
};

// -----------------------------------------------------------------------------
// 2. Helper: Stack Trace Parser (Deep Details)
// -----------------------------------------------------------------------------
/**
 * Captures the file, line number, and function name that called the logger.
 */
const getCallerInfo = () => {
  const stackTrace = new Error().stack;
  if (!stackTrace) return { filename: "unknown", line: "0", func: "anonymous" };

  const stackLines = stackTrace.split("\n");

  // Find the first line that is NOT inside node_modules and NOT this logger file itself
  const callerLine = stackLines.find((line) => {
    return (
      line.includes(appRoot) &&
      !line.includes("node_modules") &&
      !line.includes("logger.js") // Adjust this string if you rename this file!
    );
  });

  if (!callerLine) {
    return { filename: "unknown", line: "0", func: "anonymous" };
  }

  // Regex to extract details: "at functionName (path/to/file.js:line:column)"
  // or "at path/to/file.js:line:column"
  const traceRegex = /at\s+(?:(.+?)\s+\()?(?:.+?)\/([^/]+?):(\d+):(\d+)\)?/;
  const match = callerLine.match(traceRegex);

  if (match) {
    return {
      func: match[1] || "anonymous", // Function name
      filename: match[2],            // File name
      line: match[3],                // Line number
    };
  }

  return { filename: "unknown", line: "0", func: "unknown" };
};

// -----------------------------------------------------------------------------
// 3. Formats: Injecting Details & Customizing Output
// -----------------------------------------------------------------------------

// Inject file/line info into the log object
const appendTraceInfo = winston.format((info) => {
  const { filename, line, func } = getCallerInfo();
  info.originFile = filename;
  info.originLine = line;
  info.originFunc = func;
  return info;
});

// Format for Log Files (Structured JSON)
const fileFormat = winston.format.combine(
  appendTraceInfo(),
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf(({ level, message, timestamp, originFile, originLine, originFunc }) => {
    const emoji = EMOJIS[level] || "📝";
    return JSON.stringify({
      timestamp,
      level: level.toUpperCase(),
      emoji,
      message,
      location: `${originFile}:${originLine} (${originFunc})`
    });
  })
);

// Format for Console (Colorful & Human Readable)
const consoleFormat = winston.format.combine(
  appendTraceInfo(),
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: "HH:mm:ss" }),
  winston.format.printf(({ level, message, timestamp, originFile, originLine }) => {
    const emoji = EMOJIS[level] || "";
    // Output: 10:30:00 🚀 info: [authController.js:45] User logged in
    return `${timestamp} ${emoji} ${level}: \x1b[36m[${originFile}:${originLine}]\x1b[0m ${message}`;
  })
);

// -----------------------------------------------------------------------------
// 4. Logger Initialization
// -----------------------------------------------------------------------------

// Add colors to winston
winston.addColors(LOG_LEVELS.colors);

const logger = winston.createLogger({
  levels: LOG_LEVELS.levels,
  transports: [
    // A. Daily Rotate File (Info & above)
    new winston.transports.DailyRotateFile({
      filename: "app-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      dirname: `${appRoot}/logs/`,
      level: "info",
      handleExceptions: true,
      maxSize: "20m",
      maxFiles: "14d",
      format: fileFormat,
      zippedArchive: true,
    }),

    // B. Error Log (Errors only) - Keeps critical issues separate
    new winston.transports.DailyRotateFile({
      filename: "error-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      dirname: `${appRoot}/logs/errors/`,
      level: "error",
      handleExceptions: true,
      maxSize: "20m",
      maxFiles: "30d",
      format: fileFormat,
    }),
  ],
  exitOnError: false,
});

// C. Console Transport (Only for non-production environments)
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: consoleFormat,
      level: "debug",
    })
  );
}

// Support for Morgan stream
logger.stream = {
  write: function (message) {
    logger.http(message.trim());
  },
};

export default logger;