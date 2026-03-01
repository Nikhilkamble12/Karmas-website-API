import { fileURLToPath } from 'url'; // Importing fileURLToPath to convert URL to file path
import NgoMediaController from "./ngo.media.controller.js";
import commonPath from "../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
const {express,verifyToken,basePathRoute,multer,path,fs} = commonPath

// Define the base path for routes
const basePath=`${basePathRoute}/ngo_media`
const router = express.Router()
// Route to create a new record

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

router.post(
    `${basePath}/create`,
    verifyToken,
    NgoMediaController.create
)
// Route to update an existing record by ID
router.put(
    `${basePath}/update`,
    verifyToken,
    NgoMediaController.update
)
// Route to retrieve all records
router.get(
    `${basePath}`,
    verifyToken,
    NgoMediaController.getAllByView
)
// Route to retrieve a record by ID
router.get(
    `${basePath}/getById`,
    verifyToken,
    NgoMediaController.getByIdByView
)
// Route to delete a record by ID
router.delete(
    `${basePath}/delete`,
    verifyToken,
    NgoMediaController.deleteData
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
    NgoMediaController.BulkCreateorUpdatengoMedia // Controller function that handles the creation logic
  );

router.get(
    `${basePath}/getData/ByNgoId`,
    verifyToken,
    NgoMediaController.getDataByNgoId
)

// Export the router for use in other parts of the application
export default router