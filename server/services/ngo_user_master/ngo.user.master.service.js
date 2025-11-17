import NgoUserMasterDAL from "./ngo.user.master.data.layer.js";

const NgoUserMasterService = {
    // Method to create a new record
     createService: async (data) => {
        try {
            return await NgoUserMasterDAL.CreateData(data)
        } catch (error) {
            throw error
        }
    },
    // Method to update an existing record by its ID 
    updateService: async (ngo_user_id, data) => {
        try {
            return await NgoUserMasterDAL.UpdateData(ngo_user_id, data)
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve all records
    getAllService: async () => {
        try {
            return await NgoUserMasterDAL.getAllDataByView()
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve a specific record by its ID 
    getServiceById: async (ngo_user_id) => {
        try {
            return await NgoUserMasterDAL.getDataByIdByView(ngo_user_id)
        } catch (error) {
            throw error
        }
    }, 
    // Method to mark a record as deleted (soft delete) by its ID
    deleteByid: async (ngo_user_id, req, res) => {
        try {
            return await NgoUserMasterDAL.deleteDataById(ngo_user_id, req, res)
        } catch (error) {
            throw error
        }
    },
}

export default NgoUserMasterService