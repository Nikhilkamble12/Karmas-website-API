import RequestMediaController from "./request.media.controller.js";
import commonPath from "../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
const {express,verifyToken,basePathRoute,multer,path,fs,fileURLToPath} = commonPath

// Define the base path for routes
const basePath=`${basePathRoute}/request_media`
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
    RequestMediaController.create
)

// Route to update an existing record by ID
router.put(
    `${basePath}/update`,
    verifyToken,
    RequestMediaController.update
)

// Route to retrieve all records
router.get(
    `${basePath}`,
    verifyToken,
    RequestMediaController.getAllByView
)
// Route to retrieve a record by ID
router.get(
    `${basePath}/getById`,
    verifyToken,
    RequestMediaController.getByIdByView
)

// Route to delete a record by ID
router.delete(
    `${basePath}/delete`,
    verifyToken,
    RequestMediaController.deleteData
)

// Set storage engine for Multer (temporary storage in disk)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      // Specify the folder where Multer should temporarily store the files
      cb(null, uploadDir);  // It will store the file in the 'uploads/' folder
    },
    filename: (req, file, cb) => {
        const now = new Date();
        const timestamp = now.toISOString().replace(/[:.]/g, '-'); // e.g., "2025-05-02T14-34-56-789Z"
        const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
      // Create a unique filename by appending timestamp to the original filename
      cb(null, `${timestamp}-${safeName}`);
    }
  });
  
// Create the Multer instance with the storage settings
const upload = multer({ storage });

// Route To Create A Record For Request POST
router.post(
    `${basePath}/RequestPost/Media`,
    verifyToken,
    upload.single('mediaFile'), 
    RequestMediaController.createOrUpdateMulitileRequestMedia
)
// Router to get Request media By User id
// router.get(
//     `${basePath}/getBy/UserId`,
//     verifyToken,
// )

// Export the router for use in other parts of the application
export default router