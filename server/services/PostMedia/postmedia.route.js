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

// Set storage engine for Multer (temporary storage in disk)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      // Specify the folder where Multer should temporarily store the files
      cb(null, uploadDir);  // It will store the file in the 'uploads/' folder
    },
    filename: (req, file, cb) => {
      // Create a unique filename by appending timestamp to the original filename
      cb(null, `${Date.now()}-${file.originalname}`);
    }
  });
  
  // Create the Multer instance with the storage settings
  const upload = multer({ storage });

  // Use Multer to upload the file before calling the 'create' function
router.post(
    `${basePath}/create/media`,
    verifyToken,            // Middleware to verify token
    upload.single('mediaFile'),  // Multer middleware to handle single file upload (replace 'mediaFile' with the correct field name from your form)
    PostMediaController.BulkCreateOrUpdatePostMedia // Controller function that handles the creation logic
  );


  router.get(
    `${basePath}/getMedia/ByPostId`,
    verifyToken,
    PostMediaController.getPostMediaByPostId
  )

export default router