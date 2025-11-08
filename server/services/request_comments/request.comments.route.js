import RequestCommentController from "./request.comments.controller.js";
import commonPath from "../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
const {express,verifyToken,basePathRoute} = commonPath

// Define the base path for routes
const basePath=`${basePathRoute}/request_comments`
const router = express.Router()
// Route to create a new record

router.post(
    `${basePath}/create`,
    verifyToken,
    RequestCommentController.create
)
// Route to update an existing record by ID
router.put(
    `${basePath}/update`,
    verifyToken,
    RequestCommentController.update
)
// Route to retrieve all records
router.get(
    `${basePath}`,
    verifyToken,
    RequestCommentController.getAllByView
)
// Route to retrieve a record by ID
router.get(
    `${basePath}/getById`,
    verifyToken,
    RequestCommentController.getByIdByView
)
// Route to delete a record by ID
router.delete(
    `${basePath}/delete`,
    verifyToken,
    RequestCommentController.deleteData
)
// Rouuter To Get Comment By Parent Id And Request Id
router.get(
    `${basePath}/getComment/ByRequest`,
    verifyToken,
    RequestCommentController.getCommentByRequestAndParentId
)
// Router To Get Comment By User Id 
router.get(
    `${basePath}/getComment/ByUser`,
    verifyToken,
    RequestCommentController.getCommentByUserIdByView
)

// Export the router for use in other parts of the application
export default router