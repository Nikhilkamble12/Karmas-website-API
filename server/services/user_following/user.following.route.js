import UserFollowingController from "./user.following.controller.js";
import commonPath from "../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
const {express,verifyToken,basePathRoute} = commonPath

// Define the base path for routes
const basePath=`${basePathRoute}/user_following`
const router = express.Router()
// Route to create a new record

router.post(
    `${basePath}/create`,
    // verifyToken,
    UserFollowingController.create
)
// Route to update an existing record by ID
router.put(
    `${basePath}/update`,
    verifyToken,
    UserFollowingController.update
)
// Route to retrieve all records
router.get(
    `${basePath}`,
    verifyToken,
    UserFollowingController.getAllByView
)
// Route to retrieve a record by ID
router.get(
    `${basePath}/getById`,
    verifyToken,
    UserFollowingController.getByIdByView
)
// Route to delete a record by ID
router.delete(
    `${basePath}/delete`,
    verifyToken,
    UserFollowingController.deleteData
)
router.put(
    `${basePath}/update/privateFollow`,
    verifyToken,
    UserFollowingController.acceptPrivateUserRequest
)
router.get(
    `${basePath}/getFollowing/byUserId`,
    verifyToken,    
    UserFollowingController.getDataByUserIdByview
)
router.get(
    `${basePath}/getFollowers/byUserId`,
    verifyToken,    
    UserFollowingController.getDatabyFollowingUserId
)
router.get(
    `${basePath}/getData/toaccept/byPrivate`,
    verifyToken,
    UserFollowingController.getListByFollowingUserToAccepted
)
// Export the router for use in other parts of the application
export default router
