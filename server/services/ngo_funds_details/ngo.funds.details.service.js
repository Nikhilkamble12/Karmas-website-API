import NgoFundsDetailsDAL from "./ngo.funds.details.data.layer.js";

const NgoFundSDetailsService = {
     // Method to create a new record
     createService: async (data) => {
        try {
            return await NgoFundsDetailsDAL.CreateData(data)
        } catch (error) {
            throw error
        }
    },
    // Method to update an existing record by its ID 
    updateService: async (ngo_funds_id, data) => {
        try {
            return await NgoFundsDetailsDAL.UpdateData(ngo_funds_id, data)
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve all records
    getAllService: async () => {
        try {
            return await NgoFundsDetailsDAL.getAllDataByView()
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve a specific record by its ID 
    getServiceById: async (ngo_funds_id) => {
        try {
            return await NgoFundsDetailsDAL.getDataByIdByView(ngo_funds_id)
        } catch (error) {
            throw error
        }
    }, 
    // Method to mark a record as deleted (soft delete) by its ID
    deleteByid: async (ngo_funds_id, req, res) => {
        try {
            return await NgoFundsDetailsDAL.deleteDataById(ngo_funds_id, req, res)
        } catch (error) {
            throw error
        }
    }
}
export default NgoFundSDetailsService