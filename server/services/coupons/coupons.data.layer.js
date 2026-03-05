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
            const getDataById = await db.sequelize.query(
                `${ViewFieldTableVise.COUPONS_FIELDS} WHERE coupon_id = :coupon_id`,
                {
                    replacements: { coupon_id },
                    type: db.Sequelize.QueryTypes.SELECT
                }
            )
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
            const getCouponsByUserId = await db.sequelize.query(
                `${ViewFieldTableVise.COUPONS_FIELDS} WHERE user_id = :user_id`,
                {
                    replacements: { user_id },
                    type: db.Sequelize.QueryTypes.SELECT
                }
            )
            return getCouponsByUserId // Return the retrieved coupons
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    },
    getCouponAndRedeem : async (user_id, gift_master_id) => {
        try {
            const getCouponAndRedeem = await db.sequelize.query(
                `${ViewFieldTableVise.COUPONS_FIELDS} WHERE user_id = :user_id AND gift_master_id = :gift_master_id`,
                {
                    replacements: { user_id, gift_master_id },
                    type: db.Sequelize.QueryTypes.SELECT
                }
            )
            return getCouponAndRedeem[0] || null // Return the retrieved coupon
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    },
    getNewCoupon : async (gift_master_id) => {
        try {
            const newCoupon = await db.sequelize.query(
                `${ViewFieldTableVise.COUPONS_FIELDS} WHERE gift_master_id = :gift_master_id AND user_id IS NULL`,
                {
                    replacements: { gift_master_id },
                    type: db.Sequelize.QueryTypes.SELECT
                }
            )
            return newCoupon[0] ?? [] // Return the retrieved coupon
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    },
    assignCouponToUser: async (coupon_id, data) => {
        try {
            await CouponsModel(db.sequelize).update(data, { where: { coupon_id } });
            const [assignCoupon] = await db.sequelize.query(
            `${ViewFieldTableVise.COUPONS_FIELDS} WHERE coupon_id = :coupon_id`,
            {
                replacements: { coupon_id },
                type: db.Sequelize.QueryTypes.SELECT
            }
            );
            return assignCoupon || null;
        } catch (error) {
            throw error;
        }
    },
    getCouponStatsByGiftId: async (gift_master_id) => {
        try {
            const stats = await db.sequelize.query(
                `SELECT 
                    COUNT(*) as total_coupons,
                    COUNT(user_id) as used_coupons
                FROM coupons 
                WHERE gift_master_id = :gift_master_id AND is_active = 1`,
                {
                    replacements: { gift_master_id },
                    type: db.Sequelize.QueryTypes.SELECT
                }
            );
            return stats[0] || { total_coupons: 0, used_coupons: 0 };
        } catch (error) {
            throw error;
        }
    },
    // Method to get rewards count by company for dashboard
     getRewardsCountByCompany: async (company_id = null) => {
        try {
            let query = `
                SELECT 
                    cm.company_id,
                    cm.company_name,
                    COUNT(DISTINCT gm.gift_master_id) AS total_gifts,
                    COUNT(c.coupon_id) AS total_coupons,
                    SUM(CASE WHEN c.status_id = 13 THEN 1 ELSE 0 END) AS redeemed_coupons,
                    COUNT(c.coupon_id) - SUM(CASE WHEN c.status_id = 13 THEN 1 ELSE 0 END) AS balance_coupons
                FROM company_master cm
                LEFT JOIN gift_master gm ON cm.company_id = gm.company_id AND gm.is_active = 1
                LEFT JOIN coupons c ON gm.gift_master_id = c.gift_master_id AND c.is_active = 1
                WHERE cm.is_active = 1
            `;
            
            if (company_id) {
                query += ` AND cm.company_id = :company_id`;
            }
            
            query += ` GROUP BY cm.company_id, cm.company_name ORDER BY cm.company_id `;
            
            const rewardsData = await db.sequelize.query(query, {
                replacements: company_id ? { company_id } : {},
                type: db.Sequelize.QueryTypes.SELECT
            });
            
            return rewardsData;
        } catch (error) {
            throw error;
        }
    }
}
export default CouponsDAL