import DashBoardController from "./dashboard.contoller.js";
import commonPath from "../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
const {express,verifyToken,basePathRoute} = commonPath


// Define the base path for routes
const basePath=`${basePathRoute}/dashboard`
const router = express.Router()
// Route to create a new record

// web DashBoard 
router.get(`${basePath}/getWeb/DashBoard`,
    verifyToken,
    DashBoardController.webDashBoardData
)

// Export the router for use in other parts of the application
export default router