import NgoRegistrationController from "./ngo.registration.constroller.js";
import commonPath from "../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
const {express,verifyToken,basePathRoute} = commonPath

// Define the base path for routes
const basePath=`${basePathRoute}/ngo_registration`
const router = express.Router()
// Route to create a new record

router.post(
    `${basePath}/create`,
    verifyToken,
    NgoRegistrationController.create
)
// Route to update an existing record by ID
router.put(
    `${basePath}/update`,
    verifyToken,
    NgoRegistrationController.update
)
// Route to retrieve all records
router.get(
    `${basePath}`,
    verifyToken,
    NgoRegistrationController.getAllByView
)
// Route to retrieve a record by ID
router.get(
    `${basePath}/getById`,
    verifyToken,
    NgoRegistrationController.getByIdByView
)
// Route to delete a record by ID
router.delete(
    `${basePath}/delete`,
    verifyToken,
    NgoRegistrationController.deleteData
)
// Router Update Status
router.put(
    `${basePath}/update/status`,
    verifyToken,
    NgoRegistrationController.updateStatusOfRegistration
)
// Router 
router.post(
    `${basePath}/resend/otp`,
    verifyToken,
    NgoRegistrationController.ValidateEmailAndSendOtp
)
// Router To Verify OTP
router.post(
    `${basePath}/verify/otp`,
    verifyToken,
    NgoRegistrationController.verifyOtpByData
)



// Export the router for use in other parts of the application
export default router