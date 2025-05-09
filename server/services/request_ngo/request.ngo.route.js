import RequestNgoController from "./request.ngo.controller.js";
import commonPath from "../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
const {express,verifyToken,basePathRoute} = commonPath

// Define the base path for routes
const basePath=`${basePathRoute}/request_ngo`
const router = express.Router()
// Route to create a new record

router.post(
    `${basePath}/create`,
    verifyToken,
    RequestNgoController.create
)
// Route to update an existing record by ID
router.put(
    `${basePath}/update`,
    verifyToken,
    RequestNgoController.update
)
// Route to retrieve all records
router.get(
    `${basePath}`,
    verifyToken,
    RequestNgoController.getAllByView
)
// Route to retrieve a record by ID
router.get(
    `${basePath}/getById`,
    verifyToken,
    RequestNgoController.getByIdByView
)
// Route to delete a record by ID
router.delete(
    `${basePath}/delete`,
    verifyToken,
    RequestNgoController.deleteData
)
router.put(
    `${basePath}/update/ngo/status`,
    verifyToken,
    RequestNgoController.updateStatusRequestNgoMaster
)
router.put(
    `${basePath}/create/update/requestNgo`,
    verifyToken,
    RequestNgoController.createUpdateRequestNgo
)
// get NgoRequest By Ngo Id And By Filter
router.get(
    `${basePath}/getData/ByFilter/Ngo`,
    verifyToken,
    RequestNgoController.getAllNgoRequestLiveStatusWise
)
// Export the router for use in other parts of the application
export default router
