import ReqestTagController from "./request.tag.controller.js";
import commonPath from "../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
const {express,verifyToken,basePathRoute} = commonPath

// Define the base path for routes
const basePath=`${basePathRoute}/request_tag`
const router = express.Router()
// Route to create a new record

router.post(
    `${basePath}/create`,
    verifyToken,
    ReqestTagController.create
)
// Route to update an existing record by ID
router.put(
    `${basePath}/update`,
    verifyToken,
    ReqestTagController.update
)
// Route to retrieve all records
router.get(
    `${basePath}`,
    verifyToken,
    ReqestTagController.getAllByView
)
// Route to retrieve a record by ID
router.get(
    `${basePath}/getById`,
    verifyToken,
    ReqestTagController.getByIdByView
)
// Route to delete a record by ID
router.delete(
    `${basePath}/delete`,
    verifyToken,
    ReqestTagController.deleteData
)

router.get(
    `${basePath}/get/byRequestId`,
    verifyToken,
    ReqestTagController.getDataByRequestId
)

// Export the router for use in other parts of the application
export default router
