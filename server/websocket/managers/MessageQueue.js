// ============================================================================
// FILE: server/websocket/managers/MessageQueue.js
// ============================================================================
export class MessageQueue {
  constructor(options = {}) {
    this.maxSize = options.maxSize || 10000;
    this.queue = [];
    this.processing = false;
    this.batchSize = options.batchSize || 10; // Process in batches
    this.metrics = {
      processed: 0,
      dropped: 0,
      errors: 0
    };
  }

  enqueue(task, priority = 0) {
    if (this.queue.length >= this.maxSize) {
      this.metrics.dropped++;
      return false;
    }
    
    this.queue.push({ task, priority, timestamp: Date.now() });
    
    // Sort by priority (higher first)
    if (priority > 0) {
      this.queue.sort((a, b) => b.priority - a.priority);
    }
    
    this.process();
    return true;
  }

  async process() {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    
    while (this.queue.length > 0) {
      // Process in batches for better performance
      const batch = this.queue.splice(0, this.batchSize);
      
      await Promise.allSettled(
        batch.map(async ({ task }) => {
          try {
            await task();
            this.metrics.processed++;
          } catch (err) {
            this.metrics.errors++;
            throw err;
          }
        })
      );
    }
    
    this.processing = false;
  }

  getMetrics() {
    return {
      ...this.metrics,
      queueSize: this.queue.length
    };
  }
}