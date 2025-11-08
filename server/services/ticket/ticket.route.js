import TicketController from "./ticket.controller.js";
import commonPath from "../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
const {express,verifyToken,basePathRoute} = commonPath

// Define the base path for routes
const basePath=`${basePathRoute}/ticket`
const router = express.Router()
// Route to create a new record


router.post(
    `${basePath}/create`,
    verifyToken,
    TicketController.create
)
// Route to update an existing record by ID
router.put(
    `${basePath}/update`,
    verifyToken,
    TicketController.update
)
// Route to retrieve all records
router.get(
    `${basePath}`,
    verifyToken,
    TicketController.getAllByView
)
// Route to retrieve a record by ID
router.get(
    `${basePath}/getById`,
    verifyToken,
    TicketController.getByIdByView
)
// Route to delete a record by ID
router.delete(
    `${basePath}/delete`,
    verifyToken,
    TicketController.deleteData
)

// Export the router for use in other parts of the application
export default router