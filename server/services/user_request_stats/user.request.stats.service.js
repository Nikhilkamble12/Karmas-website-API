import UserRequestStatsDAL from "./user.request.stats.data.layer.js";

const UserRequestStatsService = {
    // Method to create a new record
    createService: async (data) => {
        try {
            return await UserRequestStatsDAL.CreateData(data)
        } catch (error) {
            throw error
        }
    },
    // Method to update an existing record by its ID 
    updateService: async (request_stats_id, data) => {
        try {
            return await UserRequestStatsDAL.UpdateData(request_stats_id, data)
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve all records
    getAllService: async () => {
        try {
            return await UserRequestStatsDAL.getAllDataByView()
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve a specific record by its ID 
    getServiceById: async (request_stats_id) => {
        try {
            return await UserRequestStatsDAL.getDataByIdByView(request_stats_id)
        } catch (error) {
            throw error
        }
    }, 
    // Method to mark a record as deleted (soft delete) by its ID
    deleteByid: async (request_stats_id, req, res) => {
        try {
            return await UserRequestStatsDAL.deleteDataById(request_stats_id, req, res)
        } catch (error) {
            throw error
        }
    },
    getDataByUserId:async(user_id)=>{
        try{
            return await UserRequestStatsDAL.getDataByUserIdByView(user_id)
        }catch(error){
            throw error
        }
    },CreateOrUpdateData:async(user_id)=>{
        try{
            return await UserRequestStatsDAL.CreateOrUpdateData(user_id)
        }catch(error){
            throw error
        }
    }
}

export default UserRequestStatsService