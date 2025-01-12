import StatusMasterController from "./status.master.controller.js";
import commonPath from "../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
const {express,verifyToken,basePathRoute} = commonPath

// Define the base path for routes
const basePath=`${basePathRoute}/status_master`
const router = express.Router()
// Route to create a new record

router.post(
    `${basePath}/create`,
    verifyToken,
    StatusMasterController.create
)
// Route to update an existing record by ID
router.put(
    `${basePath}/update`,
    verifyToken,
    StatusMasterController.update
)
// Route to retrieve all records
router.get(
    `${basePath}`,
    verifyToken,
    StatusMasterController.getAllByView
)
// Route to retrieve a record by ID
router.get(
    `${basePath}/getById`,
    verifyToken,
    StatusMasterController.getByIdByView
)
// Route to delete a record by ID
router.delete(
    `${basePath}/delete`,
    verifyToken,
    StatusMasterController.deleteData
)
// Router to get Data By Parent ID 
router.get(
    `${basePath}/getData/ByparentId`,
    verifyToken,
    StatusMasterController.getDataByParentId
)


// Export the router for use in other parts of the application
export default router
