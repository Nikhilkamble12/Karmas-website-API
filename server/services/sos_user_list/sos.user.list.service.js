import SosUserListDAL from "./sos.user.list.data.layer.js";

const SosUserListService = {
    // Method to create a new record
    createService: async (data) => {
        try {
            return await SosUserListDAL.CreateData(data)
        } catch (error) {
            throw error
        }
    },
    // Method to update an existing record by its ID 
    updateService: async (sos_user_id, data) => {
        try {
            return await SosUserListDAL.UpdateData(sos_user_id, data)
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve all records
    getAllService: async () => {
        try {
            return await SosUserListDAL.getAllDataByView()
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve a specific record by its ID 
    getServiceById: async (sos_user_id) => {
        try {
            return await SosUserListDAL.getDataByIdByView(sos_user_id)
        } catch (error) {
            throw error
        }
    }, 
    // Method to mark a record as deleted (soft delete) by its ID
    deleteByid: async (sos_user_id, req, res) => {
        try {
            return await SosUserListDAL.deleteDataById(sos_user_id, req, res)
        } catch (error) {
            throw error
        }
    },getDataByUserIdByView:async(user_id)=>{
        try{
            return await SosUserListDAL.getDataByUserIdByView(user_id)
        }catch(error){
            throw error
        }
    },getuserCountByUserId:async(user_id)=>{
        try{
            return await SosUserListDAL.getUserCountOnlyByView(user_id)
        }catch(error){
            throw error
        }
    },getDataByUserIdAndContactUserId:async(user_id,contact_user_id)=>{
        try{
            return await SosUserListDAL.getDataByUserIdAndContactUserId(user_id,contact_user_id)
        }catch(error){
            throw error
        }
    },getAllCountByView:async()=>{
        try{
            return await SosUserListDAL.getAllCountByView()
        }catch(error){
            throw error
        }
    },getMaxUserIdByView:async()=>{
        try{
            return await SosUserListDAL.getMaxUserId()
        }catch(error){
            throw error
        }
    },getAllServiceWithLimitOffset:async(limit, offset)=>{
        try{
            return await SosUserListDAL.getAllServiceWithLimitOffset(limit, offset)
        }catch(error){
            throw error
        }
    },getCountForUserIdRange:async(limit, offset)=>{
        try{
            return await SosUserListDAL.getCountForUserIdRange(limit, offset)
        }catch(error){
            throw error
        }
    }
}

export default SosUserListService