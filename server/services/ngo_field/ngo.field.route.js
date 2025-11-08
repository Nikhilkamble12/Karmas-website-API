import NgoFieldController from "./ngo.field.controller.js";
import commonPath from "../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
const {express,verifyToken,basePathRoute} = commonPath

// Define the base path for routes
const basePath=`${basePathRoute}/ngo_fields`
const router = express.Router()
// Route to create a new record

router.post(
    `${basePath}/create`,
    // verifyToken,
    NgoFieldController.create
)
// Route to update an existing record by ID
router.put(
    `${basePath}/update`,
    verifyToken,
    NgoFieldController.update
)
// Route to retrieve all records
router.get(
    `${basePath}`,
    verifyToken,
    NgoFieldController.getAllByView
)
// Route to retrieve a record by ID
router.get(
    `${basePath}/getById`,
    verifyToken,
    NgoFieldController.getByIdByView
)
// Route to delete a record by ID
router.delete(
    `${basePath}/delete`,
    verifyToken,
    NgoFieldController.deleteData
)

// Export the router for use in other parts of the application
export default router
