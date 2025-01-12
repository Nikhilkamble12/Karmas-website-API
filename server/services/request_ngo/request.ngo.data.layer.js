import RequestNgoModel from "./request.ngo.model.js";
import commonPath from "../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
const { db, ViewFieldTableVise, tokenData } = commonPath // Destructure necessary components from commonPath

const RequestNgoDAL = {
      // Method to create a new record in the database
      CreateData: async (data) => {
        try {
            const createdData = await RequestNgoModel(db.sequelize).create(data)
            return createdData // Return the created data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, 
    // Method to update an existing record by its ID
    UpdateData: async (Request_Ngo_Id, data) => {
        try {
            const updateData = await RequestNgoModel(db.sequelize).update(data, { where: { Request_Ngo_Id: Request_Ngo_Id } })
            return updateData // Return the result of the update operation
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, 
    // Method to retrieve all records by view
    getAllDataByView: async () => {
        try {
            const getAllData = await db.sequelize.query(`${ViewFieldTableVise.CITY_MASTER_FIELDS}`, { type: db.Sequelize.QueryTypes.SELECT })
            return getAllData // Return the retrieved data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    },
    // Method to retrieve a specific record by its ID
    getDataByIdByView: async (Request_Ngo_Id) => {
        try {
            const getDataById = await db.sequelize.query(` ${ViewFieldTableVise.CITY_MASTER_FIELDS} where Request_Ngo_Id  = ${Request_Ngo_Id} `, { type: db.Sequelize.QueryTypes.SELECT })
            return getDataById[0] ?? [] // Return the retrieved data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, 
    // Method to mark a record as deleted (soft delete)
    deleteDataById: async (Request_Ngo_Id, req, res) => {
        try {
            const [deleteDataById] = await RequestNgoModel(db.sequelize).update({ is_active: 0, deleted_by: tokenData(req, res), deleted_at: new Date() }, {
                where: {
                    Request_Ngo_Id: Request_Ngo_Id
                }
            })
            return deleteDataById
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }
}

export default RequestNgoDAL