import TempEmailVerificationController from "./temp.email.verification.controller.js";
import commonPath from "../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
const {express,verifyToken,basePathRoute} = commonPath

// Define the base path for routes
const basePath=`${basePathRoute}/email_verification`
const router = express.Router()
// Route to create a new record

router.post(
    `${basePath}/create`,
    verifyToken,
    TempEmailVerificationController.create
)
// Route to update an existing record by ID
router.put(
    `${basePath}/update`,
    verifyToken,
    TempEmailVerificationController.update
)
// Route to retrieve all records
router.get(
    `${basePath}`,
    verifyToken,
    TempEmailVerificationController.getAll
)
// Route to retrieve a record by ID
router.get(
    `${basePath}/getById`,
    verifyToken,
    TempEmailVerificationController.getById
)
// Route to delete a record by ID
router.delete(
    `${basePath}/delete`,
    verifyToken,
    TempEmailVerificationController.delete
)
// Router To Resesnd otp 
router.post(
    `${basePath}/resendOtp/email`,
    TempEmailVerificationController.resendOtp
)
// Router To Verify otp 
router.post(
    `${basePath}/verifyOtp`,
    TempEmailVerificationController.verifyOtp
)



// Export the router for use in other parts of the application
export default router
