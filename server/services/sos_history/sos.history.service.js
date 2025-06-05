import SosHistoryDAL from "./sos.history.data.layer.js";

const SosHistoryService = {
     // Method to create a new record
        createService: async (data) => {
            try {
                return await SosHistoryDAL.CreateData(data)
            } catch (error) {
                throw error
            }
        },
        // Method to update an existing record by its ID 
        updateService: async (history_id, data) => {
            try {
                return await SosHistoryDAL.UpdateData(history_id, data)
            } catch (error) {
                throw error
            }
        },
        // Method to retrieve all records
        getAllService: async () => {
            try {
                return await SosHistoryDAL.getAllDataByView()
            } catch (error) {
                throw error
            }
        },
        // Method to retrieve a specific record by its ID 
        getServiceById: async (history_id) => {
            try {
                return await SosHistoryDAL.getDataByIdByView(history_id)
            } catch (error) {
                throw error
            }
        }, 
        // Method to mark a record as deleted (soft delete) by its ID
        deleteByid: async (history_id, req, res) => {
            try {
                return await SosHistoryDAL.deleteDataById(history_id, req, res)
            } catch (error) {
                throw error
            }
        },getDataBySosId:async(sos_id)=>{
            try{
                return await SosHistoryDAL.getDataBySosId(sos_id)
            }catch(error){
                throw error
            }
        },getDataByUserId:async(user_id)=>{
            try{
                return await SosHistoryDAL.getByuserId(user_id)
            }catch(error){
                throw error
            }
        },getLastestByUserAndActive:async(user_id,is_sos_on)=>{
            try{
                return await SosHistoryDAL.getByUserIdLatestAndSosOn(user_id,is_sos_on)
            }catch(error){
                throw error
            }
        }
}

export default SosHistoryService