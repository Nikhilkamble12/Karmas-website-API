import PostMediaController from "./postmedia.controller.js";
import commonPath from "../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
const {express,verifyToken,basePathRoute} = commonPath

// Define the base path for routes
const basePath=`${basePathRoute}/postmedia` 
const router = express.Router()
// Route to create a new record

router.post(
    `${basePath}/create`,
    verifyToken,
    PostMediaController.create
)

// Route to update an existing record by ID
router.put(
    `${basePath}/update/:id`,
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
    `${basePath}/:id`,
    verifyToken,
    PostMediaController.getByIdByView
)

// Route to delete a record by ID     
router.delete(
    `${basePath}/delete/:id`,
    verifyToken,
    PostMediaController.deleteData
)

export default router