import CouponsController from "./coupons.controller.js";
import commonPath from "../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
const {express,verifyToken,basePathRoute} = commonPath

// Define the base path for routes
const basePath=`${basePathRoute}/coupons`
const router = express.Router()
// Route to create a new record

router.post(
    `${basePath}/create`,
    verifyToken,
    CouponsController.create
)
// Route to update an existing record by ID
router.put(
    `${basePath}/update`,
    verifyToken,
    CouponsController.update
)
// Route to retrieve all records
router.get(
    `${basePath}`,
    verifyToken,
    CouponsController.getAllByView
)
// Route to retrieve a record by ID
router.get(
    `${basePath}/getById`,
    verifyToken,
    CouponsController.getByIdByView
)
// Route to delete a record by ID
router.delete(
    `${basePath}/delete`,
    verifyToken,
    CouponsController.deleteData
)
// Route to bulk create or update records
router.post(
    `${basePath}/bulkCreateOrUpdateCoupons`,
    verifyToken,
    CouponsController.bulkCreateOrUpdateCoupons
)
// Route to get coupon by user id and gift_master_id
router.get(
    `${basePath}/getCoupon/redeem`,
    verifyToken,
    CouponsController.getCouponAndRedeem
)   

// Export the router for use in other parts of the application
export default router
