import NgoMediaCommentsController from "./ngo.media.comments.controller.js";
import commonPath from "../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
const {express,verifyToken,basePathRoute} = commonPath

// Define the base path for routes
const basePath=`${basePathRoute}/ngo_media_comments`
const router = express.Router()
// Route to create a new record

router.post(
    `${basePath}/create`,
    verifyToken,
    NgoMediaCommentsController.create
)
// Route to update an existing record by ID
router.put(
    `${basePath}/update`,
    verifyToken,
    NgoMediaCommentsController.update
)
// Route to retrieve all records
router.get(
    `${basePath}`,
    verifyToken,
    NgoMediaCommentsController.getAllByView
)
// Route to retrieve a record by ID
router.get(
    `${basePath}/getById`,
    verifyToken,
    NgoMediaCommentsController.getByIdByView
)
// Route to delete a record by ID
router.delete(
    `${basePath}/delete`,
    verifyToken,
    NgoMediaCommentsController.deleteData
)
// Router to get Ngo Media Comment Only Parent 

router.get(
    `${basePath}/getData/Parent`,
    verifyToken,
    NgoMediaCommentsController.getByNgoMediaOnlyParentId
)
// Router to get Ngo Media Comment By Parent Id and Media Id
router.get(
    `${basePath}/getData/mediaAnd/Parent`,
    verifyToken,
    NgoMediaCommentsController.getNgoMediaByNgoMediaIdAndParentId
)

// Export the router for use in other parts of the application
export default router