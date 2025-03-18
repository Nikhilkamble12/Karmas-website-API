
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
import { join } from "path";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import commonResponse from "./server/utils/helper/response.js";
import responseCode from "./server/utils/constants/code/http.status.code.js";
import encrypt from "./server/utils/security/encryption.js";
import decrypt from "./server/utils/security/decryption.js";
import startCluster from "./server/utils/helper/cluster.js";
import https from "https"

// import routeValidationMiddleware from "./server/middleware/route_validation/route.validation.js"

dotenv.config();
import db from "./server/services/index.js";
const app = express();
app.use(express.json()); // This is necessary for parsing JSON request bodies
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));

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



// Create Routes

const walkSync = function (dirs, filelist = []) {
  dirs.forEach((dir) => {
    // Ensure the directory is resolved correctly to work across platforms
    const files = readdirSync(dir);
    files.forEach((file) => {
      const filePath = join(dir, file); // use join to handle paths correctly
      if (statSync(filePath).isDirectory()) {
        filelist = walkSync([filePath], filelist); // Recursively walk into subdirectories
      } else if (filePath.endsWith('.route.js')) {
        const fileUrlPath = pathToFileURL(filePath).href;
        filelist.push(fileUrlPath);
      }
    });
  });
  return filelist;
};



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const baseDir = join(__dirname, "server", "services");
const baseDirs = [
  join(__dirname, "server", "services"),
  join(__dirname, "server", "third-party-services"), // Add your additional folders here
];

// const routes = walkSync(baseDir);
const routes = walkSync(baseDirs);

app.use((err, req, res, next) => {
  logger.error(req.path + " Error in Server File ---> " + err);
  res.status(responseCode.METHOD_NOT_ALLOWED);
  res.json(
    commonResponse(
      req,
      responseCode.METHOD_NOT_ALLOWED,
      "API endpoint not found.",
      null,
      err.message
    )
  );
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


// // const PORT = process.env.PORT || 8089;
// const PORT = 8080;
// // Helper function to find a random available port
// const getRandomPort = (min, max) => {
//   return Math.floor(Math.random() * (max - min + 1)) + min;
// };

// // Try to bind to the given port, or use a random port if the desired one is in use
// const tryListenOnPort = (app, port, callback) => {
//   app.listen(PORT, (err) => {
//     console.log("err",err)
//     if (err) {
//       logger.error(`Port ${port} is not available. Trying another port...`);
//       // If the port is taken, try with a random port between 3000 and 5000
//       const randomPort = getRandomPort(3000, 5000);
//       logger.info(`Trying to bind to a random port: ${randomPort}`);
//       tryListenOnPort(app, randomPort, callback); // Recursively attempt to listen on a random port
//     } else {
//       logger.info(`Server is running on port ${port}.`);
//       consoleLogger.log(`Server is running on port ${port}.`);
//       if (callback) callback(port); // Execute the callback with the successful port
//     }
//   });
// };
// Promise.all(
//   routes.map(async (route) => {
//     // console.log("route",route)
//     try {
//       const { default: routeModule } = await import(route);
//       if (typeof routeModule === "function") {
//         await import(route);
//         app.use(routeModule);
//         // console.log("app.use(routeModule)",app.use(routeModule))
//       } else {
//         logger.error(
//           `Error in Server File ---> ${route} does not export a function.`
//         );
//       }
//     } catch (error) {
//       console.log("error",error)
//       logger.error(`Error in Server File ---> ${error}`);
//     }
//   })
// )
// // ).then(() => {
// //   startCluster((clusterObj) => {
// //     app.listen(PORT,'0.0.0.0',(err) => {
// //       if (err) {
// //         logger.error(`Error starting server on port ${PORT}: ${err.message}`, { stack: err.stack });
// //         return;
// //       }
// //       if (clusterObj.worker) {
// //         logger.info(
// //           `Worker ${clusterObj.worker.id} is running on port ${PORT}.`
// //         );
// //         consoleLogger.log(
// //           `Worker ${clusterObj.worker.id} is running on port ${PORT}.`
// //         );
// //       } else {
// //         logger.info(`Master process is running on port ${PORT}.`);
// //         consoleLogger.log(`Master process is running on port ${PORT}.`);
// //       }
// //     });
// //   }, cluster);
// // }).catch((error) => {
// //   // Log if there is an issue with the Promise.all
// //   logger.error(`Error in starting the server: ${error.message}`, { stack: error.stack });
// // });
// .then(() => {
//   // app.listen(PORT, '0.0.0.0', (err) => {
//   //   if (err) {
//   //     logger.error(`Error starting server on port ${PORT}: ${err.message}`, { stack: err.stack });
//   //     return;
//   //   }
//   //   logger.info(`Server is running on port ${PORT}.`);
//   //   consoleLogger.log(`Server is running on port ${PORT}.`);
//   // });
//   tryListenOnPort(app, PORT)
// }).catch((error) => {
//   logger.error(`Error in starting the server: ${error.message}`, { stack: error.stack });
// })


// Define the initial port
const PORT = 3000;

// Helper function to find a random available port
const getRandomPort = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Try to bind to the given port, or use a random port if the desired one is in use
const tryListenOnPort = (app, port, callback) => {
  app.listen(PORT, (err) => {
    if (err) {
      logger.error(`Port ${port} is not available. Trying another port...`);
      
      // If the port is taken, try with a random port between 3000 and 5000
      const randomPort = getRandomPort(3000, 5000);
      logger.info(`Trying to bind to a random port: ${randomPort}`);
      
      // Recursively attempt to listen on a random port
      tryListenOnPort(app, randomPort, callback);
    } else {
      logger.info(`Server is running on port ${port}.`);
      consoleLogger.log(`Server is running on port ${port}.`);
      if (callback) callback(port); // Execute the callback with the successful port
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
        logger.error(`Error in Server File ---> ${route} does not export a function.`);
      }
    } catch (error) {
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

