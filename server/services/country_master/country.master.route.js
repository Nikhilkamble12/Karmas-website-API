// import CountryMasterController from "./state.master.controller.js";
import CountryMasterController from "./country.master.controller.js";
import commonPath from "../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
const {express,verifyToken,basePathRoute} = commonPath

// Define the base path for routes
const basePath=`${basePathRoute}/country_master`
const router = express.Router()
// Route to create a new record

router.post(
    `${basePath}/create`,
    // verifyToken,
    CountryMasterController.create
)
// Route to update an existing record by ID
router.put(
    `${basePath}/update`,
    verifyToken,
    CountryMasterController.update
)
// Route to retrieve all records
router.get(
    `${basePath}`,
    verifyToken,
    CountryMasterController.getAllByView
)
// Route to retrieve a record by ID
router.get(
    `${basePath}/getById`,
    verifyToken,
    CountryMasterController.getByIdByView
)
// Route to delete a record by ID
router.delete(
    `${basePath}/delete`,
    verifyToken,
    CountryMasterController.deleteData
)


// Export the router for use in other parts of the application
export default router
