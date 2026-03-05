import CompanyMasterController from "./company.master.controller.js";
import commonPath from "../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
const {express,verifyToken,basePathRoute} = commonPath

// Define the base path for routes
const basePath=`${basePathRoute}/company_master`
const router = express.Router()
// Route to create a new record

router.post(
    `${basePath}/create`,
    // verifyToken,
    CompanyMasterController.create
)
// Route to update an existing record by ID
router.put(
    `${basePath}/update`,
    verifyToken,
    CompanyMasterController.update
)
// Route to retrieve all records
router.get(
    `${basePath}`,
    verifyToken,
    CompanyMasterController.getAllByView
)
// Route to retrieve a record by ID
router.get(
    `${basePath}/getById`,
    verifyToken,
    CompanyMasterController.getByIdByView
)
// Route to delete a record by ID
router.delete(
    `${basePath}/delete`,
    verifyToken,
    CompanyMasterController.deleteData
)


// Export the router for use in other parts of the application
export default router
