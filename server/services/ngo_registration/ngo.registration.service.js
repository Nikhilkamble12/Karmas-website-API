import NgoRegistrationDAL from "./ngo.registration.data.layer.js";

const NgoRegistrationService = {
    // Method to create a new record
     createService: async (data) => {
        try {
            return await NgoRegistrationDAL.CreateData(data)
        } catch (error) {
            throw error
        }
    },
    // Method to update an existing record by its ID 
    updateService: async (ngo_registration_id, data) => {
        try {
            return await NgoRegistrationDAL.UpdateData(ngo_registration_id, data)
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve all records
    getAllService: async () => {
        try {
            return await NgoRegistrationDAL.getAllDataByView()
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve a specific record by its ID 
    getServiceById: async (ngo_registration_id) => {
        try {
            return await NgoRegistrationDAL.getDataByIdByView(ngo_registration_id)
        } catch (error) {
            throw error
        }
    }, 
    // Method to mark a record as deleted (soft delete) by its ID
    deleteByid: async (ngo_registration_id, req, res) => {
        try {
            return await NgoRegistrationDAL.deleteDataById(ngo_registration_id, req, res)
        } catch (error) {
            throw error
        }
    },
}

export default NgoRegistrationService