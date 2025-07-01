import NotificationsController from "./notifications.controller.js";
import commonPath from "../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
const {express,verifyToken,basePathRoute} = commonPath

// Define the base path for routes
const basePath=`${basePathRoute}/notifications`
const router = express.Router()
// Route to create a new record


router.post(
    `${basePath}/create`,
    verifyToken,
    NotificationsController.create
)
// Route to update an existing record by ID
router.put(
    `${basePath}/update`,
    verifyToken,
    NotificationsController.update
)
// Route to retrieve all records
router.get(
    `${basePath}`,
    verifyToken,
    NotificationsController.getAllByView
)
// Route to retrieve a record by ID
router.get(
    `${basePath}/getById`,
    verifyToken,
    NotificationsController.getByIdByView
)
// Route to delete a record by ID
router.delete(
    `${basePath}/delete`,
    verifyToken,
    NotificationsController.deleteData
)

// Export the router for use in other parts of the application
export default router
