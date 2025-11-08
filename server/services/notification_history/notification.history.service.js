import NotificationHistoryDAL from "./notification.history.data.layer.js";

const NotificationHistoryService = {
     // Method to create a new record
    createService: async (data) => {
        try {
            return await NotificationHistoryDAL.CreateData(data)
        } catch (error) {
            throw error
        }
    },
    // Method to update an existing record by its ID 
    updateService: async (notification_history_id, data) => {
        try {
            return await NotificationHistoryDAL.UpdateData(notification_history_id, data)
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve all records
    getAllService: async () => {
        try {
            return await NotificationHistoryDAL.getAllDataByView()
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve a specific record by its ID 
    getServiceById: async (notification_history_id) => {
        try {
            return await NotificationHistoryDAL.getDataByIdByView(notification_history_id)
        } catch (error) {
            throw error
        }
    }, 
    // Method to mark a record as deleted (soft delete) by its ID
    deleteByid: async (notification_history_id, req, res) => {
        try {
            return await NotificationHistoryDAL.deleteDataById(notification_history_id, req, res)
        } catch (error) {
            throw error
        }
    },CreateBulkData:async(Arraydata)=>{
        try{
            return await NotificationHistoryDAL.CreateBulkData(Arraydata)
        }catch(error){
            throw error
        }
    },getDataByUserIdByView:async(user_id)=>{
        try{
            return await NotificationHistoryDAL.getDataByUserIdByView(user_id)
        }catch(error){
            throw error
        }
    }
}
export default NotificationHistoryService