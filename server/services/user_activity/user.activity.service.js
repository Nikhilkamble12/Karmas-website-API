import UserActivityDAL from "./user.activity.data.layer.js";

const UserActivtyService = {
    // Method to create a new record
    createService: async (data) => {
        try {
            return await UserActivityDAL.CreateData(data)
        } catch (error) {
            throw error
        }
    },
    
    // Method to update an existing record by its ID 
    updateService: async (user_activity_id, data) => {
        try {
            console.log("user_activity_id--->",user_activity_id,"data---->",data)
            return await UserActivityDAL.UpdateData(user_activity_id, data)
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve all records
    getAllService: async () => {
        try {
            return await UserActivityDAL.getAllDataByView()
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve a specific record by its ID 
    getServiceById: async (user_activity_id) => {
        try {
            return await UserActivityDAL.getDataByIdByView(user_activity_id)
        } catch (error) {
            throw error
        }
    }, 
    // Method to mark a record as deleted (soft delete) by its ID
    deleteByid: async (user_activity_id, req, res) => {
        try {
            return await UserActivityDAL.deleteDataById(user_activity_id, req, res)
        } catch (error) {
            throw error
        }
    },getDataByUserId:async(user_id)=>{
        try{
            return await UserActivityDAL.getDataByUserId(user_id)
        }catch(error){
            throw error
        }
    },updateByuserId:async(user_id,data)=>{
        try{
            return await UserActivityDAL.updateByUserId(user_id,data)
        }catch(error){
            throw error
        }
    }
}
export default UserActivtyService