import SosUserListController from "./sos.user.list.controller.js";
import commonPath from "../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
const {express,verifyToken,basePathRoute} = commonPath

// Define the base path for routes
const basePath=`${basePathRoute}/sos_user_history`
const router = express.Router()
// Route to create a new record

router.post(
    `${basePath}/create`,
    verifyToken,
    SosUserListController.create
)
// Route to update an existing record by ID
router.put(
    `${basePath}/update`,
    verifyToken,
    SosUserListController.update
)
// Route to retrieve all records
router.get(
    `${basePath}`,
    verifyToken,
    SosUserListController.getAllByView
)
// Route to retrieve a record by ID
router.get(
    `${basePath}/getById`,
    verifyToken,
    SosUserListController.getByIdByView
)
// Route to delete a record by ID
router.delete(
    `${basePath}/delete`,
    verifyToken,
    SosUserListController.deleteData
)
// get Data By User Id 
router.get(
    `${basePath}/getBy/UserId`,
    verifyToken,
    SosUserListController.getDatabyUserId
)
// Create Or Update Data
router.put(
    `${basePath}/create/update`,
    verifyToken,
    SosUserListController.createOrUpdateSosUserList
)

// Export the router for use in other parts of the application
export default router
