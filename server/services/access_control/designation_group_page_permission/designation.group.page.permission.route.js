import DesignationGroupPagePermissionController from "./designation.group.page.permission.controller.js";
import commonPath from "../../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
const {express,verifyToken,basePathRoute} = commonPath


// Define the base path for routes
const basePath=`${basePathRoute}/designation_group_page_permission`
const router = express.Router()
// Route to create a new record


router.post(
    `${basePath}/create`,
    verifyToken,
    DesignationGroupPagePermissionController.create
)
// Route to update an existing record by ID
router.put(
    `${basePath}/update`,
    verifyToken,
    DesignationGroupPagePermissionController.update
)
// Route to retrieve all records
router.get(
    `${basePath}`,
    verifyToken,
    DesignationGroupPagePermissionController.getAllByView
)
// Route to retrieve a record by ID
router.get(
    `${basePath}/getById`,
    verifyToken,
    DesignationGroupPagePermissionController.getByIdByView
)
// Route to delete a record by ID
router.delete(
    `${basePath}/delete`,
    verifyToken,
    DesignationGroupPagePermissionController.deleteData
)
router.get(
    `${basePath}/get/DataBydesigantion/Id`,
    verifyToken,
    DesignationGroupPagePermissionController.getDataByDesignationId
  )
router.put(
    `${basePath}/create/update/groupRole`,
    verifyToken,
    DesignationGroupPagePermissionController.createOrUpdateGroupDesignationPagePermission
)

// Export the router for use in other parts of the application
export default router

