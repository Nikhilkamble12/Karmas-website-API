import CityMasterDAL from "./city.master.data.layer.js";

const CityMasterService = {
    // Method to create a new record
    createService: async (data) => {
        try {
            return await CityMasterDAL.CreateData(data)
        } catch (error) {
            throw error
        }
    },
    // Method to update an existing record by its ID 
    updateService: async (city_id, data) => {
        try {
            return await CityMasterDAL.UpdateData(city_id, data)
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve all records
    getAllService: async () => {
        try {
            return await CityMasterDAL.getAllDataByView()
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve a specific record by its ID 
    getServiceById: async (city_id) => {
        try {
            return await CityMasterDAL.getDataByIdByView(city_id)
        } catch (error) {
            throw error
        }
    }, 
    // Method to mark a record as deleted (soft delete) by its ID
    deleteByid: async (city_id, req, res) => {
        try {
            return await CityMasterDAL.deleteDataById(city_id, req, res)
        } catch (error) {
            throw error
        }
    },getDataByStateIdByView:async(state_id)=>{
        try{
            return await CityMasterDAL.getDataByStateIdByView(state_id)
        }catch(error){
            throw error
        }
    }
}
export default CityMasterService