import NgoMediaLikesController from "./ngo.media.likes.controller.js";
import commonPath from "../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
const {express,verifyToken,basePathRoute} = commonPath

// Define the base path for routes
const basePath=`${basePathRoute}/ngo_media_likes`
const router = express.Router()
// Route to create a new record


router.post(
    `${basePath}/create`,
    verifyToken,
    NgoMediaLikesController.create
)
// Route to update an existing record by ID
router.put(
    `${basePath}/update`,
    verifyToken,
    NgoMediaLikesController.update
)
// Route to retrieve all records
router.get(
    `${basePath}`,
    verifyToken,
    NgoMediaLikesController.getAllByView
)
// Route to retrieve a record by ID
router.get(
    `${basePath}/getById`,
    verifyToken,
    NgoMediaLikesController.getByIdByView
)
// Route to delete a record by ID
router.delete(
    `${basePath}/delete`,
    verifyToken,
    NgoMediaLikesController.deleteData
)

router.get(
    `${basePath}/getBy/NgoMediaId`,
    verifyToken,
    NgoMediaLikesController.getNGoMediaLikeByNgoMediaId
)
router.post(
    `${basePath}/create/update`,
    verifyToken,
    NgoMediaLikesController.createOrUpdateNgoMediaLike
)

// Export the router for use in other parts of the application
export default router