import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { CloudFrontClient, CreateInvalidationCommand } from "@aws-sdk/client-cloudfront";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const isProduction = process.env.NODE_ENV == "production";

// 1. Configuration Mapping
const AWS_CONFIG = {
  bucket: isProduction ? process.env.AMAZON_PROD_BUCKET_NAME_S3 : process.env.AMAZON_DEV_BUCKET_NAME_S3,
  accessKey: isProduction ? process.env.AMAZON_PROD_ACCESS_KEY_ID_S3 : process.env.AMAZON_DEV_ACCESS_KEY_ID_S3,
  secretKey: isProduction ? process.env.AMAZON_PROD_SECRET_KEY_ID_S3 : process.env.AMAZON_DEV_SECRET_KEY_ID_S3,
  cdnUrl: isProduction ? process.env.AMAZON_PROD_CLOUDFRONT_URL : process.env.AMAZON_DEV_CLOUDFRONT_URL,
  distId: isProduction ? process.env.AMAZON_PROD_CF_DIST_ID : process.env.AMAZON_DEV_CF_DIST_ID,
  // Prod: 1 year cache | Dev: No cache for testing
  cacheControl: isProduction 
    ? "public, max-age=31536000, immutable" 
    : "no-cache, no-store, must-revalidate",
};

// 2. Initialize Clients
const s3 = new S3Client({
  region: "ap-south-1",
  credentials: { accessKeyId: AWS_CONFIG.accessKey, secretAccessKey: AWS_CONFIG.secretKey },
});

const cloudfront = new CloudFrontClient({
  region: "ap-south-1",
  credentials: { accessKeyId: AWS_CONFIG.accessKey, secretAccessKey: AWS_CONFIG.secretKey },
});

/**
 * Uploads a file to the active bucket and handles CDN invalidation
 */
const uploadFileToS3 = async (s3FolderPath, localFilePath, fileType) => {
  try {
    if (!fs.existsSync(localFilePath)) throw new Error(`File not found: ${localFilePath}`);

    const fileStream = fs.createReadStream(localFilePath);
    const key = `${s3FolderPath}`;

    const params = {
      Bucket: AWS_CONFIG.bucket,
      Key: key,
      Body: fileStream,
      ContentType: fileType,
      CacheControl: AWS_CONFIG.cacheControl,
    };

    // Perform Upload
    const data = await s3.send(new PutObjectCommand(params));

    if (data && data.ETag) {
      // Automatic Invalidation: Only run on Live to clear the 1-year cache
      if (isProduction) {
        await invalidateCDN(key);
      }

      const s3Url = `https://${AWS_CONFIG.bucket}.s3.ap-south-1.amazonaws.com/${key}`;
      const cdnUrl = `https://${AWS_CONFIG.cdnUrl}/${key}`;

      return {
        success: true,
        url: cdnUrl,
        s3_url: s3Url,
        environment: process.env.NODE_ENV,
        cache: AWS_CONFIG.cacheControl
      };
    }
    return { success: false, url: null };
  } catch (err) {
    console.error("Upload Error:", err);
    return { success: false, error: err.message };
  }
};

/**
 * Triggers a CloudFront invalidation for a specific file
 */
const invalidateCDN = async (key) => {
  try {
    const invalidationParams = {
      DistributionId: AWS_CONFIG.distId,
      InvalidationBatch: {
        CallerReference: `inv-${Date.now()}`, 
        Paths: { Quantity: 1, Items: [`/${key}`] },
      },
    };
    await cloudfront.send(new CreateInvalidationCommand(invalidationParams));
    console.log(`CloudFront Cache Cleared for: ${key}`);
  } catch (err) {
    console.error("CloudFront Invalidation Failed:", err);
  }
};

/**
 * Deletes an object based on its URL
 */
const deleteVideoByUrl = async (url) => {
  if (!url) throw new Error("Invalid URL");

  try {
    const parsedUrl = new URL(url);
    const key = decodeURIComponent(parsedUrl.pathname.substring(1));

    await s3.send(new DeleteObjectCommand({
      Bucket: AWS_CONFIG.bucket,
      Key: key,
    }));

    if (isProduction) await invalidateCDN(key);

    console.log(`Deleted successfully: ${key}`);
    return true;
  } catch (error) {
    console.error("Delete failed:", error);
    throw error;
  }
};

export default { uploadFileToS3, deleteVideoByUrl };