import DesignationMasterController from "./designation.master.controller.js";
import commonPath from "../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
const {express,verifyToken,basePathRoute} = commonPath

// Define the base path for routes
const basePath=`${basePathRoute}/designation_master`
const router = express.Router()
// Route to create a new record

router.post(
    `${basePath}/create`,
    // verifyToken,
    DesignationMasterController.create
)
// Route to update an existing record by ID
router.put(
    `${basePath}/update`,
    verifyToken,
    DesignationMasterController.update
)
// Route to retrieve all records
router.get(
    `${basePath}`,
    verifyToken,
    DesignationMasterController.getAllByView
)
// Route to retrieve a record by ID
router.get(
    `${basePath}/getById`,
    verifyToken,
    DesignationMasterController.getByIdByView
)
// Route to delete a record by ID
router.delete(
    `${basePath}/delete`,
    verifyToken,
    DesignationMasterController.deleteData
)
// Router get Data By Table Id 
router.get(
    `${basePath}/getDataBy/TableId`,
    verifyToken,
    DesignationMasterController.getDataByTableId
)
// Router to get Data for Ngo Office Berears 
router.get(
    `${basePath}/getOffice/berearslist`,
    verifyToken,
    DesignationMasterController.getDataForNgoOfficeBerearsId
)

// Export the router for use in other parts of the application
export default router

