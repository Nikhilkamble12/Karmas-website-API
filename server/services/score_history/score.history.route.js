import ScoreHistoryController from "./score.history.controller.js";
import commonPath from "../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
const {express,verifyToken,basePathRoute} = commonPath

// Define the base path for routes
const basePath=`${basePathRoute}/score_history`
const router = express.Router()
// Route to create a new record

router.post(
    `${basePath}/create`,
    verifyToken,
    ScoreHistoryController.create
)
// Route to update an existing record by ID
router.put(
    `${basePath}/update`,
    verifyToken,
    ScoreHistoryController.update
)
// Route to retrieve all records
router.get(
    `${basePath}`,
    verifyToken,
    ScoreHistoryController.getAllByView
)
// Route to retrieve a record by ID
router.get(
    `${basePath}/getById`,
    verifyToken,
    ScoreHistoryController.getByIdByView
)
// Route to delete a record by ID
router.delete(
    `${basePath}/delete`,
    verifyToken,
    ScoreHistoryController.deleteData
)
// get Data To Get Latest Score Dashboard
router.get(
    `${basePath}/get/dashBoard`,
    verifyToken,
    ScoreHistoryController.getScoreDashBordData
)

// Export the router for use in other parts of the application
export default router
