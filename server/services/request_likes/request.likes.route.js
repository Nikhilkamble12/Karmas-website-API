import RequestLikesController from "./request.likes.controller.js";
import commonPath from "../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
const {express,verifyToken,basePathRoute} = commonPath

// Define the base path for routes
const basePath=`${basePathRoute}/request_likes`
const router = express.Router()
// Route to create a new record

router.post(
    `${basePath}/create`,
    verifyToken,
    RequestLikesController.create
)
// Route to update an existing record by ID
router.put(
    `${basePath}/update`,
    verifyToken,
    RequestLikesController.update
)
// Route to retrieve all records
router.get(
    `${basePath}`,
    verifyToken,
    RequestLikesController.getAllByView
)
// Route to retrieve a record by ID
router.get(
    `${basePath}/getById`,
    verifyToken,
    RequestLikesController.getByIdByView
)
// Route to delete a record by ID
router.delete(
    `${basePath}/delete`,
    verifyToken,
    RequestLikesController.deleteData
)
// Routes to get Data By Request Id
router.get(
    `${basePath}/getBy/Request`,
    verifyToken,
    RequestLikesController.getRequestLikeByRequestId
)
// Router To Get data By User Id 
router.get(
    `${basePath}/getBy/UserId`,
    verifyToken,
    RequestLikesController.geRequestLikeByUserIdByView
)

export default router