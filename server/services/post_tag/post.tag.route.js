import PostTagController from "./post.tag.controller.js";
import commonPath from "../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
const {express,verifyToken,basePathRoute} = commonPath

// Define the base path for routes
const basePath=`${basePathRoute}/post_tag`
const router = express.Router()
// Route to create a new record


router.post(
    `${basePath}/create`,
    verifyToken,
    PostTagController.create
)
// Route to update an existing record by ID
router.put(
    `${basePath}/update`,
    verifyToken,
    PostTagController.update
)
// Route to retrieve all records
router.get(
    `${basePath}`,
    verifyToken,
    PostTagController.getAllByView
)
// Route to retrieve a record by ID
router.get(
    `${basePath}/getById`,
    verifyToken,
    PostTagController.getByIdByView
)
// Route to delete a record by ID
router.delete(
    `${basePath}/delete`,
    verifyToken,
    PostTagController.deleteData
)
// get Data By Post Id
router.get(
    `${basePath}/get/ByPostId`,
    verifyToken,
    PostTagController.getPostTabByPostId
)
// Export the router for use in other parts of the application
export default router
