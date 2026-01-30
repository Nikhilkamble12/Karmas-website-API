import TempEmailVerificationDAL from "./temp.email.verification.data.layer.js";


const TempEmailVerficationService = {
    // Method to create a new record
    createService: async (data) => {
        try {
            return await TempEmailVerificationDAL.CreateData(data)
        } catch (error) {
            throw error
        }
    },
    // Method to update an existing record by its ID 
    updateService: async (id, data) => {
        try {
            return await TempEmailVerificationDAL.UpdateData(id, data)
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve all records
    getAllService: async () => {
        try {
            return await TempEmailVerificationDAL.getAllDataByView()
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve a specific record by its ID 
    getServiceById: async (id) => {
        try {
            return await TempEmailVerificationDAL.getDataByIdByView(id)
        } catch (error) {
            throw error
        }
    },
    // Method to mark a record as deleted (soft delete) by its ID
    deleteByid: async (id, req, res) => {
        try {
            return await TempEmailVerificationDAL.deleteDataById(id, req, res)
        } catch (error) {
            throw error
        }
    }, checkEmailService: async (email_id) => {
        try {
            return TempEmailVerificationDAL.checkEmailExists(email_id);
        } catch (error) {
            throw error
        }
    },

    resendOtpService: async (email_id) => {
        try {
            const otp = Math.floor(100000 + Math.random() * 900000);
            const expires_at = new Date(Date.now() + 20 * 60 * 1000);

            await TempEmailVerificationDAL.upsertOtp({
                email_id,
                otp,
                expires_at
            });

            return { otp, expires_at };
        } catch (error) {
            throw error
        }
    },

    verifyOtpService: async (email_id, otp) => {
        try {
            return TempEmailVerificationDAL.verifyOtp(email_id, otp);
        } catch (error) {
            throw error
        }
    },

}

export default TempEmailVerficationService