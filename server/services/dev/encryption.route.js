import commonPath from "../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
const {express,verifyToken,basePathRoute} = commonPath
import encryptionController from "./encryption.controller.js";

// Define the base path for routes

const router = express.Router()
const basePath="/api/v1"

router.post(
  `${basePath}/encrypt`,
  encryptionController.createEncryption
)
router.post(
  `${basePath}/decrypt`,
  encryptionController.createDecryption
)

export default router;