import DistrictMasterDAL from "./district.master.data.layer.js";

const DistrictMasterService = {
    // Method to create a new record
    createService: async (data) => {
        try {
            
            return await DistrictMasterDAL.CreateData(data)
        } catch (error) {
            throw error
        }
    },
    // Method to update an existing record by its ID 
    updateService: async (district_id, data) => {
        try {
            return await DistrictMasterDAL.UpdateData(district_id, data)
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve all records
    getAllService: async () => {
        try {
            return await DistrictMasterDAL.getAllDataByView()
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve a specific record by its ID 
    getServiceById: async (district_id) => {
        try {
            return await DistrictMasterDAL.getDataByIdByView(district_id)
        } catch (error) {
            throw error
        }
    }, 
    // Method to mark a record as deleted (soft delete) by its ID
    deleteByid: async (district_id, req, res) => {
        try {
            return await DistrictMasterDAL.deleteDataById(district_id, req, res)
        } catch (error) {
            throw error
        }
    },getDataByStateIdByView:async(state_id)=>{
        try{
            return await DistrictMasterDAL.getDataByStateIdByView(state_id)
        }catch(error){
            throw error
        }
    },getDataByCountryIdByView:async(country_id)=>{
        try{
            return await DistrictMasterDAL.getDataByCountryIdByView(country_id)
        }catch(error){
            throw error
        }
    }
}
export default DistrictMasterService