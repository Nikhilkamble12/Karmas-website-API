// ============================================================================
// FILE: server/websocket/handlers/MessageHandler.js
// ============================================================================
import logger from '../../config/winston_logs/winston.js';

export class MessageHandler {
  constructor(connectionManager, rateLimiter, messageQueue, wsRoutesCache) {
    this.connectionManager = connectionManager;
    this.rateLimiter = rateLimiter;
    this.messageQueue = messageQueue;
    this.wsRoutesCache = wsRoutesCache;
    
    // Pre-compiled responses
    this.responses = {
      pong: (timestamp) => JSON.stringify({ event: 'pong', data: timestamp }),
      error: (msg) => JSON.stringify({ event: 'error', data: msg }),
      rateLimited: (retryAfter) => JSON.stringify({ 
        event: 'error', 
        data: 'Rate limit exceeded',
        retryAfter 
      })
    };
  }

  async handleMessage(ws, message) {
    const userId = ws.userId;
    this.connectionManager.metrics.messagesReceived++;

    // ✅ Rate limiting with backoff info
    const rateLimitResult = this.rateLimiter.consume(userId);
    if (!rateLimitResult.allowed) {
      ws.send(this.responses.rateLimited(rateLimitResult.retryAfter));
      return;
    }

    // ✅ Parse once, reuse
    let parsedMessage;
    try {
      parsedMessage = JSON.parse(message);
    } catch (err) {
      ws.send(this.responses.error('Invalid JSON'));
      return;
    }

    const { event, eventPath, data } = parsedMessage;

    // ✅ Fast ping-pong (no queue)
    if (event === 'ping') {
      ws.send(this.responses.pong(Date.now()));
      return;
    }

    // ✅ Enqueue message processing with priority
    const priority = this.getMessagePriority(event);
    
    this.messageQueue.enqueue(async () => {
      try {
        const routeKey = event === 'url' && eventPath ? eventPath : event;
        const handler = this.wsRoutesCache.get(routeKey);

        if (handler) {
          const wsRequest = {
            event,
            eventPath,
            data,
            user: ws.user,
            userId: ws.userId,
            deviceId: ws.deviceId,
            clientIp: ws.clientIp,
            sessionKey: ws.sessionKey
          };
          
          await handler(ws, wsRequest, this.connectionManager);
        } else {
          ws.send(this.responses.error(`Unknown event: ${event}`));
        }
      } catch (err) {
        logger.error(`Message error for user ${userId}:`, err);
        ws.send(this.responses.error('Processing failed'));
        this.connectionManager.metrics.errors++;
      }
    }, priority);
  }

  getMessagePriority(event) {
    // Higher priority for real-time events
    const highPriority = ['typing', 'presence', 'call'];
    return highPriority.includes(event) ? 10 : 0;
  }
}