import NgoMasterController from "./ngo.master.controller.js";
import commonPath from "../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
const { express, verifyToken, basePathRoute } = commonPath

// Define the base path for routes
const basePath = `${basePathRoute}/ngo_master`
const router = express.Router()
// Route to create a new record

router.post(
    `${basePath}/create`,
    // verifyToken,
    NgoMasterController.create
)
// Route to update an existing record by ID
router.put(
    `${basePath}/update`,
    verifyToken,
    NgoMasterController.update
)
// Route to retrieve all records
router.get(
    `${basePath}`,
    verifyToken,
    NgoMasterController.getAllByView
)
// Route to retrive all records with limit
router.get(
    `${basePath}/getData`,
    verifyToken,
    NgoMasterController.getAllByViewWithLimit
)
// Route to retrieve a record by ID
router.get(
    `${basePath}/getById`,
    verifyToken,
    NgoMasterController.getByIdByView
)
// Route to delete a record by ID
router.delete(
    `${basePath}/delete`,
    verifyToken,
    NgoMasterController.deleteData
)
// Create Or update Ngo Master
router.post(
    `${basePath}/create/update`,
    verifyToken,
    NgoMasterController.createOrUpdateNgoMaster
)
// Get Ngo Data By Id
router.get(
    `${basePath}/getNgo/Databy`,
    verifyToken,
    NgoMasterController.getNgoMasterData
)
// Blacklist Ngo 
router.put(
    `${basePath}/blacklist/Ngo`,
    verifyToken,
    NgoMasterController.blacklistNgo
)

router.get(
    `${basePath}/getBlackist/getAll`,
    verifyToken,
    NgoMasterController.getAllBlacklisedNgo
)
// Export the router for use in other parts of the application

router.get(
    `${basePath}/getngo/Dashboard/count`,
    verifyToken,
    NgoMasterController.ngoDashBoardCount
)
export default router
