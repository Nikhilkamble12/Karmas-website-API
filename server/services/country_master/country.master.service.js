import CountryMasterDAL from "./country.master.data.layer.js";

const countryMasterService = {
    // Method to create a new record
    createService: async (data) => {
        try {
            return await CountryMasterDAL.CreateData(data)
        } catch (error) {
            throw error
        }
    },
    // Method to update an existing record by its ID 
    updateService: async (country_id, data) => {
        try {
            return await CountryMasterDAL.UpdateData(country_id, data)
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve all records
    getAllService: async () => {
        try {
            return await CountryMasterDAL.getAllDataByView()
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve a specific record by its ID 
    getServiceById: async (country_id) => {
        try {
            return await CountryMasterDAL.getDataByIdByView(country_id)
        } catch (error) {
            throw error
        }
    }, 
    // Method to mark a record as deleted (soft delete) by its ID
    deleteByid: async (country_id, req, res) => {
        try {
            return await CountryMasterDAL.deleteDataById(country_id, req, res)
        } catch (error) {
            throw error
        }
    }
}
export default countryMasterService