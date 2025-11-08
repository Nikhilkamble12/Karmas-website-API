import NotificationHistoryController from "./notification.history.controller.js";
import commonPath from "../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
const {express,verifyToken,basePathRoute} = commonPath

// Define the base path for routes
const basePath=`${basePathRoute}/notification_history`
const router = express.Router()
// Route to create a new record


router.post(
    `${basePath}/create`,
    verifyToken,
    NotificationHistoryController.create
)
// Route to update an existing record by ID
router.put(
    `${basePath}/update`,
    verifyToken,
    NotificationHistoryController.update
)
// Route to retrieve all records
router.get(
    `${basePath}`,
    verifyToken,
    NotificationHistoryController.getAllByView
)
// Route to retrieve a record by ID
router.get(
    `${basePath}/getById`,
    verifyToken,
    NotificationHistoryController.getByIdByView
)
// Route to delete a record by ID
router.delete(
    `${basePath}/delete`,
    verifyToken,
    NotificationHistoryController.deleteData
)
// Router To Notification By User Id
router.get(
    `${basePath}/get/Notification`,
    verifyToken,
    NotificationHistoryController.getNotificationDataByUserId
)

export default router