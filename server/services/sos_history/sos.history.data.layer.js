import SosHistoryModel from "./sos.history.model.js";
import commonPath from "../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
const { db, ViewFieldTableVise, tokenData } = commonPath // Destructure necessary components from commonPath

const SosHistoryDAL = {
    // Method to create a new record in the database
     CreateData: async (data) => {
        try {
            const createdData = await SosHistoryModel(db.sequelize).create(data)
            return createdData // Return the created data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, 
    // Method to update an existing record by its ID
    UpdateData: async (history_id, data) => {
        try {
            const updateData = await SosHistoryModel(db.sequelize).update(data, { where: { history_id: history_id } })
            return updateData // Return the result of the update operation
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, 
    // Method to retrieve all records by view
    getAllDataByView: async () => {
        try {
            const getAllData = await db.sequelize.query(`${ViewFieldTableVise.SOS_HISTORY_FIELDS}`, { type: db.Sequelize.QueryTypes.SELECT })
            return getAllData // Return the retrieved data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    },
    // Method to retrieve a specific record by its ID
    getDataByIdByView: async (history_id) => {
        try {
            const getDataById = await db.sequelize.query(` ${ViewFieldTableVise.SOS_HISTORY_FIELDS} where history_id  = ${history_id} `, { type: db.Sequelize.QueryTypes.SELECT })
            return getDataById[0] ?? [] // Return the retrieved data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, 
    // Method to mark a record as deleted (soft delete)
    deleteDataById: async (history_id, req, res) => {
        try {
            const [deleteDataById] = await SosHistoryModel(db.sequelize).update({ is_active: 0, deleted_by: tokenData(req, res), deleted_at: new Date() }, {
                where: {
                    history_id: history_id
                }
            })
            return deleteDataById
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    },getByuserId:async(user_id)=>{
        try{
            const getAllData = await db.sequelize.query(`${ViewFieldTableVise.SOS_HISTORY_FIELDS} where user_id = ${user_id} `, { type: db.Sequelize.QueryTypes.SELECT })
            return getAllData // Return the retrieved data
        }catch(error){
            throw error
        }
    },getByUserIdLatestAndSosOn:async(user_id,is_sos_on)=>{
        try{
            const getDataById = await db.sequelize.query(` ${ViewFieldTableVise.SOS_HISTORY_FIELDS} where user_id = ${user_id} and is_sos_on = ${is_sos_on} order by history_id desc limit 1 `,{type:db.Sequelize.QueryTypes.SELECT})
            return getDataById
        }catch(error){
            throw error
        }
    },getDataBySosId:async(sos_id)=>{
        try{
            const getDataById = await db.sequelize.query(`${ViewFieldTableVise.SOS_HISTORY_FIELDS} where sos_id = ${sos_id} `, { type: db.Sequelize.QueryTypes.SELECT })
            return getDataById
        }catch(error){
            throw error
        }
    }
}
export default SosHistoryDAL