import PostCommentLikesController from "./post.comment.likes.controller.js";
import commonPath from "../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
const {express,verifyToken,basePathRoute} = commonPath

// Define the base path for routes
const basePath=`${basePathRoute}/post_cmt_likes`
const router = express.Router()
// Route to create a new record

router.post(
    `${basePath}/create`,
    verifyToken,
    PostCommentLikesController.create
)
// Route to update an existing record by ID
router.put(
    `${basePath}/update`,
    verifyToken,
    PostCommentLikesController.update
)
// Route to retrieve all records
router.get(
    `${basePath}`,
    verifyToken,
    PostCommentLikesController.getAllByView
)
// Route to retrieve a record by ID
router.get(
    `${basePath}/getById`,
    verifyToken,
    PostCommentLikesController.getByIdByView
)
// Route to delete a record by ID
router.delete(
    `${basePath}/delete`,
    verifyToken,
    PostCommentLikesController.deleteData
)
// Routes to get Data By Request Id
router.get(
    `${basePath}/getBy/Post`,
    verifyToken,
    PostCommentLikesController.getPostCommentLikesByPostCommentId
)
// Router To Get data By User Id 
router.get(
    `${basePath}/getBy/UserId`,
    verifyToken,
    PostCommentLikesController.getPostCommentLikesByUserIdByView
)

export default router