import RoleMasterController from "./role.master.controller.js";
import commonPath from "../../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
const {express,verifyToken,basePathRoute} = commonPath

// Define the base path for routes
const basePath=`${basePathRoute}/role_master`
const router = express.Router()
// Route to create a new record

router.post(
    `${basePath}/create`,
    verifyToken,
    RoleMasterController.create
)
// Route to update an existing record by ID
router.put(
    `${basePath}/update`,
    verifyToken,
    RoleMasterController.update
)
// Route to retrieve all records
router.get(
    `${basePath}`,
    verifyToken,
    RoleMasterController.getAllByView
)
// Route to retrieve a record by ID
router.get(
    `${basePath}/getById`,
    verifyToken,
    RoleMasterController.getByIdByView
)
// Route to delete a record by ID
router.delete(
    `${basePath}/delete`,
    verifyToken,
    RoleMasterController.deleteData
)


// Export the router for use in other parts of the application
export default router
