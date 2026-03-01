import StatusMasterDAL from "./status.master.data.layer.js";

const StatusMasterService = {
    // Method to create a new record
    createService: async (data) => {
        try {
            return await StatusMasterDAL.CreateData(data)
        } catch (error) {
            throw error
        }
    },
    // Method to update an existing record by its ID 
    updateService: async (status_id, data) => {
        try {
            return await StatusMasterDAL.UpdateData(status_id, data)
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve all records
    getAllService: async () => {
        try {
            return await StatusMasterDAL.getAllDataByView()
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve a specific record by its ID 
    getServiceById: async (status_id) => {
        try {
            return await StatusMasterDAL.getDataByIdByView(status_id)
        } catch (error) {
            throw error
        }
    }, 
    // Method to mark a record as deleted (soft delete) by its ID
    deleteByid: async (status_id, req, res) => {
        try {
            return await StatusMasterDAL.deleteDataById(status_id, req, res)
        } catch (error) {
            throw error
        }
    },getDataByParentId:async(parent_id)=>{
        try{
            return await StatusMasterDAL.getDataByParentId(parent_id)
        }catch(error){
            throw error
        }
    }
}
export default StatusMasterService