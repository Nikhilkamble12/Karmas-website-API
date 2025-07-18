import GroupRolePagePermissionDAL from "./group.role.page.permission.data.layer.js";

const GroupRolePagePermissionService = {
     // Method to create a new record
    createService: async (data) => {
        try {
            return await GroupRolePagePermissionDAL.CreateData(data)
        } catch (error) {
            throw error
        }
    },
    // Method to update an existing record by its ID 
    updateService: async (role_page_permission_id, data) => {
        try {
            return await GroupRolePagePermissionDAL.UpdateData(role_page_permission_id, data)
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve all records
    getAllService: async () => {
        try {
            return await GroupRolePagePermissionDAL.getAllDataByView()
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve a specific record by its ID 
    getServiceById: async (role_page_permission_id) => {
        try {
            return await GroupRolePagePermissionDAL.getDataByIdByView(role_page_permission_id)
        } catch (error) {
            throw error
        }
    }, 
    // Method to mark a record as deleted (soft delete) by its ID
    deleteByid: async (role_page_permission_id, req, res) => {
        try {
            return await GroupRolePagePermissionDAL.deleteDataById(role_page_permission_id, req, res)
        } catch (error) {
            throw error
        }
    },getDataByRoleId:async(role_id)=>{
        try{
            return await GroupRolePagePermissionDAL.getDataByRoleId(role_id)
        }catch(error){
            throw error
        }
    },getDataByRoleIdAndPageId:async(role_id,page_id)=>{
        try{
            return await GroupRolePagePermissionDAL.getDataByRoleIdAndPageId(role_id,page_id)
        }catch(error){
            throw error
        }
    },getDataByRoleIdAndPageIdAndNgoLevelId:async(role_id,page_id,ngo_level_id)=>{
        try{
            return await GroupRolePagePermissionDAL.getDataByRoleIdAndPageIdAndNgoLevelId(role_id,page_id,ngo_level_id)
        }catch(error){
            throw error
        }
    }
}

export default GroupRolePagePermissionService