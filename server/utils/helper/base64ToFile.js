import fs from "fs";
import path from "path";
import { promisify } from "util";
import axios from "axios"

const writeFileAsync = promisify(fs.writeFile);

async function saveBase64ToFile(base64String, folderPath, fileName) {
  try {
    const rootDirectory = path.join(
      process.cwd(),
      "server",
      "resources",
      folderPath
    );

    // Ensure the folder exists, create if not
    if (!fs.existsSync(rootDirectory)) {
      fs.mkdirSync(rootDirectory, { recursive: true });
    }

    // Remove data URL prefix (e.g., 'data:image/png;base64,')
    const base64Data = base64String.replace(/^data:[^;]+;base64,/, "");


    // Decode base64 and save to file
    const buffer = Buffer.from(base64Data, "base64");
    const filePath = path.join(rootDirectory, `${fileName}`);
    await writeFileAsync(filePath, buffer);
    console.log("filePath",filePath)
    return filePath;
  } catch (error) {
    throw error;
  }
}

export default saveBase64ToFile;
