import CouponMasterDAL from "./coupon.master.data.layer.js";

const CouponMasterService = {
     // Method to create a new record
     createService: async (data) => {
        try {
            return await CouponMasterDAL.CreateData(data)
        } catch (error) {
            throw error
        }
    },
    // Method to update an existing record by its ID 
    updateService: async (coupon_id, data) => {
        try {
            return await CouponMasterDAL.UpdateData(coupon_id, data)
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve all records
    getAllService: async () => {
        try {
            return await CouponMasterDAL.getAllDataByView()
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve a specific record by its ID 
    getServiceById: async (coupon_id) => {
        try {
            return await CouponMasterDAL.getDataByIdByView(coupon_id)
        } catch (error) {
            throw error
        }
    }, 
    // Method to mark a record as deleted (soft delete) by its ID
    deleteByid: async (coupon_id, req, res) => {
        try {
            return await CouponMasterDAL.deleteDataById(coupon_id, req, res)
        } catch (error) {
            throw error
        }
    }
}
export default CouponMasterService