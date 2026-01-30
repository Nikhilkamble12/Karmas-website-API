import UserOtpLogsModelDAL from "./user.otp.log.data.layer.js";

const UserOtpLogsService = {
    // Method to create a new record
     createService: async (data) => {
        try {
            return await UserOtpLogsModelDAL.CreateData(data)
        } catch (error) {
            throw error
        }
    },
    // Method to update an existing record by its ID 
    updateService: async (otp_id, data) => {
        try {
            return await UserOtpLogsModelDAL.UpdateData(otp_id, data)
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve all records
    getAllService: async () => {
        try {
            return await UserOtpLogsModelDAL.getAllDataByView()
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve a specific record by its ID 
    getServiceById: async (otp_id) => {
        try {
            return await UserOtpLogsModelDAL.getDataByIdByView(otp_id)
        } catch (error) {
            throw error
        }
    }, 
    // Method to mark a record as deleted (soft delete) by its ID
    deleteByid: async (otp_id, req, res) => {
        try {
            return await UserOtpLogsModelDAL.deleteDataById(otp_id, req, res)
        } catch (error) {
            throw error
        }
    },getOtpByNotUsed:async(user_id, otp_type_id)=>{
        try{
            return await UserOtpLogsModelDAL.getOtpByNotUsed(user_id, otp_type_id)
        }catch(error){
            throw error
        }
    },matchOtpByUserIdTypeAndCode:async(user_id, otp_type_id, otp_code)=>{
        try{
            return await UserOtpLogsModelDAL.matchOtpByUserIdTypeAndCode(user_id, otp_type_id, otp_code)
        }catch(error){
            throw error
        }
    }
}

export default UserOtpLogsService