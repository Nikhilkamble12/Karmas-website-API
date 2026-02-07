import NgoRequestDocumentCategoryController from "./ngo.request.document.category.controller.js";
import commonPath from "../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
const {express,verifyToken,basePathRoute} = commonPath

// Define the base path for routes
const basePath=`${basePathRoute}/ngo_request_document_category`
const router = express.Router()
// Route to create a new record


router.post(
    `${basePath}/create`,
    verifyToken,
    NgoRequestDocumentCategoryController.create
)
// Route to update an existing record by ID
router.put(
    `${basePath}/update`,
    verifyToken,
    NgoRequestDocumentCategoryController.update
)
// Route to retrieve all records
router.get(
    `${basePath}`,
    // verifyToken,
    NgoRequestDocumentCategoryController.getAllByView
)
// Route to retrieve a record by ID
router.get(
    `${basePath}/getById`,
    verifyToken,
    NgoRequestDocumentCategoryController.getByIdByView
)
// Route to delete a record by ID
router.delete(
    `${basePath}/delete`,
    verifyToken,
    NgoRequestDocumentCategoryController.deleteData
)
router.get(
    `${basePath}/getBy/ngoId`,
    verifyToken,
    NgoRequestDocumentCategoryController.getDataByNgoId
)

// Export the router for use in other parts of the application
export default router