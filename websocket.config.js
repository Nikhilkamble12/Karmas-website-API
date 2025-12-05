
// // import WebSocket from 'ws';
// import { WebSocketServer } from 'ws';

// // import ws from 'ws';
// // const WebSocketServer = ws.Server;

// import jwt from 'jsonwebtoken';
// import url from 'url';
// import { loadWsRoutes } from './server/middleware/ws_route_middleware/wsRouterLoader.js';
// import { join, dirname } from 'path';
// import { fileURLToPath } from 'url';
// import logger from "./server/config/winston_logs/winston.js"

// const activeConnections = new Map();

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);
// const baseDirs = [
//   join(__dirname, "server", 'ws-Services')
// ];

// async function setupWebSocket(server) {
//   console.log("🛠️ Setting up WebSocket upgrade handler...")
//   const wss = new WebSocketServer({ noServer: true });
//   const wsRoutes = await loadWsRoutes(baseDirs,activeConnections);
//   console.log("wsRoutes---->",wsRoutes)
//   wss.on('error', (err) => {
//   logger.error("WebSocket error: " + err);
// });

//   server.on('upgrade', (req, socket, head) => {
//     try{
//     console.log("🔧 Upgrade request received");
//     console.log("Upgrade request received", req.headers);
//     const parsedUrl = url.parse(req.url, true);
//     console.log('Incoming upgrade path:', parsedUrl.pathname);
//     // ✅ Only allow upgrades on /api/v1/auth
//     if (parsedUrl.pathname !== '/api/v1/wsauth') {
//       socket.write('HTTP/1.1 404 Not Found\r\n\r\n');
//       socket.destroy();
//       return;
//     }

//     const token = parsedUrl.query.token || req.headers['sec-websocket-protocol'];
//     if (!token) {
//       socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
//       socket.destroy();
//       return;
//     }

//     jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
//       if (err) {
//         socket.write('HTTP/1.1 403 Forbidden\r\n\r\n');
//         socket.destroy();
//         return;
//       }

//       wss.handleUpgrade(req, socket, head, (ws) => {
//         ws.user = decoded;
//         wss.emit('connection', ws, req);
//         return
//       });
//     });
//     }catch(error){
//         logger.error(req.url + " Error in upgrade handler ---> " + err);
//     }
//   });


//   wss.on('connection', (ws) => {
//     const userId = ws.user.user_id;
//     activeConnections.set(userId, ws);
//     console.log(`✅ User ${userId} connected.`);

//     ws.on('message', async (message) => {
//       try {
//         const { event,eventPath,token,data, } = JSON.parse(message);
//          // Built-in ping-pong handling
//         if (event == 'ping') {
//           ws.send(JSON.stringify({ event: 'pong', data: `Pong from server at ${new Date().toISOString()}` }));
//           return;
//         }
//         let handler
//         if (event === 'url' && eventPath) {
//           handler = wsRoutes.get(eventPath);
//         } else {
//           handler = wsRoutes.get(event);
//         }        
//         // console.log("handler",handler)

//         if (handler) {
//           const wsRequest = {
//             event,
//             eventPath,
//             data,
//             user: ws.user,
//             query: url.parse(ws.upgradeReq?.url || '', true).query,
//             headers: ws.upgradeReq?.headers || {},
//           };
//           await handler(ws,wsRequest);
//         } else {
//           ws.send(JSON.stringify({ event: 'error', data: `Unknown event: ${event}` }));
//         }
//       } catch (err) {
//         console.log("ërr",err)
//         ws.send(JSON.stringify({ event: 'error', data: 'Invalid JSON format' }));
//       }
//     });   

//     ws.on('close', () => {
//       activeConnections.delete(userId);
//       console.log(`❌ User ${userId} disconnected.`);
//     });
//   });

//   return wss;
// }
// export default setupWebSocket;



import { WebSocketServer } from 'ws';
import jwt from 'jsonwebtoken';
import url from 'url';
import { loadWsRoutes } from './server/middleware/ws_route_middleware/wsRouterLoader.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import logger from "./server/config/winston_logs/winston.js";
import cluster from 'cluster';
import { cpus } from 'os';

