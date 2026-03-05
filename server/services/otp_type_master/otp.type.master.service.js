import OtpTypeMasterDAL from "./otp.type.master.data.layer.js";

const OtpTypeMasterService = {
    // Method to create a new record
     createService: async (data) => {
        try {
            return await OtpTypeMasterDAL.CreateData(data)
        } catch (error) {
            throw error
        }
    },
    // Method to update an existing record by its ID 
    updateService: async (otp_type_id, data) => {
        try {
            return await OtpTypeMasterDAL.UpdateData(otp_type_id, data)
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve all records
    getAllService: async () => {
        try {
            return await OtpTypeMasterDAL.getAllDataByView()
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve a specific record by its ID 
    getServiceById: async (otp_type_id) => {
        try {
            return await OtpTypeMasterDAL.getDataByIdByView(otp_type_id)
        } catch (error) {
            throw error
        }
    }, 
    // Method to mark a record as deleted (soft delete) by its ID
    deleteByid: async (otp_type_id, req, res) => {
        try {
            return await OtpTypeMasterDAL.deleteDataById(otp_type_id, req, res)
        } catch (error) {
            throw error
        }
    },
}

export default OtpTypeMasterService