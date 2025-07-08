import PagePermissionDAL from "./page.permission.data.layer.js";

const PagePermissionService = {
    // Method to create a new record
    createService: async (data) => {
        try {
            return await PagePermissionDAL.CreateData(data)
        } catch (error) {
            throw error
        }
    },
    // Method to update an existing record by its ID 
    updateService: async (page_permission_id, data) => {
        try {
            return await PagePermissionDAL.UpdateData(page_permission_id, data)
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve all records
    getAllService: async () => {
        try {
            return await PagePermissionDAL.getAllDataByView()
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve a specific record by its ID 
    getServiceById: async (page_permission_id) => {
        try {
            return await PagePermissionDAL.getDataByIdByView(page_permission_id)
        } catch (error) {
            throw error
        }
    }, 
    // Method to mark a record as deleted (soft delete) by its ID
    deleteByid: async (page_permission_id, req, res) => {
        try {
            return await PagePermissionDAL.deleteDataById(page_permission_id, req, res)
        } catch (error) {
            throw error
        }
    },checkPagePermissionByPageIdAndPermissionId:async(page_id,permission_id)=>{
        try{
            return await PagePermissionDAL.getDataByPageIdAndPermissionId(page_id,permission_id)
        }catch(error){
            throw error
        }
    },getDataBypageId:async(page_id)=>{
        try{
            return await PagePermissionDAL.getDataByPageId(page_id)
        }catch(error){
            throw error
        }
    },
}

export default PagePermissionService