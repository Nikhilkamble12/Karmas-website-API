import RequestCommentLikesController from "./request.comment.likes.controller.js";
import commonPath from "../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
const {express,verifyToken,basePathRoute} = commonPath

// Define the base path for routes
const basePath=`${basePathRoute}/request_cmt_likes`
const router = express.Router()
// Route to create a new record

router.post(
    `${basePath}/create`,
    verifyToken,
    RequestCommentLikesController.create
)
// Route to update an existing record by ID
router.put(
    `${basePath}/update`,
    verifyToken,
    RequestCommentLikesController.update
)
// Route to retrieve all records
router.get(
    `${basePath}`,
    verifyToken,
    RequestCommentLikesController.getAllByView
)
// Route to retrieve a record by ID
router.get(
    `${basePath}/getById`,
    verifyToken,
    RequestCommentLikesController.getByIdByView
)
// Route to delete a record by ID
router.delete(
    `${basePath}/delete`,
    verifyToken,
    RequestCommentLikesController.deleteData
)
// Routes to get Data By Request Id
router.get(
    `${basePath}/getBy/Request`,
    verifyToken,
    RequestCommentLikesController.getRequestCommentLikesByRequestCommentId
)
// Router To Get data By User Id 
router.get(
    `${basePath}/getBy/UserId`,
    verifyToken,
    RequestCommentLikesController.geRequestCommentLikesByUserIdByView
)

export default router