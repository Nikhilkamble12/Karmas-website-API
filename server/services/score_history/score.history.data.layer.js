import ScoreHistoryModel from "./score.history.model.js";
import commonPath from "../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
const { db, ViewFieldTableVise, tokenData } = commonPath // Destructure necessary components from commonPath

const ScoreHistoryDAL = {
     // Method to create a new record in the database
     CreateData: async (data) => {
        try {
            const createdData = await ScoreHistoryModel(db.sequelize).create(data)
            return createdData // Return the created data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, 
    // Method to update an existing record by its ID
    UpdateData: async (sr_no, data) => {
        try {
            const updateData = await ScoreHistoryModel(db.sequelize).update(data, { where: { sr_no: sr_no } })
            return updateData // Return the result of the update operation
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, 
    // Method to retrieve all records by view
    getAllDataByView: async () => {
        try {
            const getAllData = await db.sequelize.query(`${ViewFieldTableVise.SIMPLE_SCORE_HISTORY_FIELDS}`, { type: db.Sequelize.QueryTypes.SELECT })
            return getAllData // Return the retrieved data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    },
    // Method to retrieve a specific record by its ID
    getDataByIdByView: async (sr_no) => {
        try {
            const getDataById = await db.sequelize.query(` ${ViewFieldTableVise.SIMPLE_SCORE_HISTORY_FIELDS} where sr_no  = ${sr_no} `, { type: db.Sequelize.QueryTypes.SELECT })
            return getDataById[0] ?? [] // Return the retrieved data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, 
    // Method to mark a record as deleted (soft delete)
    deleteDataById: async (sr_no, req, res) => {
        try {
            const [deleteDataById] = await ScoreHistoryModel(db.sequelize).update({ is_active: 0, deleted_by: tokenData(req, res), deleted_at: new Date() }, {
                where: {
                    sr_no: sr_no
                }
            })
            return deleteDataById
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    },getSimpleScoreHistoryByUserId:async(user_id)=>{
        try{
            const getDataByuserId = await db.sequelize.query(` ${ViewFieldTableVise.SIMPLE_SCORE_HISTORY_FIELDS} where user_id  = ${user_id} `, { type: db.Sequelize.QueryTypes.SELECT })
            return getDataByuserId
        }catch(error){
            throw error
        }
    }
}

export default ScoreHistoryDAL