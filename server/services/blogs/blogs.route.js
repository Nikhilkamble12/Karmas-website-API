import BlogsController from "./blogs.controller.js";
import commonPath from "../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
const {express,verifyToken,basePathRoute} = commonPath

// Define the base path for routes
const basePath=`${basePathRoute}/blogs`
const router = express.Router()
// Route to create a new record

router.post(
    `${basePath}/create`,
    verifyToken,
    BlogsController.create
)
// Route to update an existing record by ID
router.put(
    `${basePath}/update`,
    verifyToken,
    BlogsController.update
)
// Route to retrieve all records
router.get(
    `${basePath}`,
    verifyToken,
    BlogsController.getAllByView
)
// Route to retrieve a record by ID
router.get(
    `${basePath}/getById`,
    verifyToken,
    BlogsController.getByIdByView
)
// Route to delete a record by ID
router.delete(
    `${basePath}/delete`,
    verifyToken,
    BlogsController.deleteData
)
// Route to retrieve all records with pagination
router.get(
    `${basePath}/getAllWithlimit`,
    // verifyToken,
    BlogsController.getAllWithlimit
)

// Export the router for use in other parts of the application
export default router