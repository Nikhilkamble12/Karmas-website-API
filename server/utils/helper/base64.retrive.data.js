import fs from "fs";
import path from "path";
import { promisify } from "util";

const readFileAsync = promisify(fs.readFile);

async function getBase64FromFile(file_path) {
  try {
    const __dirname = path.dirname(
      new URL(import.meta.url).pathname
    );
    const filePath2 = path.join(
      __dirname,
      "..",
      "..",
      "resources",
      String(file_path)
    );
    
    console.log("filePath2",filePath2)
    // Check if the file exists
    if (!fs.existsSync(filePath2)) {
      return null;
    }

    // Read file data as base64
    const fileData = await readFileAsync(filePath2, "base64");
    return fileData;
  } catch (error) {
    //console.error(`Error reading file ${fileName}:`, error);
    throw error;
  }
}

export default getBase64FromFile;

