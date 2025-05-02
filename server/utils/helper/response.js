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
  if (!isError) {
    console.log("no error in get");

    // If it's not an error response, create a success response object
    return {
      statusCode,
      success: true,
      message: getCode(message), // Removed getCode() call for simplicity
      data,
    };
  } else {
    // If it's an error response, create an error response object
    return {
      statusCode,
      success: false,
      error_message: getCode(message), // Removed getCode() call for simplicity
      error: data,
    };
  }
};

const getCode = (message) => {
  if (message[0] !== 3 && message[0] !== 4) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const filePath = join(__dirname, "..", "json/response.code.json");

    // const responseData = JSON.parse(fs.readFileSync(filePath));
    let responseData
    try {
      responseData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch (err) {
      console.error(`Error reading response code file: ${err.message}`);
      return null;
    }
    for (const response of responseData.codes) {
      if (response.message === message) {
        return response.code;
      }
    }
  } else {
    return message;
  }

  return null; // Error code not found
};

// Export the createResponse function to make it accessible to other modules
export default createResponse;
