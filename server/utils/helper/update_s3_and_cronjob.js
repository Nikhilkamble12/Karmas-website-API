import db from "../../services/index.js";
import TicketMediaService from "../../services/ticket_media/ticket.media.service.js";
import RequestMediaService from "../../services/request_media/request.media.service.js";
import ngoMediaService from "../../services/ngo_media/ngo.media.service.js";
import PostMediaService from "../../services/PostMedia/postmedia.service.js";

import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({ region: process.env.AWS_REGION });
const BUCKET = process.env.S3_BUCKET;

// 20 minute expiry
const SIGNED_URL_EXPIRY = 1200;

/* ---------------------------------------------------------
   1. Convert a raw S3 public URL into "key" (path inside bucket)
--------------------------------------------------------- */
const extractKey = (url) => {
  if (!url) return null;
  return url.split(".com/")[1];
};

/* ---------------------------------------------------------
   2. Generate Signed URL (single)
--------------------------------------------------------- */
const generateSignedUrl = async (key) => {
  try {
    const command = new GetObjectCommand({ Bucket: BUCKET, Key: key });

    return await getSignedUrl(s3, command, { expiresIn: SIGNED_URL_EXPIRY });
  } catch (err) {
    console.error("Signed URL error:", err);
    return null;
  }
};

/* ---------------------------------------------------------
   3. Batch: Fast parallel signed URL generation
--------------------------------------------------------- */
const generateSignedUrlBatch = async (keys = []) => {
  return await Promise.all(
    keys.map(async (k) => ({
      key: k,
      signed_url: await generateSignedUrl(k),
    }))
  );
};

/* ---------------------------------------------------------
   4. Universal getSignedMedia() → Works for ALL media tables
--------------------------------------------------------- */
export const getSignedMedia = async () => {
  // 1. Fetch all media URLs from every media table
  const [
    ticketMedia,
    requestMedia,
    ngoMedia,
    postMedia,
  ] = await Promise.all([
    // TicketMediaService
    db.RequestMedia.findAll({ raw: true }),
    db.NgoMedia.findAll({ raw: true }),
    db.PostMedia.findAll({ raw: true }),
  ]);

  // Combine all rows into one list
  const allMediaRows = [
    ...ticketMedia,
    ...requestMedia,
    ...ngoMedia,
    ...postMedia,
  ];

  // 2. Extract S3 keys
  const keys = allMediaRows
    .map((item) =>
      extractKey(
        item.media_url ||
        item.media_path ||
        item.file_path ||
        item.url
      )
    )
    .filter(Boolean);

  // 3. Generate signed URLs (parallel)
  const signedResults = await generateSignedUrlBatch(keys);

  // 4. Map back signed URLs to original objects
  const signedMap = {};
  signedResults.forEach((item) => (signedMap[item.key] = item.signed_url));

  // Attach signed URLs to rows
  const finalOutput = allMediaRows.map((row) => {
    const key = extractKey(
      row.media_url || row.media_path || row.file_path || row.url
    );
    return {
      ...row,
      signed_url: key ? signedMap[key] : null,
    };
  });

  return finalOutput;
};

/* ---------------------------------------------------------
   5. Export everything
--------------------------------------------------------- */
export default {
  getSignedMedia,
  generateSignedUrl,
  generateSignedUrlBatch,
};
