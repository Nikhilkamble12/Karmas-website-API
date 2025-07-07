import PageDAL from "./page.data.layer.js";

const PageService = {
    // Method to create a new record
    createService: async (data) => {
        try {
            return await PageDAL.CreateData(data)
        } catch (error) {
            throw error
        }
    },
    // Method to update an existing record by its ID 
    updateService: async (page_id, data) => {
        try {
            return await PageDAL.UpdateData(page_id, data)
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve all records
    getAllService: async () => {
        try {
            return await PageDAL.getAllDataByView()
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve a specific record by its ID 
    getServiceById: async (page_id) => {
        try {
            return await PageDAL.getDataByIdByView(page_id)
        } catch (error) {
            throw error
        }
    }, 
    // Method to mark a record as deleted (soft delete) by its ID
    deleteByid: async (page_id, req, res) => {
        try {
            return await PageDAL.deleteDataById(page_id, req, res)
        } catch (error) {
            throw error
        }
    },
}

export default PageService