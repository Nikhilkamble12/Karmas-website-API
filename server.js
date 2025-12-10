
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
import { join,dirname,resolve } from "path";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import commonResponse from "./server/utils/helper/response.js";
import responseCode from "./server/utils/constants/code/http.status.code.js";
import encrypt from "./server/utils/security/encryption.js";
import decrypt from "./server/utils/security/decryption.js";
import startCluster from "./server/utils/helper/cluster.js";
import https from "https"
import fs from "fs"
import setupWebSocket from "./websocket.config.js";


// import routeValidationMiddleware from "./server/middleware/route_validation/route.validation.js"

dotenv.config();
import db from "./server/services/index.js";
const app = express();
app.use((req, res, next) => {
  
  if (req.headers.upgrade && req.headers.upgrade.toLowerCase() === 'websocket') {
    // Let the server's 'upgrade' event handle this request
    return;
  }
  next();
});
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false,
}));
app.use(cors());
app.use(morgan("dev"));
// Debug Mode (turn on/off)
const DEBUG_MODE = process.env.DEBUG_MODE === "true"; 

// const allowedOrigins = [
//   'https://the-ballard-pier-pvt-ltd.web.app',
//   'http://localhost:4200',
//   'http://localhost:8082',
//   "localhost",
//   "15.207.192.93",
// ];

// app.use((req, res, next) => {
//   const origin = req.headers.origin;
//   if (allowedOrigins.includes(origin)) {
//     res.setHeader('Access-Control-Allow-Origin', origin);
//   }
//   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
//   res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
//   res.setHeader('Access-Control-Allow-Credentials', true);
//   next();
// });


app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});

app.use(express.json({ limit: "100mb" }));
// parameterLimit: Number.MAX_SAFE_INTEGER: This sets the parameterLimit to the maximum safe integer value, which is 9007199254740991
app.use(
  express.urlencoded({ limit: "100mb", extended: true, parameterLimit: Number.MAX_SAFE_INTEGER })
);


// app.use((req, res, next) => {
//   if (
//     req.path !== "/api/v1/decrypt" &&
//     req.path !== "/api/v1/encrypt" &&
//     req.path !== "/"
//   ) {
//     const originalSend = res.send;
//     res.send = function (data) {
//       const encryptedData = encrypt(data);
//       res.setHeader("Content-Type", "application/json");
//       originalSend.call(this, JSON.stringify(encryptedData));
//     };
//   }
//   next();
// });


// app.use((req, res, next) => {
//   // Check if the request is not for decryption or encryption endpoints,
//   // and it's not a GET or DELETE method.
//   if (
//     req.path !== "/api/v1/decrypt" &&
//     req.path !== "/api/v1/encrypt" &&
//     req.method !== "GET" &&
//     req.method !== "DELETE"
//   ) {
//     // Check if the Content-Type is not form data
//     if (!req.is("multipart/form-data")) {
//       const reqBody = req.body;
//       if (reqBody.hasOwnProperty("reqBody")) {
//         if (req.body && req.body.reqBody) {
//           const decryptedData = decrypt(req.body.reqBody);
//           const decryptedObject = decryptedData;
//           req.body = decryptedObject;
//         }
//         next();
//       } else {
//         return res.send(
//           commonResponse(res.statusCode, "Body required!", null, true)
//         );
//       }
//     } else {
//       // If it's form data, skip decryption/encryption
//       next();
//     }
//   } else {
//     next();
//   }
// })


console.log("DEBUG_MODE",DEBUG_MODE)
// Debug incoming API requests
app.use((req, res, next) => {
  if (DEBUG_MODE) {
    console.log("🔥 DEBUG AUTH REQUEST -----------------------");
    console.log("URL:", req.originalUrl);
    console.log("Method:", req.method);
    console.log("Headers:", req.headers);
    console.log("Body:", req.body);
    console.log("---------------------------------------------");
  }
  next();
});

// Create Routes

