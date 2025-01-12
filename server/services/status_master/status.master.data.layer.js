import StatusMasterModel from "./status.master.model.js";
import commonPath from "../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
const { db, ViewFieldTableVise, tokenData } = commonPath // Destructure necessary components from commonPath

const StatusMasterDAL = {
    // Method to create a new record in the database
    CreateData: async (data) => {
        try {
            const createdData = await StatusMasterModel(db.sequelize).create(data)
            return createdData // Return the created data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, 
    // Method to update an existing record by its ID
    UpdateData: async (status_id, data) => {
        try {
            const updateData = await StatusMasterModel(db.sequelize).update(data, { where: { status_id: status_id } })
            return updateData // Return the result of the update operation
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, 
    // Method to retrieve all records by view
    getAllDataByView: async () => {
        try {
            const getAllData = await db.sequelize.query(`${ViewFieldTableVise.STATE_MASTER_FIELDS}`, { type: db.Sequelize.QueryTypes.SELECT })
            return getAllData // Return the retrieved data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    },
    // Method to retrieve a specific record by its ID
    getDataByIdByView: async (status_id) => {
        try {
            const getDataById = await db.sequelize.query(` ${ViewFieldTableVise.STATE_MASTER_FIELDS} where status_id  = ${status_id} `, { type: db.Sequelize.QueryTypes.SELECT })
            return getDataById[0] ?? [] // Return the retrieved data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, 
    // Method to mark a record as deleted (soft delete)
    deleteDataById: async (status_id, req, res) => {
        try {
            const [deleteDataById] = await StatusMasterModel(db.sequelize).update({ is_active: 0, deleted_by: tokenData(req, res), deleted_at: new Date() }, {
                where: {
                    status_id: status_id
                }
            })
            return deleteDataById
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    },getDataByParentId:async(parent_id)=>{
        try{
            const getAllData = await db.sequelize.query(` ${ViewFieldTableVise.STATE_MASTER_FIELDS} where  parent_id = ${parent_id} `, { type: db.Sequelize.QueryTypes.SELECT })
            return getAllData // Return the retrieved data
        }catch(error){
            throw error
        }
    }
}
export default StatusMasterDAL