import StateMasterController from "./state.master.controller.js";
import commonPath from "../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
const {express,verifyToken,basePathRoute} = commonPath

// Define the base path for routes
const basePath=`${basePathRoute}/state_master`
const router = express.Router()
// Route to create a new record

router.post(
    `${basePath}/create`,
    // verifyToken,
    StateMasterController.create
)
// Route to update an existing record by ID
router.put(
    `${basePath}/update`,
    verifyToken,
    StateMasterController.update
)
// Route to retrieve all records
router.get(
    `${basePath}`,
    verifyToken,
    StateMasterController.getAllByView
)
// Route to retrieve a record by ID
router.get(
    `${basePath}/getById`,
    verifyToken,
    StateMasterController.getByIdByView
)
// Route to delete a record by ID
router.delete(
    `${basePath}/delete`,
    verifyToken,
    StateMasterController.deleteData
)
// Route to get State By Country ID
router.get(
    `${basePath}/getByCountry`,
    verifyToken,
    StateMasterController.getStateByCountryId
)

// Export the router for use in other parts of the application
export default router
