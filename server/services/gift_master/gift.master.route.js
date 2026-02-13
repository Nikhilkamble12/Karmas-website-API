import GiftMasterController from "./gift.master.controller.js";
import commonPath from "../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
const {express,verifyToken,basePathRoute} = commonPath

// Define the base path for routes
const basePath=`${basePathRoute}/gift_master`
const router = express.Router()
// Route to create a new record

router.post(
    `${basePath}/create`,
    // verifyToken,
    GiftMasterController.create
)
// Route to update an existing record by ID
router.put(
    `${basePath}/update`,
    verifyToken,
    GiftMasterController.update
)
// Route to retrieve all records
router.get(
    `${basePath}`,
    verifyToken,
    GiftMasterController.getAllByView
)
// Route to retrieve a record by ID
router.get(
    `${basePath}/getById`,
    verifyToken,
    GiftMasterController.getByIdByView
)
// Route to delete a record by ID
router.delete(
    `${basePath}/delete`,
    verifyToken,
    GiftMasterController.deleteData
)
// Route to get next 20 gifts after score (more specific, should come first)
router.get(
    `${basePath}/rewards/gifts/next`,
    verifyToken,
    GiftMasterController.getNext20GiftsAfterScore
)
// Route to get all gifts till score
router.get(
    `${basePath}/rewards/gifts/score`,
    verifyToken,
    GiftMasterController.getAllGiftsTillScore
)
// Route to get all gifts by user id
router.get(
    `${basePath}/rewards/gifts`,
    verifyToken,
    GiftMasterController.getAllGiftsbyUserId
)
// Export the router for use in other parts of the application
export default router
