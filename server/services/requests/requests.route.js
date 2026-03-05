import RequestsController from "./requests.controller.js";
import commonPath from "../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
const {express,verifyToken,basePathRoute} = commonPath

// Define the base path for routes
const basePath=`${basePathRoute}/requests`
const router = express.Router()
// Route to create a new record

router.post(
    `${basePath}/create`,
    verifyToken,
    RequestsController.create
)
// Route to update an existing record by ID
router.put(
    `${basePath}/update`,
    verifyToken,
    RequestsController.update
)
// Route to retrieve all records
router.get(
    `${basePath}`,
    verifyToken,
    RequestsController.getAllByView
)
// Route to retrieve a record by ID
router.get(
    `${basePath}/getById`,
    verifyToken,
    RequestsController.getByIdByView
)
// Route to delete a record by ID
router.delete(
    `${basePath}/delete`,
    verifyToken,
    RequestsController.deleteData
)
// Get Request By User Id
router.get(
    `${basePath}/getBy/UserId`,
    verifyToken,
    RequestsController.getRequestByUserId
)
router.get(`${basePath}/getNgo/DataByRequest`,
    verifyToken,
    RequestsController.getNgoRequstDataForMapping
)
router.get(
    `${basePath}/getHome/data`,
    verifyToken,
    RequestsController.getRequestDataByDescUserWise
)
// get AllRequest By NgoId
router.get(
    `${basePath}/getData/ByNgoId`,
    verifyToken,
    RequestsController.getRequestByNgoId
)
router.get(
    `${basePath}/getHome/videoData`,
    verifyToken,
    RequestsController.getAllVideoRequestByUserIdForHome
)
router.get(
    `${basePath}/getAll`,
    RequestsController.getAllRequests
)
router.get(
    `${basePath}/getBy/NgoCreatedId`,
    verifyToken,
    RequestsController.GetAllRequestNgoCreatedId
)
// Export the router for use in other parts of the application
export default router
