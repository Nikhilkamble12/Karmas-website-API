import DesignationMasterModel from "./designation.master.model.js";
import commonPath from "../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
const { db, ViewFieldTableVise, tokenData } = commonPath // Destructure necessary components from commonPath

const DestinationMasterDAL = {
    // Method to create a new record in the database
    CreateData: async (data) => {
        try {
            const createdData = await DesignationMasterModel(db.sequelize).create(data)
            return createdData // Return the created data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, 
    // Method to update an existing record by its ID
    UpdateData: async (designation_id, data) => {
        try {
            const updateData = await DesignationMasterModel(db.sequelize).update(data, { where: { designation_id: designation_id } })
            return updateData // Return the result of the update operation
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, 
    // Method to retrieve all records by view
    getAllDataByView: async () => {
        try {
            const getAllData = await db.sequelize.query(`${ViewFieldTableVise.DESIGNATION_MASTER_FIELDS}`, { type: db.Sequelize.QueryTypes.SELECT })
            return getAllData // Return the retrieved data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    },
    // Method to retrieve a specific record by its ID
    getDataByIdByView: async (designation_id) => {
        try {
            const getDataById = await db.sequelize.query(` ${ViewFieldTableVise.DESIGNATION_MASTER_FIELDS} where designation_id  = ${designation_id} `, { type: db.Sequelize.QueryTypes.SELECT })
            return getDataById[0] ?? [] // Return the retrieved data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, 
    // Method to mark a record as deleted (soft delete)
    deleteDataById: async (designation_id, req, res) => {
        try {
            const [deleteDataById] = await DesignationMasterModel(db.sequelize).update({ is_active: 0, deleted_by: tokenData(req, res), deleted_at: new Date() }, {
                where: {
                    designation_id: designation_id
                }
            })
            return deleteDataById
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    },getDataByTableId:async(table_id)=>{
        try{
            const getAllData = await db.sequelize.query(` ${ViewFieldTableVise.DESIGNATION_MASTER_FIELDS} where table_id = ${table_id} `, { type: db.Sequelize.QueryTypes.SELECT })
            return getAllData // Return the retrieved data
        }catch(error){
            throw error
        }
    }
}
export default DestinationMasterDAL