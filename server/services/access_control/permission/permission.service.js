import PermissionDAL from "./permission.data.layer.js";

const PermissionService = {
    // Method to create a new record
    createService: async (data) => {
        try {
            return await PermissionDAL.CreateData(data)
        } catch (error) {
            throw error
        }
    },
    // Method to update an existing record by its ID 
    updateService: async (permission_id, data) => {
        try {
            return await PermissionDAL.UpdateData(permission_id, data)
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve all records
    getAllService: async () => {
        try {
            return await PermissionDAL.getAllDataByView()
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve a specific record by its ID 
    getServiceById: async (permission_id) => {
        try {
            return await PermissionDAL.getDataByIdByView(permission_id)
        } catch (error) {
            throw error
        }
    }, 
    // Method to mark a record as deleted (soft delete) by its ID
    deleteByid: async (permission_id, req, res) => {
        try {
            return await PermissionDAL.deleteDataById(permission_id, req, res)
        } catch (error) {
            throw error
        }
    },getPermissionByDescByOnlyOne:async()=>{
        try{
            return await PermissionDAL.getPermissionByDescByOnlyOne()
        }catch(error){
            throw error
        }
    }
}

export default PermissionService