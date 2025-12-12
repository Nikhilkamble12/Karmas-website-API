// ============================================================================
// FILE: server/websocket/managers/ConnectionManager.js
// ============================================================================
export class ConnectionManager {
  constructor() {
    this.connections = new Map();
    this.userSessions = new Map();
    this.roomSubscriptions = new Map(); // New: Room-based pub/sub
    this.metrics = {
      totalConnections: 0,
      messagesReceived: 0,
      messagesSent: 0,
      errors: 0,
      avgLatency: 0
    };
  }

  add(userId, ws, deviceId = 'default', metadata = {}) {
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
    ws.metadata = metadata;
    ws.subscriptions = new Set(); // Track room subscriptions
  }

  remove(sessionKey) {
    const ws = this.connections.get(sessionKey);
    if (ws) {
      const { userId, deviceId, subscriptions } = ws;
      
      // Remove from all room subscriptions
      subscriptions?.forEach(room => this.unsubscribeFromRoom(sessionKey, room));
      
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

  // ✅ Room-based messaging (much faster for group chats)
  subscribeToRoom(sessionKey, roomId) {
    const ws = this.connections.get(sessionKey);
    if (!ws) return false;
    
    if (!this.roomSubscriptions.has(roomId)) {
      this.roomSubscriptions.set(roomId, new Set());
    }
    
    this.roomSubscriptions.get(roomId).add(sessionKey);
    ws.subscriptions.add(roomId);
    return true;
  }

  unsubscribeFromRoom(sessionKey, roomId) {
    const ws = this.connections.get(sessionKey);
    if (ws) {
      ws.subscriptions.delete(roomId);
    }
    
    const room = this.roomSubscriptions.get(roomId);
    if (room) {
      room.delete(sessionKey);
      if (room.size === 0) {
        this.roomSubscriptions.delete(roomId);
      }
    }
  }

  // ✅ Optimized room broadcast (O(n) instead of O(n*m))
  broadcastToRoom(roomId, message, excludeSessionKey = null) {
    const room = this.roomSubscriptions.get(roomId);
    if (!room) return 0;
    
    let sent = 0;
    const messageStr = typeof message === 'string' ? message : JSON.stringify(message);
    
    for (const sessionKey of room) {
      if (sessionKey === excludeSessionKey) continue;
      
      const ws = this.connections.get(sessionKey);
      if (ws?.readyState === 1) {
        ws.send(messageStr);
        sent++;
      }
    }
    
    this.metrics.messagesSent += sent;
    return sent;
  }

  getUserConnections(userId) {
    return this.userSessions.get(userId);
  }

  getBySessionKey(sessionKey) {
    return this.connections.get(sessionKey);
  }

  // ✅ Optimized user broadcast
  broadcast(userIds, message) {
    let sent = 0;
    const messageStr = typeof message === 'string' ? message : JSON.stringify(message);
    
    for (const userId of userIds) {
      const sessions = this.getUserConnections(userId);
      if (sessions) {
        sessions.forEach(ws => {
          if (ws.readyState === 1) {
            ws.send(messageStr);
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
      uniqueUsers: this.userSessions.size,
      activeRooms: this.roomSubscriptions.size
    };
  }

  // ✅ Efficient connection filtering
  *filterConnections(predicate) {
    for (const [sessionKey, ws] of this.connections) {
      if (predicate(ws)) {
        yield { sessionKey, ws };
      }
    }
  }
}