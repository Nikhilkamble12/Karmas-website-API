//----- Handle Responce code -----

import fs from "fs";
import path from "path";
import { join } from "path";
import { fileURLToPath } from "url";

// Function to create a response object based on given parameters
const createResponse = (
  statusCode,
  message = null,
  data = null,
  isError = false
) => {
  console.log("createResponse",isError)
  // getCodeAndMessage now returns { code, message }
  const codeAndMessage = getCodeAndMessage(message);
   if (!isError) {
    console.log("no error in get");
    // Safely determine length
    const dataLength = Array.isArray(data)
    ? data.length
    : data && typeof data === "object"
    ? Object.keys(data).length
    : 0;
    // If it's not an error response, create a success response object
    return {
      statusCode,
      success: true,
      code: codeAndMessage?.code ?? null,
      dataLength:dataLength,
      message: codeAndMessage?.message ?? message,
      data,
    };
  } else {
    // If it's an error response, create an error response object
    return {
      statusCode,
      success: false,
      code: codeAndMessage?.code ?? null,
      error_message: codeAndMessage?.message ?? message,
      error: data,
    };
  }
};

// const getCode = (message) => {
//   if (message[0] !== 3 && message[0] !== 4) {
//     const __filename = fileURLToPath(import.meta.url);
//     const __dirname = path.dirname(__filename);
//     const filePath = join(__dirname, "..", "json/response.code.json");

//     // const responseData = JSON.parse(fs.readFileSync(filePath));
//     let responseData
//     try {
//       responseData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
//     } catch (err) {
//       console.error(`Error reading response code file: ${err.message}`);
//       return null;
//     }
//     for (const response of responseData.codes) {
//       if (response.message === message) {
//         return response.code;
//       }
//     }
//   } else {
//     return message;
//   }

//   return null; // Error code not found
// };

const getCodeAndMessage = (message) => {
  // if message already looks like a code (starts with 3 or 4), just return it as code
  if (typeof message === "string" && (message[0] === "3" || message[0] === "4")) {
    return { code: message, message: null };
  }

  // otherwise look up in the JSON file
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const filePath = join(__dirname, "..", "json/response.code.json");

  let responseData;
  try {
    responseData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch (err) {
    console.error(`Error reading response code file: ${err.message}`);
    return null;
  }

  // find entry by message
  for (const response of responseData.codes) {
    if (response.message === message) {
      return {
        code: response.code,
        message: response.message,
      };
    }
  }

  // if not found just return original message as message
  return { code: null, message };
};

// Export the createResponse function to make it accessible to other modules
export default createResponse;
