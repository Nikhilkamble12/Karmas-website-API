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
  cacheControl: isProduction 
    ? "public, max-age=31536000, immutable" 
    : "no-cache, no-store, must-revalidate",
};

// Validate required configuration
const validateConfig = () => {
  const required = ['bucket', 'accessKey', 'secretKey'];
  const missing = required.filter(key => !AWS_CONFIG[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing AWS configuration: ${missing.join(', ')}`);
  }
};

// 2. Initialize Clients
const s3 = new S3Client({
  region: "ap-south-1",
  credentials: { 
    accessKeyId: AWS_CONFIG.accessKey, 
    secretAccessKey: AWS_CONFIG.secretKey 
  },
  maxAttempts: 3, // Retry failed requests
  requestHandler: {
    connectionTimeout: 10000, // 10 seconds
    socketTimeout: 10000,
  }
});

const cloudfront = new CloudFrontClient({
  region: "ap-south-1",
  credentials: { 
    accessKeyId: AWS_CONFIG.accessKey, 
    secretAccessKey: AWS_CONFIG.secretKey 
  },
  maxAttempts: 3,
  requestHandler: {
    connectionTimeout: 10000,
    socketTimeout: 10000,
  }
});

/**
 * Uploads a file to the active bucket and handles CDN invalidation
 */
const uploadFileToS3 = async (s3FolderPath, localFilePath, fileType) => {
  try {
    // Validate configuration first
    validateConfig();

    if (!fs.existsSync(localFilePath)) {
      throw new Error(`File not found: ${localFilePath}`);
    }

    const fileStream = fs.createReadStream(localFilePath);
    const key = `${s3FolderPath}`;

    const params = {
      Bucket: AWS_CONFIG.bucket,
      Key: key,
      Body: fileStream,
      ContentType: fileType,
      CacheControl: AWS_CONFIG.cacheControl,
    };

    // Perform Upload with connection error handling
    let data;
    try {
      data = await s3.send(new PutObjectCommand(params));
    } catch (uploadError) {
      // Handle specific AWS SDK errors
      if (uploadError.name === 'NetworkingError' || 
          uploadError.code === 'ENOTFOUND' || 
          uploadError.code === 'ETIMEDOUT' ||
          uploadError.code === 'ECONNREFUSED') {
        throw new Error(`S3 connection failed: Unable to reach AWS servers. ${uploadError.message}`);
      }
      
      if (uploadError.name === 'CredentialsError' || 
          uploadError.code === 'InvalidAccessKeyId' ||
          uploadError.code === 'SignatureDoesNotMatch') {
        throw new Error(`S3 authentication failed: Invalid AWS credentials. ${uploadError.message}`);
      }
      
      if (uploadError.code === 'NoSuchBucket') {
        throw new Error(`S3 bucket not found: ${AWS_CONFIG.bucket}`);
      }
      
      if (uploadError.code === 'AccessDenied') {
        throw new Error(`S3 access denied: Check bucket permissions for ${AWS_CONFIG.bucket}`);
      }
      
      // Re-throw with more context
      throw new Error(`S3 upload failed: ${uploadError.message}`);
    }

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
    
    throw new Error("Upload completed but no ETag received from S3");
    
  } catch (err) {
    console.error("Upload Error:", err);
    throw err; // Re-throw to let caller handle it
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
    // Handle CloudFront specific errors
    if (err.name === 'NetworkingError' || 
        err.code === 'ENOTFOUND' || 
        err.code === 'ETIMEDOUT') {
      throw new Error(`CloudFront connection failed: ${err.message}`);
    }
    
    if (err.code === 'NoSuchDistribution') {
      throw new Error(`CloudFront distribution not found: ${AWS_CONFIG.distId}`);
    }
    
    console.error("CloudFront Invalidation Failed:", err);
    throw new Error(`CloudFront invalidation failed: ${err.message}`);
  }
};

/**
 * Deletes an object based on its URL
 */
const deleteVideoByUrl = async (url) => {
  if (!url) throw new Error("Invalid URL: URL is required");

  try {
    validateConfig();
    
    const parsedUrl = new URL(url);
    const key = decodeURIComponent(parsedUrl.pathname.substring(1));

    if (!key) {
      throw new Error("Invalid URL: Could not extract S3 key from URL");
    }

    try {
      await s3.send(new DeleteObjectCommand({
        Bucket: AWS_CONFIG.bucket,
        Key: key,
      }));
    } catch (deleteError) {
      // Handle S3 delete errors
      if (deleteError.name === 'NetworkingError' || 
          deleteError.code === 'ENOTFOUND' || 
          deleteError.code === 'ETIMEDOUT') {
        throw new Error(`S3 connection failed during delete: ${deleteError.message}`);
      }
      
      if (deleteError.code === 'NoSuchKey') {
        throw new Error(`File not found in S3: ${key}`);
      }
      
      throw new Error(`S3 delete failed: ${deleteError.message}`);
    }

    if (isProduction) await invalidateCDN(key);

    console.log(`Deleted successfully: ${key}`);
    return true;
    
  } catch (error) {
    console.error("Delete failed:", error);
    throw error;
  }
};

export default { uploadFileToS3, deleteVideoByUrl };