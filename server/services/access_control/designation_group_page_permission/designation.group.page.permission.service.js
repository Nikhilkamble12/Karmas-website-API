import DesignationGroupPagePermissionDAL from "./designation.group.page.permission.data.layer.js";

const DesignationGroupPagePermissionService = {
    // Method to create a new record
    createService: async (data) => {
        try {
            return await DesignationGroupPagePermissionDAL.CreateData(data)
        } catch (error) {
            throw error
        }
    },
    // Method to update an existing record by its ID 
    updateService: async (designation_page_permission_id, data) => {
        try {
            return await DesignationGroupPagePermissionDAL.UpdateData(designation_page_permission_id, data)
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve all records
    getAllService: async () => {
        try {
            return await DesignationGroupPagePermissionDAL.getAllDataByView()
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve a specific record by its ID 
    getServiceById: async (designation_page_permission_id) => {
        try {
            return await DesignationGroupPagePermissionDAL.getDataByIdByView(designation_page_permission_id)
        } catch (error) {
            throw error
        }
    }, 
    // Method to mark a record as deleted (soft delete) by its ID
    deleteByid: async (designation_page_permission_id, req, res) => {
        try {
            return await DesignationGroupPagePermissionDAL.deleteDataById(designation_page_permission_id, req, res)
        } catch (error) {
            throw error
        }
    },getDataByDesignationId:async(designation_id)=>{
        try{
            return await DesignationGroupPagePermissionDAL.getDataByDesignationId(designation_id)
        }catch(error){
            throw error
        }
    },getDataByDesignationIdAndPageId:async(designation_id,page_id)=>{
        try{
            return await DesignationGroupPagePermissionDAL.getDataByDesignationIdAndPageId(designation_id,page_id)
        }catch(error){
            throw error
        }
    }
}

export default DesignationGroupPagePermissionService