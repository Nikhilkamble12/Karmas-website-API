import NgoLikesController from "./ngo.likes.controller.js";
import commonPath from "../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
const {express,verifyToken,basePathRoute} = commonPath

// Define the base path for routes
const basePath=`${basePathRoute}/ngo_likes`
const router = express.Router()
// Route to create a new record


router.post(
    `${basePath}/create`,
    verifyToken,
    NgoLikesController.create
)
// Route to update an existing record by ID
router.put(
    `${basePath}/update`,
    verifyToken,
    NgoLikesController.update
)
// Route to retrieve all records
router.get(
    `${basePath}`,
    verifyToken,
    NgoLikesController.getAllByView
)
// Route to retrieve a record by ID
router.get(
    `${basePath}/getById`,
    verifyToken,
    NgoLikesController.getByIdByView
)
// Route to delete a record by ID
router.delete(
    `${basePath}/delete`,
    verifyToken,
    NgoLikesController.deleteData
)
// Get Data By Ngo Id 
router.get(
    `${basePath}/getData/ByNgoId`,
    verifyToken,
    NgoLikesController.getDataByNgoIdlike
)
// Get Data By Ngo Id And User Id 
router.get(
    `${basePath}/getData/byNgoUser`,
    verifyToken,
    NgoLikesController.getNgoDataByNgoIdAndUserId
)


// Export the router for use in other parts of the application
export default router