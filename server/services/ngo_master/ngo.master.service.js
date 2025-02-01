import NgoMasterDAL from "./ngo.master.data.layer.js";

const NgoMasterService = {
    // Method to create a new record
    createService: async (data) => {
        try {
            return await NgoMasterDAL.CreateData(data)
        } catch (error) {
            throw error
        }
    },
    // Method to update an existing record by its ID 
    updateService: async (ngo_id, data) => {
        try {
            return await NgoMasterDAL.UpdateData(ngo_id, data)
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve all records
    getAllService: async () => {
        try {
            return await NgoMasterDAL.getAllDataByView()
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve a specific record by its ID 
    getServiceById: async (ngo_id) => {
        try {
            return await NgoMasterDAL.getDataByIdByView(ngo_id)
        } catch (error) {
            throw error
        }
    }, 
    // Method to mark a record as deleted (soft delete) by its ID
    deleteByid: async (ngo_id, req, res) => {
        try {
            return await NgoMasterDAL.deleteDataById(ngo_id, req, res)
        } catch (error) {
            throw error
        }
    },getNgoDataByCityIdforMapping:async(CityId)=>{
        try{
            return await NgoMasterDAL
        }catch(error){
            throw error
        }
    },getNgoDataByStateAndNotCity:async(StateId,CityId)=>{
        try{
            return await NgoMasterDAL
        }catch(error){
            throw error
        }
    },getNgoDataByCountryIdAndNotStateAndCity:async(CountryId,StateId,CityId)=>{
        try{
            return await NgoMasterDAL
        }catch(error){
            throw error
        }
    }
}
export default NgoMasterService