import UserRequestStatsController from "./user.request.stats.controller.js";

import commonPath from "../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
const {express,verifyToken,basePathRoute} = commonPath

// Define the base path for routes
const basePath=`${basePathRoute}/user_request_stats`
const router = express.Router()
// Route to create a new record

router.post(
    `${basePath}/create`,
    // verifyToken,
    UserRequestStatsController.create
)
// Route to update an existing record by ID
router.put(
    `${basePath}/update`,
    verifyToken,
    UserRequestStatsController.update
)
// Route to retrieve all records
router.get(
    `${basePath}`,
    verifyToken,
    UserRequestStatsController.getAllByView
)
// Route to retrieve a record by ID
router.get(
    `${basePath}/getById`,
    verifyToken,
    UserRequestStatsController.getByIdByView
)
// Route to delete a record by ID
router.delete(
    `${basePath}/delete`,
    verifyToken,
    UserRequestStatsController.deleteData
)
// Router Get By User Id
router.get(
    `${basePath}/getBy/UserId`,
    verifyToken,
    UserRequestStatsController.getDataByUserId
)

// Export the router for use in other parts of the application
export default router
