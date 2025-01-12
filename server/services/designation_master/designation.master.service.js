import DestinationMasterDAL from "./designation.master.data.layer.js";

const DesignationMasterService = {
    // Method to create a new record
    createService: async (data) => {
        try {
            return await DestinationMasterDAL.CreateData(data)
        } catch (error) {
            throw error
        }
    },
    // Method to update an existing record by its ID 
    updateService: async (designation_id, data) => {
        try {
            return await DestinationMasterDAL.UpdateData(designation_id, data)
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve all records
    getAllService: async () => {
        try {
            return await DestinationMasterDAL.getAllDataByView()
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve a specific record by its ID 
    getServiceById: async (designation_id) => {
        try {
            return await DestinationMasterDAL.getDataByIdByView(designation_id)
        } catch (error) {
            throw error
        }
    }, 
    // Method to mark a record as deleted (soft delete) by its ID
    deleteByid: async (designation_id, req, res) => {
        try {
            return await DestinationMasterDAL.deleteDataById(designation_id, req, res)
        } catch (error) {
            throw error
        }
    },getDataByTableId:async(table_id)=>{
        try{
            return await DestinationMasterDAL.getDataByTableId(table_id)
        }catch(error){
            throw error
        }
    }
}
export default DesignationMasterService