import GiftMasterModel from "./gift.master.model.js";
import commonPath from "../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
const { db, ViewFieldTableVise, tokenData } = commonPath // Destructure necessary components from commonPath

const GiftMasterDAL = {
    // Method to create a new record in the database
    CreateData: async (data) => {
        try {
            console.log("data",data)
            const createdData = await GiftMasterModel(db.sequelize).create(data)
            return createdData // Return the created data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, 
    // Method to update an existing record by its ID
    UpdateData: async (gift_master_id, data) => {
        try {
            const updateData = await GiftMasterModel(db.sequelize).update(data, { where: { gift_master_id: gift_master_id } })
            return updateData // Return the result of the update operation
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, 
    // Method to retrieve all records by view
    getAllDataByView: async () => {
        try {
            const getAllData = await db.sequelize.query(`${ViewFieldTableVise.GIFT_MASTER_FIELDS} where is_active = 1 order by gift_score_required ASC`, { type: db.Sequelize.QueryTypes.SELECT })
            return getAllData // Return the retrieved data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    },
    // Method to retrieve a specific record by its ID
    getDataByIdByView: async (gift_master_id) => {
        try {
            const getDataById = await db.sequelize.query(` ${ViewFieldTableVise.GIFT_MASTER_FIELDS} where gift_master_id  = ${gift_master_id} `, { type: db.Sequelize.QueryTypes.SELECT })
            return getDataById[0] ?? [] // Return the retrieved data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, 
    // Method to mark a record as deleted (soft delete)
    deleteDataById: async (gift_master_id, req, res) => {
        try {
            const [deleteDataById] = await GiftMasterModel(db.sequelize).update({ is_active: 0, deleted_by: tokenData(req, res), deleted_at: new Date() }, {
                where: {
                    gift_master_id: gift_master_id
                }
            })
            return deleteDataById
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    },getTotalGiftCount: async () => {
    try {
        const result = await db.sequelize.query(
            `SELECT COUNT(*) AS total_count FROM gift_master`,
            { type: db.Sequelize.QueryTypes.SELECT }
        );

        return result[0]?.total_count ?? 0;
    } catch (error) {
        throw error;
    }
},

}
export default GiftMasterDAL