import UserMasterController from "./user.master.controller.js";
import commonPath from "../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
const {express,verifyToken,basePathRoute} = commonPath

// Define the base path for routes
const basePath=`${basePathRoute}/user_master`
const router = express.Router()
// Route to create a new record

router.post(
    `${basePath}/create`,
    // verifyToken,
    UserMasterController.create
)
// Route to update an existing record by ID
router.put(
    `${basePath}/update`,
    verifyToken,
    UserMasterController.update
)
// Route to retrieve all records
router.get(
    `${basePath}`,
    verifyToken,
    UserMasterController.getAllByView
)
// Route to retrieve a record by ID
router.get(
    `${basePath}/getById`,
    verifyToken,
    UserMasterController.getByIdByView
)
// Route to delete a record by ID
router.delete(
    `${basePath}/:id`,
    verifyToken,
    UserMasterController.deleteData
)
// get User And Activity Data 
router.get(
    `${basePath}/getUserData/Activity`,
    verifyToken,
    UserMasterController.getuserDataAndActivity
)
router.get(
    `${basePath}/search/user`,
    verifyToken,
    UserMasterController.getUserDataByUserName
)
// Block A User 
router.put(
    `${basePath}/block/User`,
    verifyToken,
    UserMasterController.blockAndUnblockUser
)
// check wether Username Already in Use
router.get(
    `${basePath}/username/alreadyUsed`,
    // verifyToken,
    UserMasterController.checkWetherUsernamePresent
)

// Export the router for use in other parts of the application
export default router
