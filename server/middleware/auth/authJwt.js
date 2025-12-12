// //----- Validate JWT Token

// import jwt from "jsonwebtoken";
// import { secret } from "../../config/auth/auth.config.js";
// import responseCode from "../../utils/constants/code/http.status.code.js";
// import responseConst from "../../utils/constants/response/response.constant.js";
// import commonResponse from "../../utils/helper/response.js";

// const authenticate = (req, res, next) => {
//   let token = req.headers["x-access-token"];
//   if (!token) {
//     return res
//       .status(responseCode.UNAUTHORIZED)
//       .send(
//         commonResponse(
//           responseCode.INTERNAL_SERVER_ERROR,
//           responseConst.NO_TOKEN,
//           null,
//           true
//         )
//       );
//   }

//   jwt.verify(token, secret, (err, decoded) => {
//     console.log("err",err)
//     if (err) {
//       return res
//         .status(responseCode.UNAUTHORIZED)
//         .send(
//           commonResponse(
//             responseCode.BAD_REQUEST,
//             responseConst.UNAUTHORIZED,
//             null,
//             true
//           )
//         );
//     }
//     req.userId = decoded.id;
//     next();
//   });
// };

// export default authenticate;


// ============================================================================
// FILE: server/middleware/auth/authJwt.js
// OPTIMIZED JWT AUTHENTICATION - FASTER EXECUTION
// ============================================================================

import jwt from "jsonwebtoken";
import { secret } from "../../config/auth/auth.config.js";
import responseCode from "../../utils/constants/code/http.status.code.js";
import responseConst from "../../utils/constants/response/response.constant.js";
import commonResponse from "../../utils/helper/response.js";
import logger from "../../config/winston_logs/winston.js";

// ============================================================================
// OPTIMIZATION 1: Pre-compute common responses (cache them)
// ============================================================================
const CACHED_RESPONSES = {
  NO_TOKEN: commonResponse(responseCode.FORBIDDEN, responseConst.NO_TOKEN, null, true),
  CONFIG_ERROR: commonResponse(responseCode.INTERNAL_SERVER_ERROR, "Server configuration error", null, true),
  INVALID_PAYLOAD: commonResponse(responseCode.UNAUTHORIZED, responseConst.INVALID_TOKEN_PAYLOAD, null, true),
  SERVICE_ERROR: commonResponse(responseCode.INTERNAL_SERVER_ERROR, "Authentication service error", null, true),
};

// ============================================================================
// OPTIMIZATION 2: Pre-compile regex patterns for token extraction
// ============================================================================
const BEARER_REGEX = /^Bearer\s+/i;

// ============================================================================
// OPTIMIZATION 3: Validate secret once at startup
// ============================================================================
const SECRET_CONFIGURED = !!secret;
if (!SECRET_CONFIGURED) {
  console.error("⚠️  CRITICAL: JWT secret not configured!");
}

// ============================================================================
// OPTIMIZATION 4: JWT verify options (reuse object)
// ============================================================================
const JWT_VERIFY_OPTIONS = {
  algorithms: ["HS256"], // ✅ Use only one algorithm for better performance
  clockTolerance: 30,
};

// ============================================================================
// MAIN AUTHENTICATION MIDDLEWARE - OPTIMIZED
// ============================================================================
const authenticate = (req, res, next) => {
  // ✅ OPTIMIZATION 5: Fast token extraction (no optional chaining in hot path)
  const authHeader = req.headers.authorization;
  const token = 
    req.headers["x-access-token"] || 
    (authHeader && BEARER_REGEX.test(authHeader) ? authHeader.replace(BEARER_REGEX, "") : null) ||
    req.query.token;

  // ✅ OPTIMIZATION 6: Early returns with cached responses
  if (!token) {
    if (process.env.LOG_AUTH_FAILURES === "true") {
      logger.warn(`No token | IP: ${req.ip} | Path: ${req.path}`);
    }
    return res.status(responseCode.FORBIDDEN).send(CACHED_RESPONSES.NO_TOKEN);
  }

  if (!SECRET_CONFIGURED) {
    logger.error("JWT secret not configured!");
    return res.status(responseCode.INTERNAL_SERVER_ERROR).send(CACHED_RESPONSES.CONFIG_ERROR);
  }

  // ✅ OPTIMIZATION 7: Use try-catch only around jwt.verify (not the whole function)
  jwt.verify(token, secret, JWT_VERIFY_OPTIONS, (err, decoded) => {
    if (err) {
      // ✅ OPTIMIZATION 8: Streamlined error handling
      const errorResponse = handleJWTError(err, req);
      return res.status(errorResponse.statusCode).send(errorResponse.response);
    }

    // ✅ OPTIMIZATION 9: Fast payload validation (single condition)
    if (!decoded?.user_id) {
      if (process.env.LOG_AUTH_FAILURES === "true") {
        logger.error(`Invalid payload | IP: ${req.ip} | Path: ${req.path}`);
      }
      return res.status(responseCode.UNAUTHORIZED).send(CACHED_RESPONSES.INVALID_PAYLOAD);
    }

    // ✅ OPTIMIZATION 10: Minimal object assignment
    req.userId = decoded.user_id;
    req.user = decoded;
    req.tokenIssuedAt = decoded.iat;
    req.tokenExpiresAt = decoded.exp;

    next();
  });
};

// ============================================================================
// OPTIMIZATION 11: Separate error handler function (called only on errors)
// ============================================================================
const handleJWTError = (err, req) => {
  let errorMessage = responseConst.UNAUTHORIZED;
  let statusCode = responseCode.UNAUTHORIZED;
  let shouldLog = process.env.LOG_AUTH_FAILURES === "true";

  switch (err.name) {
    case "TokenExpiredError":
      errorMessage = responseConst.TOKEN_EXPIRED;
      if (shouldLog) {
        logger.warn(`Token expired | IP: ${req.ip} | Path: ${req.path}`);
      }
      break;

    case "JsonWebTokenError":
      // ✅ OPTIMIZATION 12: Use includes() instead of regex for faster string matching
      const msg = err.message;
      if (msg.includes("invalid signature")) {
        errorMessage = responseConst.INVALID_TOKEN_SIGNATURE;
      } else if (msg.includes("jwt malformed")) {
        errorMessage = responseConst.MALFORMED_TOKEN;
        statusCode = responseCode.BAD_REQUEST;
      } else if (msg.includes("invalid algorithm")) {
        errorMessage = responseConst.INVALID_TOKEN_ALGORITHM;
        statusCode = responseCode.BAD_REQUEST;
      }
      if (shouldLog) {
        logger.warn(`JWT error: ${msg} | IP: ${req.ip} | Path: ${req.path}`);
      }
      break;

    case "NotBeforeError":
      errorMessage = responseConst.TOKEN_NOT_ACTIVE;
      if (shouldLog) {
        logger.warn(`Token not active | IP: ${req.ip} | Path: ${req.path}`);
      }
      break;

    default:
      if (shouldLog) {
        logger.error(`Unexpected JWT error: ${err.name} | IP: ${req.ip} | Path: ${req.path}`);
      }
  }

  return {
    statusCode,
    response: commonResponse(statusCode, errorMessage, null, true),
  };
};
export default authenticate;
