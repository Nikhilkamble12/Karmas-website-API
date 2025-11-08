import NgoFieldMappingDAL from "./ngo.field.mapping.data.layer.js";

const NgoFieldsMappingService = {
    // Method to create a new record
    createService: async (data) => {
        try {
            return await NgoFieldMappingDAL.CreateData(data)
        } catch (error) {
            throw error
        }
    },
    // Method to update an existing record by its ID 
    updateService: async (ngo_field_mapping_id, data) => {
        try {
            return await NgoFieldMappingDAL.UpdateData(ngo_field_mapping_id, data)
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve all records
    getAllService: async () => {
        try {
            return await NgoFieldMappingDAL.getAllDataByView()
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve a specific record by its ID 
    getServiceById: async (ngo_field_mapping_id) => {
        try {
            return await NgoFieldMappingDAL.getDataByIdByView(ngo_field_mapping_id)
        } catch (error) {
            throw error
        }
    }, 
    // Method to mark a record as deleted (soft delete) by its ID
    deleteByid: async (ngo_field_mapping_id, req, res) => {
        try {
            return await NgoFieldMappingDAL.deleteDataById(ngo_field_mapping_id, req, res)
        } catch (error) {
            throw error
        }
    }
}
export default NgoFieldsMappingService