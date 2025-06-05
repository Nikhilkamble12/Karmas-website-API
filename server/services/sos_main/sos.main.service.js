import SosMainDAL from "./sos.main.data.layer.js";

const SosMainService = {
    // Method to create a new record
    createService: async (data) => {
        try {
            return await SosMainDAL.CreateData(data)
        } catch (error) {
            throw error
        }
    },
    // Method to update an existing record by its ID 
    updateService: async (sos_id, data) => {
        try {
            return await SosMainDAL.UpdateData(sos_id, data)
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve all records
    getAllService: async () => {
        try {
            return await SosMainDAL.getAllDataByView()
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve a specific record by its ID 
    getServiceById: async (sos_id) => {
        try {
            return await SosMainDAL.getDataByIdByView(sos_id)
        } catch (error) {
            throw error
        }
    }, 
    // Method to mark a record as deleted (soft delete) by its ID
    deleteByid: async (sos_id, req, res) => {
        try {
            return await SosMainDAL.deleteDataById(sos_id, req, res)
        } catch (error) {
            throw error
        }
    },getDataByUserIdByView:async(user_id)=>{
        try{
            return await SosMainDAL.getDataByUserId(user_id)
        }catch(error){
            throw error
        }
    },getByUserIdOnlyActive:async(user_id)=>{
        try{
            return await SosMainDAL.getByUserIdAndOnlyActive(user_id)
        }catch(error){
            throw error
        }
    },getAllActiveSos:async()=>{
        try{
            return await SosMainDAL.getDataByWhoseSosIsOn()
        }catch(error){
            throw error
        }
    }
}
export default SosMainService