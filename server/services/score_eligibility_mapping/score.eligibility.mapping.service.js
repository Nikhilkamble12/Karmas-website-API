import ScoreEligibilityMappingDAL from "./score.eligibility.mapping.data.layer.js";

const ScoreEligibilityMappingService = {
    // Method to create a new record
    createService: async (data) => {
        try {
            return await ScoreEligibilityMappingDAL.CreateData(data)
        } catch (error) {
            throw error
        }
    },
    // Method to update an existing record by its ID 
    updateService: async (mapping_id, data) => {
        try {
            return await ScoreEligibilityMappingDAL.UpdateData(mapping_id, data)
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve all records
    getAllService: async () => {
        try {
            return await ScoreEligibilityMappingDAL.getAllDataByView()
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve a specific record by its ID 
    getServiceById: async (mapping_id) => {
        try {
            return await ScoreEligibilityMappingDAL.getDataByIdByView(mapping_id)
        } catch (error) {
            throw error
        }
    }, 
    // Method to mark a record as deleted (soft delete) by its ID
    deleteByid: async (mapping_id, req, res) => {
        try {
            return await ScoreEligibilityMappingDAL.deleteDataById(mapping_id, req, res)
        } catch (error) {
            throw error
        }
    }
}

export default ScoreEligibilityMappingService