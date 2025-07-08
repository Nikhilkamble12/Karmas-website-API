import GroupRolePagePermissionController from "./group.role.page.permission.controller.js";
import commonPath from "../../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
const {express,verifyToken,basePathRoute} = commonPath


// Define the base path for routes
const basePath=`${basePathRoute}/group_role_page_permission`
const router = express.Router()
// Route to create a new record


router.post(
    `${basePath}/create`,
    verifyToken,
    GroupRolePagePermissionController.create
)
// Route to update an existing record by ID
router.put(
    `${basePath}/update`,
    verifyToken,
    GroupRolePagePermissionController.update
)
// Route to retrieve all records
router.get(
    `${basePath}`,
    verifyToken,
    GroupRolePagePermissionController.getAllByView
)
// Route to retrieve a record by ID
router.get(
    `${basePath}/getById`,
    verifyToken,
    GroupRolePagePermissionController.getByIdByView
)
// Route to delete a record by ID
router.delete(
    `${basePath}/delete`,
    verifyToken,
    GroupRolePagePermissionController.deleteData
)
router.get(
    `${basePath}/get/DataByRole/Id`,
    verifyToken,
    GroupRolePagePermissionController.getDataByRoleId
  )

// Export the router for use in other parts of the application
export default router