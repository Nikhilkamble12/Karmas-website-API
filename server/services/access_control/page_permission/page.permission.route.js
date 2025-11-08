import PagePermissionController from "./page.permission.controller.js";
import commonPath from "../../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
const {express,verifyToken,basePathRoute} = commonPath

// Define the base path for routes
const basePath=`${basePathRoute}/page_permission`
const router = express.Router()
// Route to create a new record


router.post(
    `${basePath}/create`,
    verifyToken,
    PagePermissionController.create
)
// Route to update an existing record by ID
router.put(
    `${basePath}/update`,
    verifyToken,
    PagePermissionController.update
)
// Route to retrieve all records
router.get(
    `${basePath}`,
    verifyToken,
    PagePermissionController.getAllByView
)
// Route to retrieve a record by ID
router.get(
    `${basePath}/getById`,
    verifyToken,
    PagePermissionController.getByIdByView
)
// Route to delete a record by ID
router.delete(
    `${basePath}/delete`,
    verifyToken,
    PagePermissionController.deleteData
)
// Router to Bulk Create Update Data 
router.post(
  `${basePath}/bulkCreate/update`,
  verifyToken,
  PagePermissionController.bulkCreatePagePermission
)
router.get(
  `${basePath}/getData/byPageId`,
  verifyToken,
  PagePermissionController.getAllDataByPageId
)

// Export the router for use in other parts of the application
export default router