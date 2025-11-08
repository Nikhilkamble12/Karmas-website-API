import UserBlackListController from "./user.blacklist.controller.js";
import commonPath from "../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
const {express,verifyToken,basePathRoute} = commonPath

// Define the base path for routes
const basePath=`${basePathRoute}/user_blacklist`
const router = express.Router()
// Route to create a new record


router.post(
    `${basePath}/create`,
    // verifyToken,
    UserBlackListController.create
)
// Route to update an existing record by ID
router.put(
    `${basePath}/update`,
    verifyToken,
    UserBlackListController.update
)
// Route to retrieve all records
router.get(
    `${basePath}`,
    verifyToken,
    UserBlackListController.getAllByView
)
// Route to retrieve a record by ID
router.get(
    `${basePath}/getById`,
    verifyToken,
    UserBlackListController.getByIdByView
)
// Route to delete a record by ID
router.delete(
    `${basePath}/delete`,
    verifyToken,
    UserBlackListController.deleteData
)
// get Data By User Id 
router.get(
    `${basePath}/getBy/UserId`,
    verifyToken,
    UserBlackListController.getDataByUseridByView
)


// Export the router for use in other parts of the application
export default router

