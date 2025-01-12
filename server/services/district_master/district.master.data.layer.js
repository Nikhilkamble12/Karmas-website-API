import DistrictMasterModel from "./district.master.model.js";
import commonPath from "../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
const { db, ViewFieldTableVise, tokenData } = commonPath // Destructure necessary components from commonPath

const DistrictMasterDAL = {
    // Method to create a new record in the database
    CreateData: async (data) => {
        try {
            const createdData = await DistrictMasterModel(db.sequelize).create(data)
            return createdData // Return the created data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, 
    // Method to update an existing record by its ID
    UpdateData: async (district_id, data) => {
        try {
            const updateData = await DistrictMasterModel(db.sequelize).update(data, { where: { district_id: district_id } })
            return updateData // Return the result of the update operation
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, 
    // Method to retrieve all records by view
    getAllDataByView: async () => {
        try {
            const getAllData = await db.sequelize.query(` ${ViewFieldTableVise.DISTRICT_MASTER_FIELDS}`, { type: db.Sequelize.QueryTypes.SELECT })
            return getAllData // Return the retrieved data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    },
    // Method to retrieve a specific record by its ID
    getDataByIdByView: async (district_id) => {
        try {
            const getDataById = await db.sequelize.query(` ${ViewFieldTableVise.DISTRICT_MASTER_FIELDS} where district_id  = ${district_id} `, { type: db.Sequelize.QueryTypes.SELECT })
            return getDataById[0] ?? [] // Return the retrieved data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, 
    // Method to mark a record as deleted (soft delete)
    deleteDataById: async (district_id, req, res) => {
        try {
            const [deleteDataById] = await DistrictMasterModel(db.sequelize).update({ is_active: 0, deleted_by: tokenData(req, res), deleted_at: new Date() }, {
                where: {
                    district_id: district_id
                }
            })
            return deleteDataById
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    },
    getDataByStateIdByView: async (state_id) => {
        try {
            const getDataById = await db.sequelize.query(` ${ViewFieldTableVise.DISTRICT_MASTER_FIELDS} where state_id  = ${state_id} `, { type: db.Sequelize.QueryTypes.SELECT })
            return getDataById
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    },getDataByCountryIdByView:async(country_id)=>{
        try{
            const getDataById = await db.sequelize.query(` ${ViewFieldTableVise.DISTRICT_MASTER_FIELDS} where country_id  = ${country_id} `, { type: db.Sequelize.QueryTypes.SELECT })
            return getDataById
        }catch(error){
            throw error
        }
    }
}

export default DistrictMasterDAL