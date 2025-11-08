import BugMasterDAL from "./bug.master.data.layer.js";

const BugMasterService = {
    // Method to create a new record
     createService: async (data) => {
        try {
            return await BugMasterDAL.CreateData(data)
        } catch (error) {
            throw error
        }
    },
    // Method to update an existing record by its ID 
    updateService: async (bug_id, data) => {
        try {
            return await BugMasterDAL.UpdateData(bug_id, data)
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve all records
    getAllService: async () => {
        try {
            return await BugMasterDAL.getAllDataByView()
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve a specific record by its ID 
    getServiceById: async (bug_id) => {
        try {
            return await BugMasterDAL.getDataByIdByView(bug_id)
        } catch (error) {
            throw error
        }
    }, 
    // Method to mark a record as deleted (soft delete) by its ID
    deleteByid: async (bug_id, req, res) => {
        try {
            return await BugMasterDAL.deleteDataById(bug_id, req, res)
        } catch (error) {
            throw error
        }
    },
}

export default BugMasterService