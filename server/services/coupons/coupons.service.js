import CouponsDAL from "./coupons.data.layer.js";

const CouponsService = {
     // Method to create a new record
     createService: async (data) => {
        try {
            return await CouponsDAL.CreateData(data)
        } catch (error) {
            throw error
        }
    },
    // Method to update an existing record by its ID 
    updateService: async (coupon_id, data) => {
        try {
            return await CouponsDAL.UpdateData(coupon_id, data)
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve all records
    getAllService: async () => {
        try {
            return await CouponsDAL.getAllDataByView()
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve a specific record by its ID 
    getServiceById: async (coupon_id) => {
        try {
            return await CouponsDAL.getDataByIdByView(coupon_id)
        } catch (error) {
            throw error
        }
    }, 
    // Method to mark a record as deleted (soft delete) by its ID
    deleteByid: async (coupon_id, req, res) => {
        try {
            return await CouponsDAL.deleteDataById(coupon_id, req, res)
        } catch (error) {
            throw error
        }
    },
    // Method to bulk create records
    bulkCreateOrUpdateService: async (data) => {
        try {
            return await CouponsDAL.bulkCreateOrUpdateData(data)
        } catch (error) {
            throw error
        }
    },
    getCouponsByUserId: async (user_id) => {
        try {
            return await CouponsDAL.getCouponsByUserId(user_id)
        } catch (error) {
            throw error
        }
    },
    getCouponAndRedeemService: async (user_id, gift_master_id) => {
        try {
            return await CouponsDAL.getCouponAndRedeem(user_id, gift_master_id)
        } catch (error) {
            throw error
        }
    },
    getNewCoupon : async (gift_master_id) => {
        try {
            const newCoupon = await CouponsDAL.getNewCoupon(gift_master_id)
            return newCoupon // Return the retrieved coupon
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }
}
export default CouponsService