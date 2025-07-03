import UserFollowingDAL from "./user.following.data.layer.js";

const UserFollowingService = {
    // Method to create a new record
    createService: async (data) => {
        try {
            return await UserFollowingDAL.CreateData(data)
        } catch (error) {
            throw error
        }
    },
    // Method to update an existing record by its ID 
    updateService: async (follow_id, data) => {
        try {
            return await UserFollowingDAL.UpdateData(follow_id, data)
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve all records
    getAllService: async () => {
        try {
            return await UserFollowingDAL.getAllDataByView()
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve a specific record by its ID 
    getServiceById: async (follow_id) => {
        try {
            return await UserFollowingDAL.getDataByIdByView(follow_id)
        } catch (error) {
            throw error
        }
    }, 
    // Method to mark a record as deleted (soft delete) by its ID
    deleteByid: async (follow_id, req, res) => {
        try {
            return await UserFollowingDAL.deleteDataById(follow_id, req, res)
        } catch (error) {
            throw error
        }
    },getByUserId:async(user_id)=>{
        try{
            return await UserFollowingDAL.getByUserId(user_id)
        }catch(error){
            throw error
        }
    },getDataByFollowingUserId:async(following_user_id)=>{
        try{
            return await UserFollowingDAL.getDataByFollowed(following_user_id)
        }catch(error){
            throw error
        }
    },getDataByUserIdAndFollowId:async(user_id,follow_id)=>{
        try{
            return await UserFollowingDAL.getDataByUserIdAndFollowId(user_id,follow_id)
        }catch(error){
            throw error
        }
    },getListByFollowingUserToAccepted:async(user_follow_id)=>{
        try{
            return await UserFollowingDAL.getListByFollowingUserToAccepted(user_follow_id)
        }catch(error){
            throw error
        }
    },getOnlyUserIdOfFollowAndBlocked:async(user_id)=>{
        try{
            return await UserFollowingDAL.getOnlyFollowAndBlockedUserByUserId(user_id)
        }catch(error){
            throw error
        }
    }
}

export default UserFollowingService