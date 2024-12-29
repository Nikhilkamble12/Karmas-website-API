import StateMasterDAL from "./state.master.data.layer.js";

const StateMasterService = {
    // Method to create a new record
    createService: async (data) => {
        try {
            return await StateMasterDAL.CreateData(data)
        } catch (error) {
            throw error
        }
    },
    // Method to update an existing record by its ID 
    updateService: async (state_id, data) => {
        try {
            return await StateMasterDAL.UpdateData(state_id, data)
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve all records
    getAllService: async () => {
        try {
            return await StateMasterDAL.getAllDataByView()
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve a specific record by its ID 
    getServiceById: async (state_id) => {
        try {
            return await StateMasterDAL.getDataByIdByView(state_id)
        } catch (error) {
            throw error
        }
    }, 
    // Method to mark a record as deleted (soft delete) by its ID
    deleteByid: async (state_id, req, res) => {
        try {
            return await StateMasterDAL.deleteDataById(state_id, req, res)
        } catch (error) {
            throw error
        }
    },getStateByCountryId : async(country_id)=>{
        try{
            return await StateMasterDAL.getStateByCountryId(country_id)
        }catch(error){
            throw error
        }
    }
}
export default StateMasterService