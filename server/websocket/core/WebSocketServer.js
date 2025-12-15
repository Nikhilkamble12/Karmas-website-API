// ============================================================================
// FILE: server/websocket/core/WebSocketServer.js
// Lightweight version - removed heavy features
// ============================================================================
import { WebSocketServer as WS } from 'ws';
import jwt from 'jsonwebtoken';
import url from 'url';
import logger from '../../config/winston_logs/winston.js';

export class WebSocketServerManager {
  constructor(config = {}) {
    this.config = {
      wsAuthPath: config.wsAuthPath || '/api/v1/wsauth',
      jwtSecret: config.jwtSecret || process.env.JWT_SECRET,
      maxPayloadSize: config.maxPayloadSize || 100 * 1024, // 100KB
      maxConnections: config.maxConnections || 10000,
      heartbeatInterval: config.heartbeatInterval || 30000,
      ...config
    };

    // Simple connection tracking - Map of userId -> Set of connections
    this.connections = new Map();
    this.totalConnections = 0;
    
    this.wss = null;
    this.heartbeatInterval = null;
    this.isShuttingDown = false;
  }

  async initialize(server, wsRoutesCache) {
    this.wsRoutesCache = wsRoutesCache;
    
    this.wss = new WS({ 
      noServer: true,
      perMessageDeflate: false, // Disable compression to reduce CPU
      maxPayload: this.config.maxPayloadSize,
      clientTracking: false // We track manually for efficiency
    });

    this.setupUpgradeHandler(server);
    this.setupConnectionHandler();
    this.setupHeartbeat();

    logger.info('✅ WebSocket server initialized');
    return this.wss;
  }

  setupUpgradeHandler(server) {
    server.on('upgrade', (req, socket, head) => {
      // Quick connection limit check
      if (this.totalConnections >= this.config.maxConnections) {
        socket.write('HTTP/1.1 503 Service Unavailable\r\n\r\n');
        socket.destroy();
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

        jwt.verify(token, this.config.jwtSecret, { algorithms: ['HS256'] }, (err, decoded) => {
          if (err) {
            socket.write('HTTP/1.1 403 Forbidden\r\n\r\n');
            socket.destroy();
            return;
          }

          this.wss.handleUpgrade(req, socket, head, (ws) => {
            ws.user = decoded;
            ws.isAlive = true;
            ws.deviceId = deviceId;
            this.wss.emit('connection', ws, req);
          });
        });
      } catch (error) {
        logger.error("Upgrade error:", error);
        socket.destroy();
      }
    });
  }

  setupConnectionHandler() {
    this.wss.on('connection', (ws) => {
      const userId = ws.user.user_id;
      const deviceId = ws.deviceId;
      
      // Add to connections
      if (!this.connections.has(userId)) {
        this.connections.set(userId, new Set());
      }
      this.connections.get(userId).add(ws);
      this.totalConnections++;
      
      // Store userId on ws for easy cleanup
      ws.userId = userId;
      
      logger.info(`✅ User ${userId} connected [${deviceId}] - Total: ${this.totalConnections}`);

      ws.on('message', async (message) => {
        try {
          const { event, eventPath, data } = JSON.parse(message);
          
          // Built-in ping-pong
          if (event === 'ping') {
            ws.send(JSON.stringify({ event: 'pong', timestamp: Date.now() }));
            return;
          }

          // Find handler
          const handler = eventPath ? this.wsRoutesCache.get(eventPath) : this.wsRoutesCache.get(event);
          
          if (handler) {
            const wsRequest = {
              event,
              eventPath,
              data,
              user: ws.user
            };
            await handler(ws, wsRequest);
          } else {
            ws.send(JSON.stringify({ event: 'error', data: `Unknown event: ${event}` }));
          }
        } catch (err) {
          logger.error(`Message error for user ${userId}:`, err);
          ws.send(JSON.stringify({ event: 'error', data: 'Invalid message format' }));
        }
      });

      ws.on('close', () => {
        this.removeConnection(ws);
        logger.info(`❌ User ${userId} disconnected [${deviceId}] - Total: ${this.totalConnections}`);
      });

      ws.on('error', (err) => {
        logger.error(`WebSocket error for user ${userId}:`, err);
        this.removeConnection(ws);
      });

      ws.on('pong', () => {
        ws.isAlive = true;
      });
    });
  }

  removeConnection(ws) {
    const userId = ws.userId;
    if (userId && this.connections.has(userId)) {
      const userConns = this.connections.get(userId);
      userConns.delete(ws);
      
      // Remove user entry if no connections left
      if (userConns.size === 0) {
        this.connections.delete(userId);
      }
    }
    this.totalConnections--;
  }

  setupHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      const deadConnections = [];
      
      // Iterate through all connections
      for (const [userId, wsSet] of this.connections.entries()) {
        for (const ws of wsSet) {
          if (ws.readyState !== 1) { // Not OPEN
            deadConnections.push(ws);
            continue;
          }

          if (ws.isAlive === false) {
            deadConnections.push(ws);
            ws.terminate();
            continue;
          }
          
          ws.isAlive = false;
          ws.ping();
        }
      }

      // Cleanup dead connections
      deadConnections.forEach(ws => this.removeConnection(ws));
      
    }, this.config.heartbeatInterval);
  }

  // Send message to specific user (all their devices)
  sendToUser(userId, message) {
    const userConns = this.connections.get(userId);
    if (!userConns) return false;

    const msgStr = typeof message === 'string' ? message : JSON.stringify(message);
    let sent = 0;

    for (const ws of userConns) {
      if (ws.readyState === 1) { // OPEN
        ws.send(msgStr);
        sent++;
      }
    }

    return sent > 0;
  }

  // Broadcast to all connections
  broadcast(message) {
    const msgStr = typeof message === 'string' ? message : JSON.stringify(message);
    let sent = 0;

    for (const wsSet of this.connections.values()) {
      for (const ws of wsSet) {
        if (ws.readyState === 1) {
          ws.send(msgStr);
          sent++;
        }
      }
    }

    return sent;
  }

  getMetrics() {
    return {
      totalConnections: this.totalConnections,
      uniqueUsers: this.connections.size
    };
  }

  async shutdown() {
    if (this.isShuttingDown) return;
    this.isShuttingDown = true;

    logger.info('🛑 Shutting down WebSocket server...');
    
    // Clear heartbeat
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    // Close all connections
    const closePromises = [];
    for (const wsSet of this.connections.values()) {
      for (const ws of wsSet) {
        if (ws.readyState === 1) {
          closePromises.push(
            new Promise((resolve) => {
              ws.send(JSON.stringify({ event: 'server_shutdown' }), () => {
                ws.close();
                resolve();
              });
              setTimeout(resolve, 1000); // Force resolve after 1s
            })
          );
        }
      }
    }

    await Promise.allSettled(closePromises);
    this.connections.clear();
    this.totalConnections = 0;

    // Close server
    if (this.wss) {
      await new Promise((resolve) => {
        this.wss.close(() => {
          logger.info('✅ WebSocket server closed');
          resolve();
        });
        setTimeout(resolve, 3000); // Force resolve after 3s
      });
    }
  }
}