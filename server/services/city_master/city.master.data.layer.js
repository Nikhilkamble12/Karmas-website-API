import CityMasterModel from "./city.master.model.js";
import commonPath from "../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
const { db, ViewFieldTableVise, tokenData } = commonPath // Destructure necessary components from commonPath

const CityMasterDAL = {
    // Method to create a new record in the database
     CreateData: async (data) => {
        try {
            const createdData = await CityMasterModel(db.sequelize).create(data)
            return createdData // Return the created data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, 
    // Method to update an existing record by its ID
    UpdateData: async (city_id, data) => {
        try {
            const updateData = await CityMasterModel(db.sequelize).update(data, { where: { city_id: city_id } })
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
    getDataByIdByView: async (city_id) => {
        try {
            const getDataById = await db.sequelize.query(` ${ViewFieldTableVise.CITY_MASTER_FIELDS} where city_id  = ${city_id} `, { type: db.Sequelize.QueryTypes.SELECT })
            return getDataById[0] ?? [] // Return the retrieved data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, 
    // Method to mark a record as deleted (soft delete)
    deleteDataById: async (city_id, req, res) => {
        try {
            const [deleteDataById] = await CityMasterModel(db.sequelize).update({ is_active: 0, deleted_by: tokenData(req, res), deleted_at: new Date() }, {
                where: {
                    city_id: city_id
                }
            })
            return deleteDataById
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    },getDataByStateIdByView: async (state_id) => {
        try {
            const getDataById = await db.sequelize.query(` ${ViewFieldTableVise.CITY_MASTER_FIELDS} where state_id  = ${state_id} `, { type: db.Sequelize.QueryTypes.SELECT })
            return getDataById // Return the retrieved data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    },
}
export default CityMasterDAL 