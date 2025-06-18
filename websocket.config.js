
// import WebSocket from 'ws';
// import { WebSocketServer } from 'ws';

import pkg from 'ws';
const { WebSocketServer } = pkg;

import jwt from 'jsonwebtoken';
import url from 'url';
import { loadWsRoutes } from './server/middleware/ws_route_middleware/wsRouterLoader.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import logger from "./server/config/winston_logs/winston.js"

const activeConnections = new Map();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const baseDirs = [
  join(__dirname, "server", 'ws-Services')
];

async function setupWebSocket(server) {
  console.log("🛠️ Setting up WebSocket upgrade handler...")
  const wss = new WebSocketServer({ noServer: true });
  const wsRoutes = await loadWsRoutes(baseDirs,activeConnections);
  console.log("wsRoutes---->",wsRoutes)
  wss.on('error', (err) => {
  logger.error("WebSocket error: " + err);
});

  server.on('upgrade', (req, socket, head) => {
    try{
    console.log("🔧 Upgrade request received");
    console.log("Upgrade request received", req.headers);
    const parsedUrl = url.parse(req.url, true);
    console.log('Incoming upgrade path:', parsedUrl.pathname);
    // ✅ Only allow upgrades on /api/v1/auth
    if (parsedUrl.pathname !== '/api/v1/wsauth') {
      socket.write('HTTP/1.1 404 Not Found\r\n\r\n');
      socket.destroy();
      return;
    }

    const token = parsedUrl.query.token || req.headers['sec-websocket-protocol'];
    if (!token) {
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      socket.destroy();
      return;
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        socket.write('HTTP/1.1 403 Forbidden\r\n\r\n');
        socket.destroy();
        return;
      }

      wss.handleUpgrade(req, socket, head, (ws) => {
        ws.user = decoded;
        wss.emit('connection', ws, req);
      });
    });
    }catch(error){
        logger.error(req.url + " Error in upgrade handler ---> " + err);
    }
  });


  wss.on('connection', (ws) => {
    const userId = ws.user.user_id;
    activeConnections.set(userId, ws);
    console.log(`✅ User ${userId} connected.`);

    ws.on('message', async (message) => {
      try {
        const { event,eventPath,token,data, } = JSON.parse(message);
         // Built-in ping-pong handling
        if (event == 'ping') {
          ws.send(JSON.stringify({ event: 'pong', data: `Pong from server at ${new Date().toISOString()}` }));
          return;
        }
        let handler
        if (event === 'url' && eventPath) {
          handler = wsRoutes.get(eventPath);
        } else {
          handler = wsRoutes.get(event);
        }        
        console.log("handler",handler)

        if (handler) {
          const wsRequest = {
            event,
            eventPath,
            data,
            user: ws.user,
            query: url.parse(ws.upgradeReq?.url || '', true).query,
            headers: ws.upgradeReq?.headers || {},
          };
          await handler(ws,wsRequest);
        } else {
          ws.send(JSON.stringify({ event: 'error', data: `Unknown event: ${event}` }));
        }
      } catch (err) {
        ws.send(JSON.stringify({ event: 'error', data: 'Invalid JSON format' }));
      }
    });   

    ws.on('close', () => {
      activeConnections.delete(userId);
      console.log(`❌ User ${userId} disconnected.`);
    });
  });

  return wss;
}
export default setupWebSocket;

