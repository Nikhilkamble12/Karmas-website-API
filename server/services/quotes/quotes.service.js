import QuotesDAL from "./quotes.data.layer.js";

const QuotesService = {
     // Method to create a new record
     createService: async (data) => {
        try {
            return await QuotesDAL.CreateData(data)
        } catch (error) {
            throw error
        }
    },
    // Method to update an existing record by its ID 
    updateService: async (quote_id, data) => {
        try {
            return await QuotesDAL.UpdateData(quote_id, data)
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve all records
    getAllService: async () => {
        try {
            return await QuotesDAL.getAllDataByView()
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve a specific record by its ID 
    getServiceById: async (quote_id) => {
        try {
            return await QuotesDAL.getDataByIdByView(quote_id)
        } catch (error) {
            throw error
        }
    }, 
    // Method to mark a record as deleted (soft delete) by its ID
    deleteByid: async (quote_id, req, res) => {
        try {
            return await QuotesDAL.deleteDataById(quote_id, req, res)
        } catch (error) {
            throw error
        }
    }
}
export default QuotesService