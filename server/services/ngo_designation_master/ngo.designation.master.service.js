import NgoDesignationMasterDAL from "./ngo.designation.master.data.layer.js";

const NgoDesignationMasterService = {
    // Method to create a new record
     createService: async (data) => {
        try {
            return await NgoDesignationMasterDAL.CreateData(data)
        } catch (error) {
            throw error
        }
    },
    // Method to update an existing record by its ID 
    updateService: async (ngo_designation_id, data) => {
        try {
            return await NgoDesignationMasterDAL.UpdateData(ngo_designation_id, data)
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve all records
    getAllService: async () => {
        try {
            return await NgoDesignationMasterDAL.getAllDataByView()
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve a specific record by its ID 
    getServiceById: async (ngo_designation_id) => {
        try {
            return await NgoDesignationMasterDAL.getDataByIdByView(ngo_designation_id)
        } catch (error) {
            throw error
        }
    }, 
    // Method to mark a record as deleted (soft delete) by its ID
    deleteByid: async (ngo_designation_id, req, res) => {
        try {
            return await NgoDesignationMasterDAL.deleteDataById(ngo_designation_id, req, res)
        } catch (error) {
            throw error
        }
    },
    getDataByNgoIdByView:async(ngo_id)=>{
        try{
            return await NgoDesignationMasterDAL.getDataByNgoIdByView(ngo_id)
        }catch(error){
            throw error
        }
    }
}

export default NgoDesignationMasterService