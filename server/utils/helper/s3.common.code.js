import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { CloudFrontClient, CreateInvalidationCommand } from "@aws-sdk/client-cloudfront";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const isProduction = process.env.NODE_ENV === "production";

// 1. Configuration Mapping
const AWS_CONFIG = {
  bucket: isProduction ? process.env.AMAZON_PROD_BUCKET_NAME_S3 : process.env.AMAZON_DEV_BUCKET_NAME_S3,
  accessKey: isProduction ? process.env.AMAZON_PROD_ACCESS_KEY_ID_S3 : process.env.AMAZON_DEV_ACCESS_KEY_ID_S3,
  secretKey: isProduction ? process.env.AMAZON_PROD_SECRET_KEY_ID_S3 : process.env.AMAZON_DEV_SECRET_KEY_ID_S3,
  cdnUrl: isProduction ? process.env.AMAZON_PROD_CLOUDFRONT_URL : process.env.AMAZON_DEV_CLOUDFRONT_URL,
  distId: isProduction ? process.env.AMAZON_PROD_CF_DIST_ID : process.env.AMAZON_DEV_CF_DIST_ID,
  // Cache-Control: 1 year for Live (Aggressive), 0 seconds for Dev (Testing)
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
    // Sanitize path: Ensure no backslashes and remove duplicate slashes
    const key = s3FolderPath.replace(/\\/g, '/').replace(/\/+/g, '/');

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
      // Automatic Invalidation: Only run on Live to clear the aggressive 1-year cache
      // We wrap it so a CloudFront error doesn't break the whole upload flow
      if (isProduction) {
        try {
          await invalidateCDN(key);
        } catch (cfErr) {
          console.error("CloudFront Invalidation warning:", cfErr.message);
        }
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
 * FIX: Ensures the path starts with '/' as required by AWS API
 */
const invalidateCDN = async (key) => {
  try {
    // CloudFront requires a leading slash / for all invalidation paths
    const invalidationPath = key.startsWith('/') ? key : `/${key}`;

    const invalidationParams = {
      DistributionId: AWS_CONFIG.distId,
      InvalidationBatch: {
        CallerReference: `inv-${Date.now()}`, 
        Paths: { 
          Quantity: 1, 
          Items: [invalidationPath] 
        },
      },
    };
    await cloudfront.send(new CreateInvalidationCommand(invalidationParams));
    console.log(`✅ CloudFront Cache Cleared for: ${invalidationPath}`);
  } catch (err) {
    console.error("❌ CloudFront Invalidation Failed:", err.message);
    throw err; // Let the caller know, but uploadFileToS3 handles this gracefully
  }
};

/**
 * Deletes an object based on its URL
 */
const deleteVideoByUrl = async (url) => {
  if (!url) throw new Error("Invalid URL");

  try {
    const parsedUrl = new URL(url);
    // Extract key and remove the leading slash for S3 operations
    let key = decodeURIComponent(parsedUrl.pathname);
    if (key.startsWith('/')) key = key.substring(1);

    await s3.send(new DeleteObjectCommand({
      Bucket: AWS_CONFIG.bucket,
      Key: key,
    }));

    // Invalidate the deleted file so it's gone from CDN immediately
    if (isProduction) {
      try {
        await invalidateCDN(key);
      } catch (cfErr) {
        console.error("CloudFront Delete Invalidation warning:", cfErr.message);
      }
    }

    console.log(`Deleted successfully from ${AWS_CONFIG.bucket}: ${key}`);
    return true;
  } catch (error) {
    console.error("Delete failed:", error);
    throw error;
  }
};

export default { uploadFileToS3, deleteVideoByUrl };