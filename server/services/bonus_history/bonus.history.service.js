import BonusHistoryDAL from "./bonus.history.data.layer.js";

const BonusHistoryService = {
     // Method to create a new record
     createService: async (data) => {
        try {
            return await BonusHistoryDAL.CreateData(data)
        } catch (error) {
            throw error
        }
    },
    // Method to update an existing record by its ID 
    updateService: async (history_id, data) => {
        try {
            return await BonusHistoryDAL.UpdateData(history_id, data)
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve all records
    getAllService: async () => {
        try {
            return await BonusHistoryDAL.getAllDataByView()
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve a specific record by its ID 
    getServiceById: async (history_id) => {
        try {
            return await BonusHistoryDAL.getDataByIdByView(history_id)
        } catch (error) {
            throw error
        }
    }, 
    // Method to mark a record as deleted (soft delete) by its ID
    deleteByid: async (history_id, req, res) => {
        try {
            return await BonusHistoryDAL.deleteDataById(history_id, req, res)
        } catch (error) {
            throw error
        }
    }
}
export default BonusHistoryService