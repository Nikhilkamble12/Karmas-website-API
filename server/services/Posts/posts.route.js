import PostController from "./posts.controller.js";
import commonPath from "../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
const {express,verifyToken,basePathRoute} = commonPath

// Define the base path for routes
const basePath=`${basePathRoute}/posts`
const router = express.Router()
// Route to create a new record

router.post(
    `${basePath}/create`,
    verifyToken,
    PostController.create
)

// Route to update an existing record by ID
router.put(
    `${basePath}/update`,
    verifyToken,
    PostController.update
)

// Route to retrieve all records
router.get(
    `${basePath}`,
    verifyToken,
    PostController.getAllByView
)
// Route to retrieve a record by ID
router.get(
    `${basePath}/getById`,
    verifyToken,
    PostController.getByIdByView
)

// Route to delete a record by ID
router.delete(
    `${basePath}/delete`,
    verifyToken,
    PostController.deleteData
)
router.get(
    `${basePath}/getData/byPostId`,
    verifyToken,
    PostController.getDatabyPostIdByViewAndMedia
)
router.get(
    `${basePath}/getPost/byUserId`,
    verifyToken,
    PostController.getAllPostbyUserIdAndFilter
)
router.get(
    `${basePath}/getPost/Home`,
    verifyToken,
    PostController.getAllPostByUserIdForHomePage
)

// Export the router for use in other parts of the application
export default router