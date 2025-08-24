import CouponsModel from "./coupons.model.js";
import commonPath from "../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
const { db, ViewFieldTableVise, tokenData } = commonPath // Destructure necessary components from commonPath

const CouponsDAL = {
    // Method to create a new record in the database
    CreateData: async (data) => {
        try {
            const createdData = await CouponsModel(db.sequelize).create(data)
            return createdData // Return the created data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, 
    // Method to update an existing record by its ID
    UpdateData: async (coupon_id, data) => {
        try {
            const updateData = await CouponsModel(db.sequelize).update(data, { where: { coupon_id: coupon_id } })
            return updateData // Return the result of the update operation
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, 
    // Method to retrieve all records by view
    getAllDataByView: async () => {
        try {
            const getAllData = await db.sequelize.query(`${ViewFieldTableVise.COUPONS_FIELDS}`, { type: db.Sequelize.QueryTypes.SELECT })
            return getAllData // Return the retrieved data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    },
    // Method to retrieve a specific record by its ID
    getDataByIdByView: async (coupon_id) => {
        try {
            const getDataById = await db.sequelize.query(` ${ViewFieldTableVise.COUPONS_FIELDS} where coupon_id  = ${coupon_id} `, { type: db.Sequelize.QueryTypes.SELECT })
            return getDataById[0] ?? [] // Return the retrieved data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, 
    // Method to mark a record as deleted (soft delete)
    deleteDataById: async (coupon_id, req, res) => {
        try {
            const [deleteDataById] = await CouponsModel(db.sequelize).update({ is_active: 0, deleted_by: tokenData(req, res), deleted_at: new Date() }, {
                where: {
                    coupon_id: coupon_id
                }
            })
            return deleteDataById
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    },
    // Method to bulk create records
    bulkCreateOrUpdateData: async (data) => {
        try {
            const bulkCreateData = await CouponsModel(db.sequelize).bulkCreate(data, { updateOnDuplicate: ["gift_master_id","coupon_code","status_id","redeem_date","redeem_time","is_active"] })
            return bulkCreateData // Return the result of the bulk create operation
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    },
    // Method to retrieve coupons by user ID
    getCouponsByUserId: async (user_id) => {
        try {
            const getCouponsByUserId = await db.sequelize.query(` ${ViewFieldTableVise.COUPONS_FIELDS} where user_id  = ${user_id} `, { type: db.Sequelize.QueryTypes.SELECT })
            return getCouponsByUserId // Return the retrieved coupons
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    },
    getCouponAndRedeem : async (user_id, gift_master_id) => {
        try {
            const getCouponAndRedeem = await db.sequelize.query(` ${ViewFieldTableVise.COUPONS_FIELDS} where user_id  = ${user_id} AND gift_master_id = ${gift_master_id} `, { type: db.Sequelize.QueryTypes.SELECT })
            return getCouponAndRedeem[0] ?? [] // Return the retrieved coupon
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    },
    getNewCoupon : async (gift_master_id) => {
        try {
            const newCoupon = await db.sequelize.query(` ${ViewFieldTableVise.COUPONS_FIELDS} where gift_master_id = ${gift_master_id} AND user_id IS NULL` , { type: db.Sequelize.QueryTypes.SELECT })
            return newCoupon[0] ?? [] // Return the retrieved coupon
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    },
}
export default CouponsDAL