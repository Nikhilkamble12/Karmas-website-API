import RoleMasterDAL from "./role.master.data.layer.js";

const RoleMasterService = {
    // Method to create a new record
    createService: async (data) => {
        try {
            return await RoleMasterDAL.CreateData(data)
        } catch (error) {
            throw error
        }
    },
    // Method to update an existing record by its ID 
    updateService: async (role_id, data) => {
        try {
            return await RoleMasterDAL.UpdateData(role_id, data)
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve all records
    getAllService: async () => {
        try {
            return await RoleMasterDAL.getAllDataByView()
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve a specific record by its ID 
    getServiceById: async (role_id) => {
        try {
            return await RoleMasterDAL.getDataByIdByView(role_id)
        } catch (error) {
            throw error
        }
    }, 
    // Method to mark a record as deleted (soft delete) by its ID
    deleteByid: async (role_id, req, res) => {
        try {
            return await RoleMasterDAL.deleteDataById(role_id, req, res)
        } catch (error) {
            throw error
        }
    }
}
export default RoleMasterService