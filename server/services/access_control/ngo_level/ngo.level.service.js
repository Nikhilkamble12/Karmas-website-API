import NgoLevelDAL from "./ngo.level.data.layer.js";

const NgoLevelService = {
     // Method to create a new record
    createService: async (data) => {
        try {
            return await NgoLevelDAL.CreateData(data)
        } catch (error) {
            throw error
        }
    },
    // Method to update an existing record by its ID 
    updateService: async (ngo_level_id, data) => {
        try {
            return await NgoLevelDAL.UpdateData(ngo_level_id, data)
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve all records
    getAllService: async () => {
        try {
            return await NgoLevelDAL.getAllDataByView()
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve a specific record by its ID 
    getServiceById: async (ngo_level_id) => {
        try {
            return await NgoLevelDAL.getDataByIdByView(ngo_level_id)
        } catch (error) {
            throw error
        }
    }, 
    // Method to mark a record as deleted (soft delete) by its ID
    deleteByid: async (ngo_level_id, req, res) => {
        try {
            return await NgoLevelDAL.deleteDataById(ngo_level_id, req, res)
        } catch (error) {
            throw error
        }
    }
}

export default NgoLevelService