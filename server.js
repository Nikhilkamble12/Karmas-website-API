// this represent .env file
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import cluster from "cluster";
import helmet from "helmet";
import cors from "cors";
import logger from "./server/config/winston_logs/winston.js";
import consoleLogger from "./server/utils/helper/logger.js";
import { readdirSync, statSync } from "fs";
import { join, dirname, resolve } from "path";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import commonResponse from "./server/utils/helper/response.js";
import responseCode from "./server/utils/constants/code/http.status.code.js";
import encrypt from "./server/utils/security/encryption.js";
import decrypt from "./server/utils/security/decryption.js";
import startCluster from "./server/utils/helper/cluster.js";
import https from "https";
import fs from "fs";
import setupWebSocket from "./websocket.config.js";

// ============================================================================
// PERFORMANCE TIMER UTILITY
// ============================================================================
class PerformanceTimer {
  constructor() {
    this.timers = new Map();
    this.startTime = performance.now();
  }

  start(label) {
    this.timers.set(label, performance.now());
  }

  end(label) {
    const startTime = this.timers.get(label);
    if (!startTime) {
      console.warn(`⚠️  Timer "${label}" was never started`);
      return 0;
    }
    const duration = performance.now() - startTime;
    this.timers.delete(label);
    return duration;
  }

  log(label, icon = "⏱️") {
    const duration = this.end(label);
    const formatted =
      duration < 1000
        ? `${duration.toFixed(2)}ms`
        : `${(duration / 1000).toFixed(2)}s`;
    console.log(`${icon} ${label}: ${formatted}`);
    return duration;
  }

  getTotalTime() {
    return performance.now() - this.startTime;
  }

  logTotal() {
    const total = this.getTotalTime();
    const formatted =
      total < 1000 ? `${total.toFixed(2)}ms` : `${(total / 1000).toFixed(2)}s`;
    console.log(`\n${"=".repeat(60)}`);
    console.log(`🎯 TOTAL STARTUP TIME: ${formatted}`);
    console.log(`${"=".repeat(60)}\n`);
    return total;
  }
}

const timer = new PerformanceTimer();

// ============================================================================
// ENVIRONMENT & CONFIG
// ============================================================================
timer.start("env-config");
dotenv.config();

const DEBUG_MODE = process.env.DEBUG_MODE === "true";
const ENABLE_ENCRYPTION = process.env.ENABLE_ENCRYPTION === "true";
const ENABLE_REQUEST_LOGGING = process.env.ENABLE_REQUEST_LOGGING !== "false";
const PORT = parseInt(process.env.PORT) || 3000;

timer.log("env-config", "⚙️");

// ============================================================================
// OPTIMIZED ROUTE LOADER WITH PARALLEL PROCESSING
// ============================================================================
class FastRouteLoader {
  constructor() {
    this.loadedCount = 0;
    this.failedCount = 0;
    this.routeCache = null;
    this.moduleCache = new Map();
  }

  walkSync(dirs, useCache = true) {
    if (useCache && this.routeCache) {
      if (DEBUG_MODE) console.log("📦 Using cached route paths");
      return this.routeCache;
    }

    const allFiles = [];
    const stack = [...dirs];

    while (stack.length > 0) {
      const dir = stack.pop();
      const normalizedDir = resolve(dir);

      try {
        const entries = readdirSync(normalizedDir, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = join(normalizedDir, entry.name);

          if (entry.isDirectory()) {
            stack.push(fullPath);
          } else if (entry.name.endsWith(".route.js")) {
            allFiles.push({
              path: fullPath,
              url: pathToFileURL(fullPath).href,
              name: entry.name,
            });
          }
        }
      } catch (err) {
        console.error(
          `❌ Error reading directory: ${normalizedDir}`,
          err.message
        );
        logger.error(`Error reading directory: ${normalizedDir}`, err);
      }
    }

    this.routeCache = allFiles;
    return allFiles;
  }

  async loadRoutes(app, routeFiles) {
    console.log(`\n📦 Loading ${routeFiles.length} routes...`);
    const startTime = Date.now();

    // Load all routes in parallel
    const results = await Promise.allSettled(
      routeFiles.map((route) => this.loadSingleRoute(app, route))
    );

    results.forEach((result, index) => {
      if (result.status === "fulfilled" && result.value) {
        this.loadedCount++;
      } else {
        this.failedCount++;
        const route = routeFiles[index];
        console.error(`❌ Failed: ${route.name}`);
        logger.error(`Failed to load route: ${route.url}`, result.reason);
      }
    });

    const duration = Date.now() - startTime;
    console.log(
      `✅ Routes loaded: ${this.loadedCount}/${routeFiles.length} (${duration}ms)`
    );

    if (this.failedCount > 0) {
      console.log(`⚠️  Failed routes: ${this.failedCount}`);
    }

    return { loaded: this.loadedCount, failed: this.failedCount, duration };
  }

