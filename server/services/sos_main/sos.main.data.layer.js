import SosMainModel from "./sos.main.model.js";
import commonPath from "../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
const { db, ViewFieldTableVise, tokenData } = commonPath // Destructure necessary components from commonPath

const SosMainDAL = {
    // Method to create a new record in the database
     CreateData: async (data) => {
        try {
            const createdData = await SosMainModel(db.sequelize).create(data)
            return createdData // Return the created data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, 
    // Method to update an existing record by its ID
    UpdateData: async (sos_id, data) => {
        try {
            const updateData = await SosMainModel(db.sequelize).update(data, { where: { sos_id: sos_id } })
            return updateData // Return the result of the update operation
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, 
    // Method to retrieve all records by view
    getAllDataByView: async () => {
        try {
            const getAllData = await db.sequelize.query(`${ViewFieldTableVise.SOS_MAIN_FIELDS}`, { type: db.Sequelize.QueryTypes.SELECT })
            return getAllData // Return the retrieved data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    },
    // Method to retrieve a specific record by its ID
    getDataByIdByView: async (sos_id) => {
        try {
            const getDataById = await db.sequelize.query(` ${ViewFieldTableVise.SOS_MAIN_FIELDS} where sos_id  = ${sos_id} `, { type: db.Sequelize.QueryTypes.SELECT })
            return getDataById[0] ?? [] // Return the retrieved data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, 
    // Method to mark a record as deleted (soft delete)
    deleteDataById: async (sos_id, req, res) => {
        try {
            const [deleteDataById] = await SosMainModel(db.sequelize).update({ is_active: 0, deleted_by: tokenData(req, res), deleted_at: new Date() }, {
                where: {
                    sos_id: sos_id
                }
            })
            return deleteDataById
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    },getDataByUserId:async(user_id)=>{
        try{
            const getDataByUserId = await db.sequelize.query(`${ViewFieldTableVise.SOS_MAIN_FIELDS} where user_id = ${user_id} `, { type: db.Sequelize.QueryTypes.SELECT })
            return getDataByUserId
        }catch(error){
            throw error
        }
    },getByUserIdAndOnlyActive:async(user_id)=>{
        try{
            const getDataByUserId = await db.sequelize.query(` ${ViewFieldTableVise.SOS_MAIN_FIELDS} where user_id = ${user_id} and is_sos_on = true `,{type:db.Sequelize.QueryTypes.SELECT})
            return getDataByUserId
        }catch(error){
            throw error
        }
    },getDataByWhoseSosIsOn:async()=>{
        try{
            const getDataWhoseSosOn = await db.sequelize.query(` ${ViewFieldTableVise.SOS_MAIN_FIELDS} where is_sos_on = true `,{type:db.Sequelize.QueryTypes.SELECT})
            return getDataWhoseSosOn
        }catch(error){
            throw error
        }
    }
}
export default SosMainDAL