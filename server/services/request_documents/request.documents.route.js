import RequestDocumentsController from "./request.documents.controller.js";
import commonPath from "../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
const {express,verifyToken,basePathRoute,multer,path,fs,fileURLToPath} = commonPath


async function deleteFile(filePath) {
      console.log("Inside delete function:", filePath);
      try {
        await fs.access(filePath); // Check if file exists
        await fs.unlink(filePath); // Delete it
        console.log(`✅ File deleted: ${filePath}`);
      } catch (err) {
        console.error(`❌ Failed to delete file: ${filePath}`, err.message);
      }
    }

// Define the base path for routes
const basePath=`${basePathRoute}/request_documents`
const router = express.Router()
// Route to create a new record


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true }); // safer to add recursive
}


router.post(
    `${basePath}/create`,
    verifyToken,
    RequestDocumentsController.create
)
// Route to update an existing record by ID
router.put(
    `${basePath}/update`,
    verifyToken,
    RequestDocumentsController.update
)
// Route to retrieve all records
router.get(
    `${basePath}`,
    verifyToken,
    RequestDocumentsController.getAllByView
)
// Route to retrieve a record by ID
router.get(
    `${basePath}/getById`,
    verifyToken,
    RequestDocumentsController.getByIdByView
)
// Route to delete a record by ID
router.delete(
    `${basePath}/delete`,
    verifyToken,
    RequestDocumentsController.deleteData
)


const validateFile = (file) => {
  const fileType = file.mimetype;
  const fileSize = file.size; // Note: size is only available if using MemoryStorage or custom logic; usually, we handle size in multer limits.

  // Define allowed types
  const allowedImages = ['image/jpeg', 'image/png', 'image/webp'];
  const allowedDocs = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  const allowedVideos = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska', 'video/webm'];

  const allAllowed = [...allowedImages, ...allowedDocs, ...allowedVideos];

  if (!allAllowed.includes(fileType)) {
    throw new Error(`Unsupported file format: ${fileType}`);
  }

  return true;
};

// Set storage engine for Multer (temporary storage in disk)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const timestamp = new Date().getTime();
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${timestamp}-${safeName}`);
  }
});

const fileFilter = (req, file, cb) => {
  try {
    validateFile(file);
    cb(null, true);
  } catch (err) {
    // This rejects the file before it is written to disk
    cb(new Error(err.message), false);
  }
};

const upload = multer({ 
  storage, 
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // Universal 50MB limit
  }
});


// // Route To Create A Record For Request POST
router.post(
    `${basePath}/RequestDocument/Media`,
    verifyToken,
    upload.single('mediaFile'), 
    RequestDocumentsController.createOrUpdateMulitileRequestDocuments
)

// Get Request Document By Request Id
router.get(
    `${basePath}/getDocument/ByRequestId`,
    verifyToken,
    RequestDocumentsController.getDataByRequestId
)

// Export the router for use in other parts of the application
export default router