  async loadSingleRoute(app, routeInfo) {
    try {
      if (this.moduleCache.has(routeInfo.path)) {
        const cachedModule = this.moduleCache.get(routeInfo.path);
        app.use(cachedModule);
        return true;
      }

      const { default: routeModule } = await import(routeInfo.url);

      if (typeof routeModule !== "function") {
        throw new Error(`Route does not export a function`);
      }

      app.use(routeModule);
      this.moduleCache.set(routeInfo.path, routeModule);

      if (DEBUG_MODE) {
        console.log(`  ✓ ${routeInfo.name}`);
      }

      return true;
    } catch (error) {
      throw new Error(`${routeInfo.name}: ${error.message}`);
    }
  }

  getStats() {
    return {
      total: this.routeCache?.length || 0,
      loaded: this.loadedCount,
      failed: this.failedCount,
      cached: this.moduleCache.size,
    };
  }

  clearCache() {
    this.routeCache = null;
    this.moduleCache.clear();
    console.log("🗑️  Route cache cleared");
  }
}

const routeLoader = new FastRouteLoader();

// ============================================================================
// OPTIMIZED ENCRYPTION/DECRYPTION MIDDLEWARE
// ============================================================================
const encryptionMiddleware = () => {
  if (!ENABLE_ENCRYPTION) {
    return (req, res, next) => next(); // Skip if disabled
  }

  return (req, res, next) => {
    // Skip encryption for specific endpoints
    const skipPaths = ["/api/v1/decrypt", "/api/v1/encrypt", "/", "/health"];
    if (skipPaths.includes(req.path)) {
      return next();
    }

    // ✅ Encrypt responses (except GET/DELETE)
    if (req.method !== "GET" && req.method !== "DELETE") {
      const originalSend = res.send;
      res.send = function (data) {
        try {
          const encryptedData = encrypt(data);
          res.setHeader("Content-Type", "application/json");
          originalSend.call(this, JSON.stringify(encryptedData));
        } catch (err) {
          logger.error("Encryption error:", err);
          originalSend.call(this, data); // Fallback to unencrypted
        }
      };
    }

    next();
  };
};

const decryptionMiddleware = () => {
  if (!ENABLE_ENCRYPTION) {
    return (req, res, next) => next(); // Skip if disabled
  }

  return (req, res, next) => {
    // Skip decryption for specific endpoints and methods
    const skipPaths = ["/api/v1/decrypt", "/api/v1/encrypt"];
    if (
      skipPaths.includes(req.path) ||
      req.method === "GET" ||
      req.method === "DELETE"
    ) {
      return next();
    }

    // Skip for multipart/form-data
    if (req.is("multipart/form-data")) {
      return next();
    }

    // ✅ Decrypt request body
    try {
      if (req.body && req.body.reqBody) {
        const decryptedData = decrypt(req.body.reqBody);
        req.body = decryptedData;
      } else if (req.body && !req.body.reqBody) {
        return res
          .status(400)
          .json(commonResponse(400, "Body required!", null, true));
      }
    } catch (err) {
      logger.error("Decryption error:", err);
      return res
        .status(400)
        .json(commonResponse(400, "Invalid encrypted data", null, true));
    }

    next();
  };
};

// ============================================================================
// EXPRESS APP INITIALIZATION
// ============================================================================
timer.start("express-setup");

const app = express();

// ✅ WebSocket upgrade optimization
app.use((req, res, next) => {
  if (req.headers.upgrade?.toLowerCase() === "websocket") {
    return; // Skip all middleware for WebSocket upgrades
  }
  next();
});

// ✅ Security middleware (cached configuration)
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: false, // Configure as needed
  })
);

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ Request logging (conditional)
if (ENABLE_REQUEST_LOGGING) {
  app.use(morgan("dev"));
}

// ✅ Body parsers with optimized limits
app.use(
  express.json({
    limit: process.env.JSON_LIMIT || "10mb", // ✅ Reduced from 100mb for better performance
    strict: true,
  })
);

