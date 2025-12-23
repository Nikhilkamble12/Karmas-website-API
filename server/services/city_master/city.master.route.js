import CityMasterController from "./city.master.controller.js";
import commonPath from "../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
const {express,verifyToken,basePathRoute} = commonPath

// Define the base path for routes
const basePath=`${basePathRoute}/city`
const router = express.Router()
// Route to create a new record

router.post(
    `${basePath}/create`,
    verifyToken,
    CityMasterController.create
)
// Route to update an existing record by ID
router.put(
    `${basePath}/update`,
    verifyToken,
    CityMasterController.update
)
// Route to retrieve all records
router.get(
    `${basePath}`,
    // verifyToken,
    CityMasterController.getAllByView
)
// Route to retrieve a record by ID
router.get(
    `${basePath}/getById`,
    verifyToken,
    CityMasterController.getByIdByView
)
// Route to delete a record by ID
router.delete(
    `${basePath}/delete`,
    verifyToken,
    CityMasterController.deleteData
)
// get by state id
router.get(
    `${basePath}/getBy/StateId`,
    verifyToken,
    CityMasterController.getCityByStateId
)

// Export the router for use in other parts of the application
export default router