// ✅ Production-grade connection management
class ConnectionManager {
  constructor() {
    this.connections = new Map();
    this.userSessions = new Map(); // Track multiple devices per user
    this.metrics = {
      totalConnections: 0,
      messagesReceived: 0,
      messagesSent: 0,
      errors: 0
    };
  }

  add(userId, ws, deviceId = 'default') {
    if (!this.userSessions.has(userId)) {
      this.userSessions.set(userId, new Map());
    }
    
    const sessionKey = `${userId}_${deviceId}`;
    this.userSessions.get(userId).set(deviceId, ws);
    this.connections.set(sessionKey, ws);
    this.metrics.totalConnections++;
    
    ws.userId = userId;
    ws.deviceId = deviceId;
    ws.sessionKey = sessionKey;
  }

  remove(sessionKey) {
    const ws = this.connections.get(sessionKey);
    if (ws) {
      const { userId, deviceId } = ws;
      this.connections.delete(sessionKey);
      
      const userSessions = this.userSessions.get(userId);
      if (userSessions) {
        userSessions.delete(deviceId);
        if (userSessions.size === 0) {
          this.userSessions.delete(userId);
        }
      }
      this.metrics.totalConnections--;
    }
  }

  getUserConnections(userId) {
    return this.userSessions.get(userId);
  }

  getBySessionKey(sessionKey) {
    return this.connections.get(sessionKey);
  }

  broadcast(userIds, message) {
    let sent = 0;
    for (const userId of userIds) {
      const sessions = this.getUserConnections(userId);
      if (sessions) {
        sessions.forEach(ws => {
          if (ws.readyState === 1) { // WebSocket.OPEN
            ws.send(message);
            sent++;
          }
        });
      }
    }
    this.metrics.messagesSent += sent;
    return sent;
  }

  getMetrics() {
    return {
      ...this.metrics,
      activeConnections: this.connections.size,
      uniqueUsers: this.userSessions.size
    };
  }
}

const connectionManager = new ConnectionManager();

// ✅ Rate limiting with token bucket algorithm
class RateLimiter {
  constructor(tokensPerInterval = 100, interval = 60000) {
    this.tokensPerInterval = tokensPerInterval;
    this.interval = interval;
    this.buckets = new Map();
  }

  consume(userId, tokens = 1) {
    const now = Date.now();
    let bucket = this.buckets.get(userId);

    if (!bucket) {
      bucket = {
        tokens: this.tokensPerInterval - tokens,
        lastRefill: now
      };
      this.buckets.set(userId, bucket);
      return true;
    }

    const timePassed = now - bucket.lastRefill;
    const refillTokens = Math.floor((timePassed / this.interval) * this.tokensPerInterval);
    
    bucket.tokens = Math.min(this.tokensPerInterval, bucket.tokens + refillTokens);
    bucket.lastRefill = now;

    if (bucket.tokens >= tokens) {
      bucket.tokens -= tokens;
      return true;
    }

    return false;
  }

  cleanup() {
    const now = Date.now();
    for (const [userId, bucket] of this.buckets.entries()) {
      if (now - bucket.lastRefill > this.interval * 2) {
        this.buckets.delete(userId);
      }
    }
  }
}

const rateLimiter = new RateLimiter(100, 60000); // 100 messages per minute

// ✅ Message queue for handling bursts
class MessageQueue {
  constructor(maxSize = 10000) {
    this.queue = [];
    this.maxSize = maxSize;
    this.processing = false;
  }

  enqueue(task) {
    if (this.queue.length >= this.maxSize) {
      logger.warn('Message queue full, dropping message');
      return false;
    }
    this.queue.push(task);
    this.process();
    return true;
  }

  async process() {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    
    while (this.queue.length > 0) {
      const task = this.queue.shift();
      try {
        await task();
      } catch (err) {
        logger.error('Queue processing error:', err);
      }
    }
    
    this.processing = false;
  }
}

const messageQueue = new MessageQueue();

