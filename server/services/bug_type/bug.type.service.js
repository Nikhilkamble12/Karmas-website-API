import BugTypeDAL from "./bug.type.data.layer.js";

const BugTypeService = {
    // Method to create a new record
     createService: async (data) => {
        try {
            return await BugTypeDAL.CreateData(data)
        } catch (error) {
            throw error
        }
    },
    // Method to update an existing record by its ID 
    updateService: async (bug_type_id, data) => {
        try {
            return await BugTypeDAL.UpdateData(bug_type_id, data)
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve all records
    getAllService: async () => {
        try {
            return await BugTypeDAL.getAllDataByView()
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve a specific record by its ID 
    getServiceById: async (bug_type_id) => {
        try {
            return await BugTypeDAL.getDataByIdByView(bug_type_id)
        } catch (error) {
            throw error
        }
    }, 
    // Method to mark a record as deleted (soft delete) by its ID
    deleteByid: async (bug_type_id, req, res) => {
        try {
            return await BugTypeDAL.deleteDataById(bug_type_id, req, res)
        } catch (error) {
            throw error
        }
    },
}

export default BugTypeService