import { fileURLToPath } from 'url'; // Importing fileURLToPath to convert URL to file path
import PostMediaController from "./postmedia.controller.js";
import commonPath from "../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
const {express,verifyToken,basePathRoute,multer,path,fs} = commonPath

// Define the base path for routes
const basePath=`${basePathRoute}/postmedia` 
const router = express.Router()

// Convert import.meta.url to a file path
const __filename = fileURLToPath(import.meta.url);

// Get the directory name of the current module
const __dirname = path.dirname(__filename);

// Join the path to get the full uploads directory path
const uploadDir = path.join(__dirname, 'uploads');

// Create 'uploads' directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Allowed file types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/mpeg', 'video/quicktime'];
const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];

// File size limits (in bytes)
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB


// Route to create a new record

router.post(
    `${basePath}/create`,
    verifyToken,
    PostMediaController.create
)

// Route to update an existing record by ID
router.put(
    `${basePath}/update`,
    verifyToken,
    PostMediaController.update
)

// Route to retrieve all records
router.get(
    `${basePath}`,
    verifyToken,
    PostMediaController.getALLByView
)

// Route to retrieve a record by ID
router.get(
    `${basePath}/getById`,
    verifyToken,
    PostMediaController.getByIdByView
)

// Route to delete a record by ID     
router.delete(
    `${basePath}/delete`,
    verifyToken,
    PostMediaController.deleteData
)


// --- The Unified Middleware ---
const fastMediaUpload = (req, res, next) => {
  const upload = multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => cb(null, uploadDir),
      filename: (req, file, cb) => {
        const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        cb(null, `${Date.now()}-${safeName}`);
      }
    }),
    fileFilter: (req, file, cb) => {
      if (!ALLOWED_TYPES.includes(file.mimetype)) {
        return cb(new Error('Unsupported file format'), false);
      }
      cb(null, true);
    },
    limits: { fileSize: MAX_VIDEO_SIZE } 
  }).single('mediaFile'); // <-- Explicitly using your field name 'mediaFile'

  // Execute the upload and validation in one go
  upload(req, res, (err) => {
    // 1. Handle Multer or Filter errors
    if (err) {
      const msg = err.code === 'LIMIT_FILE_SIZE' ? `File exceeds ${MAX_VIDEO_SIZE/1024/1024}MB` : err.message;
      return res.status(400).json({ success: false, message: msg });
    }

    // 2. Immediate check if file was provided
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No mediaFile found in request' });
    }

    // 3. Granular Size Validation (Image vs Video)
    const isImage = ALLOWED_IMAGE_TYPES.includes(req.file.mimetype);
    const currentLimit = isImage ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE;

    if (req.file.size > currentLimit) {
      // Sync cleanup is faster and prevents race conditions
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(400).json({ 
        success: false, 
        message: `${isImage ? 'Image' : 'Video'} exceeds limit (${currentLimit/1024/1024}MB)` 
      });
    }

    // 4. Success - Proceed to the controller
    next();
  });
};

// --- Updated Route ---
router.post(
    `${basePath}/create/media`,
    verifyToken,
    fastMediaUpload, // SINGLE middleware handling everything
    PostMediaController.BulkCreateOrUpdatePostMedia
);


  router.get(
    `${basePath}/getMedia/ByPostId`,
    verifyToken,
    PostMediaController.getPostMediaByPostId
  )

export default router