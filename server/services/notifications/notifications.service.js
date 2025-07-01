import NotificationsDAL from "./notifications.data.layer.js";

const NotificationService = {
     // Method to create a new record
    createService: async (data) => {
        try {
            return await NotificationsDAL.CreateData(data)
        } catch (error) {
            throw error
        }
    },
    // Method to update an existing record by its ID 
    updateService: async (notification_id, data) => {
        try {
            return await NotificationsDAL.UpdateData(notification_id, data)
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve all records
    getAllService: async () => {
        try {
            return await NotificationsDAL.getAllDataByView()
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve a specific record by its ID 
    getServiceById: async (notification_id) => {
        try {
            return await NotificationsDAL.getDataByIdByView(notification_id)
        } catch (error) {
            throw error
        }
    }, 
    // Method to mark a record as deleted (soft delete) by its ID
    deleteByid: async (notification_id, req, res) => {
        try {
            return await NotificationsDAL.deleteDataById(notification_id, req, res)
        } catch (error) {
            throw error
        }
    }
}

export default NotificationService