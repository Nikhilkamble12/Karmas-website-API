import DistrictMasterController from "./district.master.controller.js";
import commonPath from "../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
const {express,verifyToken,basePathRoute} = commonPath

// Define the base path for routes
const basePath=`${basePathRoute}/district`
const router = express.Router()
// Route to create a new record

router.post(
    `${basePath}/create`,
    verifyToken,
    DistrictMasterController.create
)
// Route to update an existing record by ID
router.put(
    `${basePath}/update`,
    verifyToken,
    DistrictMasterController.update
)
// Route to retrieve all records
router.get(
    `${basePath}`,
    verifyToken,
    DistrictMasterController.getAllByView
)
// Route to retrieve a record by ID
router.get(
    `${basePath}/getById`,
    verifyToken,
    DistrictMasterController.getByIdByView
)
// Route to delete a record by ID
router.delete(
    `${basePath}/delete`,
    verifyToken,
    DistrictMasterController.deleteData
)
// Route to get District By State ID
router.get(
    `${basePath}/get/byState`,
    verifyToken,
    DistrictMasterController.getDataByStateId
)
// Router to get District By Country Id 
router.get(
    `${basePath}/get/ByCountryId`,
    verifyToken,
    DistrictMasterController.getDataByCountryId
)

// Export the router for use in other parts of the application
export default router
