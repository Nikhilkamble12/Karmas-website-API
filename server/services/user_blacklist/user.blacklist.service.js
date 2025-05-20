import UserBlackListDAL from "./user.blacklist.data.layer.js";

const UserBlackListService = {
    // Method to create a new record
    createService: async (data) => {
        try {
            return await UserBlackListDAL.CreateData(data)
        } catch (error) {
            throw error
        }
    },
    // Method to update an existing record by its ID 
    updateService: async (blacklist_id, data) => {
        try {
            return await UserBlackListDAL.UpdateData(blacklist_id, data)
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve all records
    getAllService: async () => {
        try {
            return await UserBlackListDAL.getAllDataByView()
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve a specific record by its ID 
    getServiceById: async (blacklist_id) => {
        try {
            return await UserBlackListDAL.getDataByIdByView(blacklist_id)
        } catch (error) {
            throw error
        }
    }, 
    // Method to mark a record as deleted (soft delete) by its ID
    deleteByid: async (blacklist_id, req, res) => {
        try {
            return await UserBlackListDAL.deleteDataById(blacklist_id, req, res)
        } catch (error) {
            throw error
        }
    },getByUserId:async(user_id)=>{
        try{
            return await UserBlackListDAL.getByUserId(user_id)
        }catch(error){
            throw error
        }
    },getDataByUserIdAndBackListUser:async(user_id,blacklist_user_id)=>{
        try{
            return await UserBlackListDAL.getDatabyUserIdAndBlacklistUserid(user_id,blacklist_user_id)
        }catch(error){
            throw error
        }
    }
}
export default UserBlackListService