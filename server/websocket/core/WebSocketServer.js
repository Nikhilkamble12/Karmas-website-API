// ============================================================================
// FILE: server/websocket/core/WebSocketServer.js
// ============================================================================
import { WebSocketServer as WS } from 'ws';
import jwt from 'jsonwebtoken';
import url from 'url';
import logger from '../../config/winston_logs/winston.js';
import { ConnectionManager } from '../managers/ConnectionManager.js';
import { RateLimiter } from '../managers/RateLimiter.js';
import { MessageQueue } from '../managers/MessageQueue.js';
import { CircuitBreaker } from '../middleware/CircuitBreaker.js';
import { MessageHandler } from '../handlers/MessageHandler.js';

export class WebSocketServerManager {
  constructor(config = {}) {
    this.config = {
      wsAuthPath: config.wsAuthPath || '/api/v1/wsauth',
      jwtSecret: config.jwtSecret || process.env.JWT_SECRET,
      maxPayloadSize: config.maxPayloadSize || 100 * 1024,
      maxConnections: config.maxConnections || 10000,
      heartbeatInterval: config.heartbeatInterval || 30000,
      metricsInterval: config.metricsInterval || 60000,
      ...config
    };

    // Initialize managers
    this.connectionManager = new ConnectionManager();
    this.rateLimiter = new RateLimiter({
      tokensPerInterval: config.rateLimit?.tokens || 100,
      interval: config.rateLimit?.interval || 60000
    });
    this.messageQueue = new MessageQueue({
      maxSize: config.queue?.maxSize || 10000,
      batchSize: config.queue?.batchSize || 10
    });
    this.circuitBreaker = new CircuitBreaker({
      failureThreshold: config.circuit?.threshold || 100,
      timeout: config.circuit?.timeout || 30000
    });

    this.wsRoutesCache = null;
    this.wss = null;
    this.intervals = [];
    this.isShuttingDown = false;
  }

  async initialize(server, wsRoutesCache) {
    this.wsRoutesCache = wsRoutesCache;
    
    this.wss = new WS({ 
      noServer: true,
      perMessageDeflate: false,
      maxPayload: this.config.maxPayloadSize,
      clientTracking: false,
      backlog: 1000
    });

    this.messageHandler = new MessageHandler(
      this.connectionManager,
      this.rateLimiter,
      this.messageQueue,
      this.wsRoutesCache
    );

    this.setupUpgradeHandler(server);
    this.setupConnectionHandler();
    this.setupHeartbeat();
    this.setupMetrics();

    logger.info('✅ WebSocket server initialized');
    return this.wss;
  }

