import TicketModuleTypeController from "./ticket.module.type.controller.js";
import commonPath from "../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
const {express,verifyToken,basePathRoute} = commonPath

// Define the base path for routes
const basePath=`${basePathRoute}/ticket_moodule_type`
const router = express.Router()
// Route to create a new record


router.post(
    `${basePath}/create`,
    verifyToken,
    TicketModuleTypeController.create
)
// Route to update an existing record by ID
router.put(
    `${basePath}/update`,
    verifyToken,
    TicketModuleTypeController.update
)
// Route to retrieve all records
router.get(
    `${basePath}`,
    verifyToken,
    TicketModuleTypeController.getAllByView
)
// Route to retrieve a record by ID
router.get(
    `${basePath}/getById`,
    verifyToken,
    TicketModuleTypeController.getByIdByView
)
// Route to delete a record by ID
router.delete(
    `${basePath}/delete`,
    verifyToken,
    TicketModuleTypeController.deleteData
)

// Export the router for use in other parts of the application
export default router