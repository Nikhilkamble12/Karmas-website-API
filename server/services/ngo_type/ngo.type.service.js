import NgoTypeDAL from "./ngo.type.data.layer.js";

const ngoTypeService = {
    createService: async (data) => {
        try {
            return await NgoTypeDAL.CreateData(data)
        } catch (error) {
            throw error
        }
    },
    // Method to update an existing record by its ID 
    updateService: async (ngo_type_id, data) => {
        try {
            return await NgoTypeDAL.UpdateData(ngo_type_id, data)
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve all records
    getAllService: async () => {
        try {
            return await NgoTypeDAL.getAllDataByView()
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve a specific record by its ID 
    getServiceById: async (ngo_type_id) => {
        try {
            return await NgoTypeDAL.getDataByIdByView(ngo_type_id)
        } catch (error) {
            throw error
        }
    }, 
    // Method to mark a record as deleted (soft delete) by its ID
    deleteByid: async (ngo_type_id, req, res) => {
        try {
            return await NgoTypeDAL.deleteDataById(ngo_type_id, req, res)
        } catch (error) {
            throw error
        }
    }
}

export default ngoTypeService