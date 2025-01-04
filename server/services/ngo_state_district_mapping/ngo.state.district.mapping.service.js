import NgoOfficeDistrictMappingDAL from "./ngo.state.district.mapping.data.layer.js";

const NgoStateDistrictMappingService = {
    // Method to create a new record
    createService: async (data) => {
        try {
            return await NgoOfficeDistrictMappingDAL.CreateData(data)
        } catch (error) {
            throw error
        }
    },
    // Method to update an existing record by its ID 
    updateService: async (ngo_state_district_mapping_id, data) => {
        try {
            return await NgoOfficeDistrictMappingDAL.UpdateData(ngo_state_district_mapping_id, data)
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve all records
    getAllService: async () => {
        try {
            return await NgoOfficeDistrictMappingDAL.getAllDataByView()
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve a specific record by its ID 
    getServiceById: async (ngo_state_district_mapping_id) => {
        try {
            return await NgoOfficeDistrictMappingDAL.getDataByIdByView(ngo_state_district_mapping_id)
        } catch (error) {
            throw error
        }
    }, 
    // Method to mark a record as deleted (soft delete) by its ID
    deleteByid: async (ngo_state_district_mapping_id, req, res) => {
        try {
            return await NgoOfficeDistrictMappingDAL.deleteDataById(ngo_state_district_mapping_id, req, res)
        } catch (error) {
            throw error
        }
    },getDataByNgoId:async(ngo_id)=>{
        try{
            return await NgoOfficeDistrictMappingDAL.getDataByNgoId(ngo_id)
        }catch(error){
            throw error
        }
    }
}
export default NgoStateDistrictMappingService