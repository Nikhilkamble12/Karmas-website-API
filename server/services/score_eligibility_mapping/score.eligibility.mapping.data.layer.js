import ScoreEligibilityMapping from "./score.eligibility.mapping.model.js";
import commonPath from "../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
const { db, ViewFieldTableVise, tokenData } = commonPath // Destructure necessary components from commonPath

const ScoreEligibilityMappingDAL = {
    // Method to create a new record in the database
    CreateData: async (data) => {
        try {
            const createdData = await ScoreEligibilityMapping(db.sequelize).create(data)
            return createdData // Return the created data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, 
    // Method to update an existing record by its ID
    UpdateData: async (mapping_id, data) => {
        try {
            const updateData = await ScoreEligibilityMapping(db.sequelize).update(data, { where: { mapping_id: mapping_id } })
            return updateData // Return the result of the update operation
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, 
    // Method to retrieve all records by view
    getAllDataByView: async () => {
        try {
            const getAllData = await db.sequelize.query(`${ViewFieldTableVise.SCORE_ELIGIBILITY_MAPPING_FIELDS}`, { type: db.Sequelize.QueryTypes.SELECT })
            return getAllData // Return the retrieved data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    },
    // Method to retrieve a specific record by its ID
    getDataByIdByView: async (mapping_id) => {
        try {
            const getDataById = await db.sequelize.query(` ${ViewFieldTableVise.SCORE_ELIGIBILITY_MAPPING_FIELDS} where mapping_id  = ${mapping_id} `, { type: db.Sequelize.QueryTypes.SELECT })
            return getDataById[0] ?? [] // Return the retrieved data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, 
    // Method to mark a record as deleted (soft delete)
    deleteDataById: async (mapping_id, req, res) => {
        try {
            const [deleteDataById] = await ScoreEligibilityMapping(db.sequelize).update({ is_active: 0, deleted_by: tokenData(req, res), deleted_at: new Date() }, {
                where: {
                    mapping_id: mapping_id
                }
            })
            return deleteDataById
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }
}

export default ScoreEligibilityMappingDAL