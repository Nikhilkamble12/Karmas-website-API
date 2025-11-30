import NgoMediaDAL from "./ngo.media.data.layer.js";

const ngoMediaService = {
    // Method to create a new record
    createService: async (data) => {
        try {
            return await NgoMediaDAL.CreateData(data)
        } catch (error) {
            throw error
        }
    },
    // Method to update an existing record by its ID 
    updateService: async (ngo_media_id, data) => {
        try {
            return await NgoMediaDAL.UpdateData(ngo_media_id, data)
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve all records
    getAllService: async () => {
        try {
            return await NgoMediaDAL.getAllDataByView()
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve a specific record by its ID 
    getServiceById: async (ngo_media_id) => {
        try {
            return await NgoMediaDAL.getDataByIdByView(ngo_media_id)
        } catch (error) {
            throw error
        }
    }, 
    // Method to mark a record as deleted (soft delete) by its ID
    deleteByid: async (ngo_media_id, req, res) => {
        try {
            return await NgoMediaDAL.deleteDataById(ngo_media_id, req, res)
        } catch (error) {
            throw error
        }
    },getDataByNgoId:async(ngo_id)=>{
        try{
            return await NgoMediaDAL.getDataByNgoId(ngo_id)
        }catch(error){
            throw error
        }
    },UpdateDataCount:async(ngo_media_id, fieldName, amount)=>{
        try{
            return await NgoMediaDAL.UpdateDataCount(ngo_media_id, fieldName, amount)
        }catch(error){
            throw error
        }
    }
}

export default ngoMediaService
