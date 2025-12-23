import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

import fs from "fs";
import dotenv from "dotenv";
dotenv.config();


const BUCKET_NAME = "karmas-media-live";

// Initialize the S3 client
const s3 = new S3Client({
  region: "ap-south-1", // Specify your region
  credentials: {
    accessKeyId: process.env.AMAZON_ACCESS_KEY_ID_S3,
    secretAccessKey: process.env.AMAZON_SECRET_KEY_ID_S3,
  },
  // logger: console
});

const uploadFileToS3 = async (s3FolderPath, localFilePath, fileType) => {
  try {
    // Construct the key for the file in the S3 bucket (using custom folder and file name)
    // Validate local file
    if (!fs.existsSync(localFilePath)) {
      throw new Error(`Local file not found: ${localFilePath}`);
    }
    const key = `${s3FolderPath}`;
    const fileStream = fs.createReadStream(localFilePath);

    // Set up the S3 upload parameters
    const params = {
      Bucket: BUCKET_NAME, // Your S3 Bucket name
      Key: key, // S3 object key (file path)
      Body: fileStream, // File body (streamed from local path)
      ContentType: fileType, // MIME type
      // ACL: "public-read", // Optional: Public read access
      CacheControl: "public, max-age=604800", // 7 days
    };

    // Upload the file to S3 using PutObjectCommand
    const command = new PutObjectCommand(params);
    const data = await s3.send(command);

    // Check if the upload was successful and return the URL
    if (data && data.ETag) {
      // Manually generate the URL based on the bucket name, region, and key
      const fileUrl = `https://${params.Bucket}.s3.ap-south-1.amazonaws.com/${params.Key}`;
      const cdnUrl = `https://d2o6b6doi50fow.cloudfront.net/${key}`;
      // const fileUrl = `https://${params.Bucket}.s3.${s3.config.region}.amazonaws.com/${params.Key}`;
      return {
        success: true,
        url: cdnUrl,
        s3_url: fileUrl,
        expiry_time: 604800,
      }; // Success: Return the URL
    } else {
      return { success: false, url: null, s3_url: null, expiry_time: 604800 }; // Failure: Return null for URL
    }
  } catch (err) {
    console.log("err", err);
    console.error("Error uploading file to S3:", err);
    return { success: false, url: null }; // Return failure
  }
};

const deleteVideoByUrl = async (url) => {
  if (!url || typeof url !== "string") {
    throw new Error("Invalid S3 URL");
  }

  try {
    const bucketName = "karmas-media-live";

    // Handle both virtual-hosted–style and path-style URLs
    const parsedUrl = new URL(url);

    // Remove leading slash
    const key = decodeURIComponent(parsedUrl.pathname.substring(1));

    if (!key) {
      throw new Error("Unable to extract S3 object key");
    }

    const params = {
      Bucket: bucketName,
      Key: key,
    };

    await s3.send(new DeleteObjectCommand(params));

    console.log(`Deleted S3 object successfully: ${key}`);
    return true;
  } catch (error) {
    console.error("S3 delete failed:", error);
    throw error;
  }
};

export default { uploadFileToS3, deleteVideoByUrl };
