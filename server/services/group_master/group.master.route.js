import GroupMasterController from "./group.master.controller.js";
import commonPath from "../../middleware/comman_path/comman.path.js";

const { express, verifyToken, basePathRoute,multer, path, fs,fileURLToPath} = commonPath;

// Define base path
const basePath = `${basePathRoute}/group_master`;
// Define the base path for routes

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

const router = express.Router();

// Create record
router.post(
    `${basePath}/create`,
    verifyToken,
    GroupMasterController.create
);

// Update record
router.put(
    `${basePath}/update`,
    verifyToken,
    GroupMasterController.update
);

// Get all records
router.get(
    `${basePath}`,
    verifyToken,
    GroupMasterController.getAllByView
);

// Get record by ID
router.get(
    `${basePath}/getById`,
    verifyToken,
    GroupMasterController.getByIdByView
);

// Delete record
router.delete(
    `${basePath}/delete`,
    verifyToken,
    GroupMasterController.deleteData
);
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
    upload.single('group_image_file'),  // Multer middleware to handle single file upload (replace 'mediaFile' with the correct field name from your form)
    GroupMasterController.BulkCreateOrUpdateGroupMaster // Controller function that handles the creation logic
  );

router.get(
    `${basePath}/getGroupByCode`,
    verifyToken,
    GroupMasterController.getByCodeByView
)

export default router;