app.use(
  express.urlencoded({
    limit: process.env.URLENCODED_LIMIT || "10mb",
    extended: true,
    parameterLimit: 1000, // ✅ More reasonable than MAX_SAFE_INTEGER
  })
);

// ✅ Static files with caching
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(
  "/resources",
  express.static(path.resolve(__dirname, "server", "resources"), {
    maxAge: process.env.NODE_ENV === "production" ? "1d" : 0, // Cache in production
    etag: true,
    lastModified: true,
  })
);

// ✅ Encryption/Decryption middleware
if (ENABLE_ENCRYPTION) {
  app.use(decryptionMiddleware());
  app.use(encryptionMiddleware());
  console.log("🔐 Encryption/Decryption enabled");
}

// ✅ Debug middleware (conditional)
if (DEBUG_MODE) {
  console.log("🐛 DEBUG_MODE enabled");
  app.use((req, res, next) => {
    const requestId = Math.random().toString(36).substring(7);
    const startTime = performance.now();

    console.log(`\n[${requestId}] ${req.method} ${req.originalUrl}`);
    if (req.body && Object.keys(req.body).length > 0) {
      console.log(`  Body:`, req.body);
    }

    res.on("finish", () => {
      const duration = performance.now() - startTime;
      console.log(
        `[${requestId}] ← ${res.statusCode} (${duration.toFixed(2)}ms)`
      );
    });

    next();
  });
}

// ✅ Security headers
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  next();
});

timer.log("express-setup", "⚡");

// ============================================================================
// BASIC ROUTES
// ============================================================================
app.get("/", (req, res) => {
  const workerId = cluster.worker ? cluster.worker.id : "Master";
  res.json({
    message: `Welcome to Massom from Worker ${workerId}`,
    version: process.env.APP_VERSION || "1.0.0",
    environment: process.env.NODE_ENV || "development",
  });
});

app.get("/health", (req, res) => {
  const memUsage = process.memoryUsage();
  const routeStats = routeLoader.getStats();

  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: {
      heapUsed: `${(memUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
      heapTotal: `${(memUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
      external: `${(memUsage.external / 1024 / 1024).toFixed(2)} MB`,
    },
    routes: routeStats,
    encryption: ENABLE_ENCRYPTION,
  });
});

// ============================================================================
// ERROR HANDLERS
// ============================================================================

// 404 handler
// app.use((req, res, next) => {
//   res.status(404).json({
//     statusCode: 404,
//     message: "API endpoint not found",
//     path: req.path,
//     method: req.method,
//     timestamp: new Date().toISOString(),
//   });
// });