  setupUpgradeHandler(server) {
    server.on('upgrade', (req, socket, head) => {
      // Circuit breaker check
      if (!this.circuitBreaker.canProceed()) {
        socket.write('HTTP/1.1 503 Service Unavailable\r\n\r\n');
        socket.destroy();
        return;
      }

      // Connection limit check
      if (this.connectionManager.connections.size >= this.config.maxConnections) {
        socket.write('HTTP/1.1 503 Service Unavailable\r\nRetry-After: 60\r\n\r\n');
        socket.destroy();
        logger.warn('Max connections reached');
        return;
      }

      try {
        const parsedUrl = url.parse(req.url, true);
        
        if (parsedUrl.pathname !== this.config.wsAuthPath) {
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

        const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        
        jwt.verify(token, this.config.jwtSecret, { algorithms: ['HS256'] }, (err, decoded) => {
          if (err) {
            socket.write('HTTP/1.1 403 Forbidden\r\n\r\n');
            socket.destroy();
            this.circuitBreaker.recordFailure();
            return;
          }

          this.circuitBreaker.recordSuccess();

          this.wss.handleUpgrade(req, socket, head, (ws) => {
            ws.user = decoded;
            ws.isAlive = true;
            ws.deviceId = deviceId;
            ws.clientIp = clientIp;
            ws.connectedAt = Date.now();
            this.wss.emit('connection', ws, req);
          });
        });
      } catch (error) {
        logger.error("Upgrade error:", error);
        socket.destroy();
        this.circuitBreaker.recordFailure();
      }
    });
  }

  setupConnectionHandler() {
    this.wss.on('connection', (ws) => {
      const userId = ws.user.user_id;
      const deviceId = ws.deviceId;
      
      this.connectionManager.add(userId, ws, deviceId);
      
      logger.info(`✅ User ${userId} connected [${deviceId}]`);

      ws.on('message', (message) => {
        this.messageHandler.handleMessage(ws, message);
      });

      ws.on('close', () => {
        this.connectionManager.remove(ws.sessionKey);
        logger.info(`❌ User ${userId} disconnected [${deviceId}]`);
      });

      ws.on('error', (err) => {
        logger.error(`WebSocket error for user ${userId}:`, err);
        this.connectionManager.remove(ws.sessionKey);
        this.connectionManager.metrics.errors++;
      });

      ws.on('pong', () => {
        ws.isAlive = true;
      });
    });

    this.wss.on('error', (err) => {
      logger.error("WebSocket server error:", err);
      this.connectionManager.metrics.errors++;
    });
  }

  setupHeartbeat() {
    const interval = setInterval(() => {
      try {
        // Use ConnectionManager instead of wss.clients since clientTracking is false
        if (!this.connectionManager?.connections) {
          return;
        }

        // Convert Map to array to safely iterate
        const connections = Array.from(this.connectionManager.connections.values());
        
        connections.forEach((conn) => {
          const ws = conn.ws;
          
          // Check if WebSocket exists and is open
          if (!ws || ws.readyState !== 1) { // 1 = OPEN
            this.connectionManager.remove(conn.sessionKey);
            return;
          }

          // Check if client is still alive
          if (ws.isAlive === false) {
            this.connectionManager.remove(conn.sessionKey);
            return ws.terminate();
          }
          
          // Mark as not alive and send ping
          ws.isAlive = false;
          try {
            ws.ping();
          } catch (err) {
            logger.error('Error sending ping:', err);
            this.connectionManager.remove(conn.sessionKey);
            ws.terminate();
          }
        });
      } catch (error) {
        logger.error('Heartbeat error:', error);
      }
    }, this.config.heartbeatInterval);

    this.intervals.push(interval);
  }

  setupMetrics() {
    const interval = setInterval(() => {
      try {
        const metrics = this.connectionManager.getMetrics();
        const queueMetrics = this.messageQueue.getMetrics();
        const circuitState = this.circuitBreaker.getState();
        
        logger.info('WebSocket Metrics:', {
          ...metrics,
          queue: queueMetrics,
          circuit: circuitState
        });
        
        const memUsage = process.memoryUsage();
        // Change this line in your current setupMetrics():
        if (memUsage.heapUsed / memUsage.heapTotal > 0.9) {
          logger.warn('High memory usage:', memUsage);
        }

        // To this (only warn if heap is >95% AND >200MB):
        const heapUsedMB = memUsage.heapUsed / 1024 / 1024;
        const heapPercent = memUsage.heapUsed / memUsage.heapTotal;

        if (heapPercent > 0.95 && heapUsedMB > 200) {
          logger.warn('High memory usage:', memUsage);
        }
      } catch (error) {
        logger.error('Metrics error:', error);
      }
    }, this.config.metricsInterval);

    this.intervals.push(interval);
  }

  async shutdown() {
    if (this.isShuttingDown) {
      return; // Prevent multiple shutdown calls
    }
    this.isShuttingDown = true;

    logger.info('🛑 Shutting down WebSocket server...');
    
    try {
      // 1. Clear all intervals
      if (this.intervals?.length > 0) {
        logger.info(`Clearing ${this.intervals.length} intervals...`);
        this.intervals.forEach(interval => {
          if (interval) clearInterval(interval);
        });
        this.intervals = [];
      }
      
      // 2. Cleanup managers
      if (this.rateLimiter?.destroy) {
        logger.info('Cleaning up rate limiter...');
        this.rateLimiter.destroy();
      }
      
      // 3. Close all WebSocket connections
      if (this.wss && this.connectionManager?.connections) {
        const connections = Array.from(this.connectionManager.connections.values());
        logger.info(`Closing ${connections.length} WebSocket connections...`);
        
        await Promise.allSettled(
          connections.map(conn => 
            new Promise((resolve) => {
              try {
                const ws = conn.ws;
                if (ws?.readyState === 1) { // OPEN state
                  ws.send(JSON.stringify({ 
                    event: 'server_shutdown', 
                    data: 'Server is shutting down' 
                  }), () => {
                    ws.close();
                    resolve();
                  });
                  
                  // Force close after 2 seconds
                  setTimeout(() => {
                    if (ws.readyState !== 3) { // Not CLOSED
                      ws.terminate();
                    }
                    resolve();
                  }, 2000);
                } else {
                  resolve();
                }
              } catch (err) {
                logger.error('Error closing connection:', err);
                resolve();
              }
            })
          )
        );
        
        // Clear connection manager
        this.connectionManager.connections.clear();
      }
      
      // 4. Close WebSocket server
      if (this.wss) {
        await new Promise((resolve) => {
          this.wss.close((err) => {
            if (err) {
              logger.error('Error closing WebSocket server:', err);
            } else {
              logger.info('✅ WebSocket server closed successfully');
            }
            resolve();
          });
          
          // Force close after 5 seconds
          setTimeout(() => {
            logger.warn('Forcing WebSocket server close');
            resolve();
          }, 5000);
        });
      }
      
      logger.info('✅ WebSocket shutdown complete');
    } catch (error) {
      logger.error('Error during WebSocket shutdown:', error);
    }
  }

  getConnectionManager() {
    return this.connectionManager;
  }
}