// Ensure the directory exists before attempting to walk through it
const walkSync = function (dirs, filelist = []) {
  dirs.forEach((dir) => {
    // Normalize the directory to prevent redundant slashes
    const normalizedDir = resolve(dir);  // resolves path to absolute and removes any redundant slashes
    try {
      const files = readdirSync(normalizedDir); // read the directory content
      files.forEach((file) => {
        const filePath = join(normalizedDir, file);
        if (statSync(filePath).isDirectory()) {
          filelist = walkSync([filePath], filelist); // Recursively walk into subdirectories
        } else if (filePath.endsWith('.route.js')) {
          const fileUrlPath = pathToFileURL(filePath).href;
          filelist.push(fileUrlPath);
        }
      });
    } catch (err) {
      console.error(`Error reading directory: ${normalizedDir}`, err); // Handle errors gracefully
    }
  });
  return filelist;
};



const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const baseDir = join(__dirname, "server", "services");
const baseDirs = [
  join(__dirname, "server", "services"),
  // join(__dirname, "server", "third-party-services"), // Add your additional folders here
];
app.use('/resources', express.static(path.resolve(__dirname, 'server','resources')));
// const routes = walkSync(baseDir);
const routes = walkSync(baseDirs);

app.use((err, req, res, next) => {
  logger.error(req.path + " Error in Server File ---> " + err);
  console.log("err",err)
  res.status(responseCode.METHOD_NOT_ALLOWED);
    commonResponse(
      req,
      responseCode.METHOD_NOT_ALLOWED,
      "API endpoint not found.",
      null,
      err.message
    )
});

app.use((req, res, next) => {
  res.header("X-Content-Type-Options", "nosniff");
  res.header("X-Frame-Options", "DENY");
  res.header("X-XSS-Protection", "1; mode=block");
  next();
});

app.get("/", (req, res) => {
  const workerId = cluster.worker ? cluster.worker.id : "Master";
  const message = `Welcome to Massom from Worker ${workerId}.`;
  return res.json({ message });
});
// app.get('/api/v1/wsauth', (req, res) => {
//   res.status(426).send('Please upgrade to WebSocket.');
// });


// Define the initial port
const PORT = 3000;


// // Try to bind to the given port, or use a random port if the desired one is in use
// const tryListenOnPort = (app, port, callback) => {
//   app.listen(PORT, (err) => {
//     if (err) {
//       logger.error(`Port ${port} is not available. Trying another port...`);
//     } else {
//       logger.info(`Server is running on port ${port}.`);
//       consoleLogger.log(`Server is running on port ${port}.`);
//       if (callback) callback(port); // Execute the callback with the successful port
//     }
//   });
// };
const tryListenOnPort = (app, port, callback) => {
  const server = app.listen(port, (err) => {
    if (err) {
      logger.error(`Port ${port} is not available. Trying another port...`);
    } else {
      logger.info(`Server is running on port ${port}.`);
      consoleLogger.log(`Server is running on port ${port}.`);
      if (callback) callback(port); // Execute the callback with the successful port

      // 👇 Add this line to initialize WebSocket:
      setupWebSocket(server);
    }
  });
};
Promise.all(
  routes.map(async (route) => {
    try {
      const { default: routeModule } = await import(route);
      if (typeof routeModule === "function") {
        await import(route);
        app.use(routeModule);
      } else {
        console.error(`❌ Route ${route} and ${routeModule} does not export a function.`);
        logger.error(`Error in Server File ---> ${routeModule} does not export a function.`);
      }
    } catch (error) {
      console.log("error",error)
      logger.error(`Error in Server File ---> ${error}`);
    }
  })
).then(() => {
  // Attempt to listen on the initial port, or fallback to a random port
  tryListenOnPort(app, PORT, (port) => {
    logger.info(`Server started successfully on port ${port}`);
    console.log(`Server started successfully on port ${port}`)
  });
}).catch((error) => {
  logger.error(`Error in starting the server: ${error.message}`, { stack: error.stack });
});