// ✅ Constants and configuration
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const baseDirs = [join(__dirname, "server", 'ws-Services')];
const WS_AUTH_PATH = '/api/v1/wsauth';
const JWT_SECRET = process.env.JWT_SECRET;
const MAX_PAYLOAD_SIZE = 100 * 1024; // 100KB
const HEARTBEAT_INTERVAL = 30000; // 30 seconds
const METRICS_INTERVAL = 60000; // 1 minute

let wsRoutesCache = null;

// ✅ Pre-compiled response objects
const responses = {
  pong: (timestamp) => JSON.stringify({ event: 'pong', data: timestamp }),
  error: (msg) => JSON.stringify({ event: 'error', data: msg }),
  rateLimited: JSON.stringify({ event: 'error', data: 'Rate limit exceeded' })
};

async function setupWebSocket(server) {
  console.log("🛠️ Setting up production WebSocket server...");
  
  // ✅ Check if clustering is enabled
  if (cluster.isMaster && process.env.CLUSTER_MODE === 'true') {
    const numWorkers = process.env.WS_WORKERS || cpus().length;
    console.log(`🔧 Master process spawning ${numWorkers} workers`);
    
    for (let i = 0; i < numWorkers; i++) {
      cluster.fork();
    }
    
    cluster.on('exit', (worker) => {
      console.log(`Worker ${worker.process.pid} died. Spawning new worker...`);
      cluster.fork();
    });
    
    return null; // Master doesn't handle WebSocket
  }

  const wss = new WebSocketServer({ 
    noServer: true,
    perMessageDeflate: false,
    maxPayload: MAX_PAYLOAD_SIZE,
    clientTracking: false,
    backlog: 1000 // Queue size for pending connections
  });

  // ✅ Load and cache routes
  if (!wsRoutesCache) {
    wsRoutesCache = await loadWsRoutes(baseDirs, connectionManager);
    console.log(`📦 Routes cached: ${wsRoutesCache.size} routes loaded`);
  }

  wss.on('error', (err) => {
    logger.error("WebSocket server error:", err);
    connectionManager.metrics.errors++;
  });

  // ✅ Circuit breaker for overload protection
  let circuitOpen = false;
  let failureCount = 0;
  const FAILURE_THRESHOLD = 100;
  const CIRCUIT_TIMEOUT = 30000;

  function openCircuit() {
    circuitOpen = true;
    logger.warn('Circuit breaker OPEN - rejecting new connections');
    setTimeout(() => {
      circuitOpen = false;
      failureCount = 0;
      logger.info('Circuit breaker CLOSED - accepting connections');
    }, CIRCUIT_TIMEOUT);
  }

  // ✅ Optimized upgrade handler with security
  server.on('upgrade', (req, socket, head) => {
    // ✅ Circuit breaker check
    if (circuitOpen) {
      socket.write('HTTP/1.1 503 Service Unavailable\r\n\r\n');
      socket.destroy();
      return;
    }

    // ✅ Connection limit check
    if (connectionManager.connections.size >= (process.env.MAX_CONNECTIONS || 10000)) {
      socket.write('HTTP/1.1 503 Service Unavailable\r\nRetry-After: 60\r\n\r\n');
      socket.destroy();
      logger.warn('Max connections reached');
      return;
    }

    try {
      const parsedUrl = url.parse(req.url, true);
      
      if (parsedUrl.pathname !== WS_AUTH_PATH) {
        socket.write('HTTP/1.1 404 Not Found\r\n\r\n');
        socket.destroy();
        return;
      }

      const token = parsedUrl.query.token || req.headers['sec-websocket-protocol'];
      const deviceId = parsedUrl.query.device_id || 'default';

      if (!token) {
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        socket.destroy();
        return;
      }

      // ✅ IP-based rate limiting on authentication
      const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      
      jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] }, (err, decoded) => {
        if (err) {
          socket.write('HTTP/1.1 403 Forbidden\r\n\r\n');
          socket.destroy();
          failureCount++;
          if (failureCount >= FAILURE_THRESHOLD) {
            openCircuit();
          }
          return;
        }

        wss.handleUpgrade(req, socket, head, (ws) => {
          ws.user = decoded;
          ws.isAlive = true;
          ws.deviceId = deviceId;
          ws.clientIp = clientIp;
          ws.connectedAt = Date.now();
          wss.emit('connection', ws, req);
        });
      });
    } catch (error) {
      logger.error("Upgrade error:", error);
      socket.destroy();
      failureCount++;
      if (failureCount >= FAILURE_THRESHOLD) {
        openCircuit();
      }
    }
  });

  // ✅ Optimized connection handler
  wss.on('connection', (ws) => {
    const userId = ws.user.user_id;
    const deviceId = ws.deviceId;
    
    connectionManager.add(userId, ws, deviceId);
    
    logger.info(`✅ User ${userId} connected [${deviceId}]. Active: ${connectionManager.getMetrics().activeConnections}`);

    // ✅ Heartbeat setup
    ws.isAlive = true;
    ws.on('pong', () => {
      ws.isAlive = true;
    });

    // ✅ Optimized message handler with queue
    ws.on('message', (message) => {
      connectionManager.metrics.messagesReceived++;

      // ✅ Rate limiting
      if (!rateLimiter.consume(userId)) {
        ws.send(responses.rateLimited);
        return;
      }

      // ✅ Enqueue message processing
      messageQueue.enqueue(async () => {
        try {
          const parsedMessage = JSON.parse(message);
          const { event, eventPath, data } = parsedMessage;

          // ✅ Fast ping-pong
          if (event === 'ping') {
            ws.send(responses.pong(Date.now()));
            return;
          }

          // ✅ Route lookup and execution
          const routeKey = event === 'url' && eventPath ? eventPath : event;
          const handler = wsRoutesCache.get(routeKey);

          if (handler) {
            const wsRequest = {
              event,
              eventPath,
              data,
              user: ws.user,
              deviceId: ws.deviceId,
              clientIp: ws.clientIp
            };
            
            await handler(ws, wsRequest);
          } else {
            ws.send(responses.error(`Unknown event: ${event}`));
          }
        } catch (err) {
          logger.error(`Message error for user ${userId}:`, err);
          ws.send(responses.error('Invalid message format'));
          connectionManager.metrics.errors++;
        }
      });
    });

    ws.on('close', () => {
      connectionManager.remove(ws.sessionKey);
      logger.info(`❌ User ${userId} disconnected [${deviceId}]. Active: ${connectionManager.getMetrics().activeConnections}`);
    });

    ws.on('error', (err) => {
      logger.error(`WebSocket error for user ${userId}:`, err);
      connectionManager.remove(ws.sessionKey);
      connectionManager.metrics.errors++;
    });
  });

  // ✅ Heartbeat mechanism
  const heartbeatInterval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.isAlive === false) {
        connectionManager.remove(ws.sessionKey);
        return ws.terminate();
      }
      
      ws.isAlive = false;
      ws.ping();
    });
  }, HEARTBEAT_INTERVAL);

  // ✅ Rate limiter cleanup
  setInterval(() => {
    rateLimiter.cleanup();
  }, 300000); // Every 5 minutes

  // ✅ Metrics logging
  setInterval(() => {
    const metrics = connectionManager.getMetrics();
    logger.info('WebSocket Metrics:', metrics);
    
    // ✅ Memory usage monitoring
    const memUsage = process.memoryUsage();
    if (memUsage.heapUsed / memUsage.heapTotal > 0.9) {
      logger.warn('High memory usage detected:', memUsage);
    }
  }, METRICS_INTERVAL);

  // ✅ Graceful shutdown
  process.on('SIGTERM', () => {
    logger.info('SIGTERM received, closing WebSocket server...');
    clearInterval(heartbeatInterval);
    
    wss.clients.forEach(ws => {
      ws.send(JSON.stringify({ event: 'server_shutdown', data: 'Server is shutting down' }));
      ws.close();
    });
    
    wss.close(() => {
      logger.info('WebSocket server closed');
      process.exit(0);
    });
  });

  return wss;
}

export { setupWebSocket, connectionManager };
export default setupWebSocket;
