import NgoOfficeBearersDAL from "./ngo.office.bearers.data.layer.js";

const NgoOfficeBearersService = {
    // Method to create a new record
    createService: async (data) => {
        try {
            return await NgoOfficeBearersDAL.CreateData(data)
        } catch (error) {
            throw error
        }
    },
    // Method to update an existing record by its ID 
    updateService: async (bearer_id, data) => {
        try {
            return await NgoOfficeBearersDAL.UpdateData(bearer_id, data)
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve all records
    getAllService: async () => {
        try {
            return await NgoOfficeBearersDAL.getAllDataByView()
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve a specific record by its ID 
    getServiceById: async (bearer_id) => {
        try {
            return await NgoOfficeBearersDAL.getDataByIdByView(bearer_id)
        } catch (error) {
            throw error
        }
    }, 
    // Method to mark a record as deleted (soft delete) by its ID
    deleteByid: async (bearer_id, req, res) => {
        try {
            return await NgoOfficeBearersDAL.deleteDataById(bearer_id, req, res)
        } catch (error) {
            throw error
        }
    },getDataByNgoId:async(ngo_id)=>{
        try{
            return await NgoOfficeBearersDAL.getDataByNgoId(ngo_id)
        }catch(error){
            throw error
        }
    }
}
export default NgoOfficeBearersService
