// walkSync.js
import { readdirSync, statSync } from 'fs';
import { join, resolve } from 'path';
import { pathToFileURL } from 'url';
import logger from "../../config/winston_logs/winston.js"

export function walkSync(dirs, filelist = []) {
  dirs.forEach((dir) => {
    const normalizedDir = resolve(dir);
    try {
      const files = readdirSync(normalizedDir);
      files.forEach((file) => {
        const filePath = join(normalizedDir, file);
        if (statSync(filePath).isDirectory()) {
          filelist = walkSync([filePath], filelist);
        } else if (filePath.endsWith('.wsroute.js')) {
          filelist.push(pathToFileURL(filePath).href);
        }
      });
    } catch (err) {
        logger.error(`Error reading directory: ${normalizedDir}`, err);
      console.error(`Error reading directory: ${normalizedDir}`, err);
    }
  });
  return filelist;
}

// wsRouter.js
 class WsRouter {
  constructor() {
    this.routes = new Map(); // eventPath -> handler
  }

  on(eventPath, handler) {
    if (!eventPath.startsWith('/')) {
      throw new Error(`WebSocket route "${eventPath}" must start with a "/"`);
    }
    this.routes.set(eventPath, handler);
  }

  getRoutes() {
    return this.routes;
  }
}


export async function loadWsRoutes(baseDirs,activeConnections) {
  const wsRouter = new WsRouter();
  const routeFiles = walkSync(baseDirs);

  for (const routeFile of routeFiles) {
    try {
      const { default: defineRoutes } = await import(routeFile);
      if (typeof defineRoutes === 'function') {
        defineRoutes(wsRouter,activeConnections);
        console.log(`✔️ WebSocket routes loaded from ${routeFile}`);
      } else {
        console.error(`❌ Route ${routeFile} does not export a function.`);
        logger.error(`Error in Server File ---> ${routeFile} does not export a function.`);
      }
    } catch (err) {
        logger.error(`❌ Failed to load WebSocket route ${routeFile}:`, err);
      console.error(`❌ Failed to load WebSocket route ${routeFile}:`, err);
    }
  }

  return wsRouter.getRoutes();
}