// Global error handler
app.use((err, req, res, next) => {
  logger.error(`${req.method} ${req.path} - ${err.message}`, {
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    body: req.body,
    ip: req.ip,
  });

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    statusCode,
    message: err.message || "Internal server error",
    path: req.path,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// ============================================================================
// OPTIMIZED SERVER STARTUP
// ============================================================================
async function startServer(app, port) {
  console.log("\n" + "=".repeat(60));
  console.log("🚀 Starting Massom Server");
  console.log("=".repeat(60));

  try {
    // ✅ 1. Scan for routes
    timer.start("route-scanning");
    const baseDirs = [
      join(__dirname, "server", "services"),
      // join(__dirname, "server", "third-party-services"),
    ];

    const routeFiles = routeLoader.walkSync(baseDirs);
    timer.log("route-scanning", "🔍");

    // ✅ 2. Load routes in parallel
    const routeStats = await routeLoader.loadRoutes(app, routeFiles);

    // ✅ 3. Start HTTP server
    timer.start("server-start");
    const server = await new Promise((resolve, reject) => {
      const srv = app.listen(port, (err) => {
        if (err) reject(err);
        else resolve(srv);
      });
    });
    timer.log("server-start", "🌐");

    logger.info(`🚀 Server is running on port ${port}`);
    console.log(`🌐 Server URL: http://localhost:${port}`);

    // ✅ 4. Setup WebSocket
    timer.start("websocket-init");
    const wsManager = await setupWebSocket(server);

    if (wsManager) {
      timer.log("websocket-init", "🔌");
      logger.info("✅ WebSocket server initialized");
    } else {
      console.log("⚠️  WebSocket not initialized (clustering mode)");
    }

    // ✅ 5. Display summary
    timer.logTotal();

    console.log("📊 Server Statistics:");
    console.log(
      `   • Routes loaded: ${routeStats.loaded}/${routeFiles.length}`
    );
    console.log(`   • Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`   • Debug mode: ${DEBUG_MODE ? "ON" : "OFF"}`);
    console.log(`   • Encryption: ${ENABLE_ENCRYPTION ? "ON" : "OFF"}`);
    console.log(`   • Port: ${port}`);
    console.log(`   • PID: ${process.pid}`);
    console.log(`   • Node version: ${process.version}`);
    console.log("=".repeat(60) + "\n");

    // ✅ 6. Setup graceful shutdown
    setupGracefulShutdown(server, wsManager);

    return server;
  } catch (error) {
    logger.error(`❌ Server startup failed: ${error.message}`, {
      stack: error.stack,
    });
    console.error("\n❌ Server startup failed:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// ============================================================================
// GRACEFUL SHUTDOWN
// ============================================================================
function setupGracefulShutdown(server, wsManager) {
  let isShuttingDown = false;

  const shutdown = async (signal) => {
    if (isShuttingDown) return;
    isShuttingDown = true;

    console.log(`\n\n${"=".repeat(60)}`);
    console.log(`🛑 Received ${signal} - Shutting down gracefully...`);
    console.log("=".repeat(60));

    const shutdownTimer = new PerformanceTimer();

    try {
      // 1. Stop accepting new connections
      shutdownTimer.start("close-server");
      await new Promise((resolve) => {
        server.close(() => {
          shutdownTimer.log("close-server", "🌐");
          resolve();
        });
        
        // Force close after 10 seconds
        setTimeout(() => {
          logger.warn('Forcing server close');
          resolve();
        }, 10000);
      });

      // 2. Close WebSocket connections
      if (wsManager && typeof wsManager.shutdown === 'function') {
        shutdownTimer.start("close-websockets");
        try {
          await wsManager.shutdown();
          shutdownTimer.log("close-websockets", "🔌");
        } catch (err) {
          logger.error('Error closing WebSockets:', err);
          shutdownTimer.end("close-websockets");
        }
      }

      // 3. Close database connections (if any)
      // shutdownTimer.start("close-database");
      // await db.close();
      // shutdownTimer.log("close-database", "💾");

      shutdownTimer.logTotal();
      console.log("✅ Graceful shutdown completed");
      process.exit(0);
    } catch (error) {
      logger.error("Error during shutdown:", error);
      console.error("❌ Error during shutdown:", error);
      process.exit(1);
    }
  };

  // Handle shutdown signals
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  // Handle uncaught errors - DON'T shutdown on every error
  process.on("uncaughtException", (err) => {
    logger.error("Uncaught Exception:", err);
    console.error("\n❌ Uncaught Exception:", err);
    
    // Only shutdown on critical errors
    const criticalErrors = ['EADDRINUSE', 'EACCES', 'ENOMEM'];
    if (criticalErrors.includes(err.code)) {
      shutdown("UNCAUGHT_EXCEPTION");
    }
  });

  process.on("unhandledRejection", (reason, promise) => {
    logger.error("Unhandled Rejection:", { reason, promise });
    console.error("\n❌ Unhandled Rejection:", reason);
    
    // Don't exit in production on unhandled rejections
    if (process.env.NODE_ENV !== "production") {
      // Log but don't shutdown unless it's critical
      console.warn("⚠️  Unhandled rejection logged but not shutting down");
    }
  });
}

// ============================================================================
// START THE SERVER
// ============================================================================
startServer(app, PORT);

// ============================================================================
// OPTIONAL: CLUSTERING SUPPORT
// ============================================================================
/*
Uncomment this section for multi-core support:

import { cpus } from 'os';

if (cluster.isPrimary && process.env.CLUSTER_MODE === 'true') {
  const numWorkers = parseInt(process.env.NUM_WORKERS) || cpus().length;
  
  console.log(`\n${"=".repeat(60)}`);
  console.log(`🔧 Master process (PID: ${process.pid}) spawning ${numWorkers} workers`);
  console.log("=".repeat(60));

  for (let i = 0; i < numWorkers; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`⚠️  Worker ${worker.process.pid} died (${signal || code}). Spawning new worker...`);
    cluster.fork();
  });

  cluster.on('online', (worker) => {
    console.log(`✅ Worker ${worker.process.pid} is online`);
  });

} else {
  startServer(app, PORT);
}
*/

export default app;
