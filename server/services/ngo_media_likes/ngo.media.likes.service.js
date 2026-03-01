import NgoMediaLikesDAL from "./ngo.media.likes.data.layer.js";

const NgoMediaLikesService = {
    // Method to create a new record
    createService: async (data) => {
        try {
            return await NgoMediaLikesDAL.CreateData(data)
        } catch (error) {
            throw error
        }
    },
    // Method to update an existing record by its ID 
    updateService: async (like_id, data) => {
        try {
            return await NgoMediaLikesDAL.UpdateData(like_id, data)
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve all records
    getAllService: async () => {
        try {
            return await NgoMediaLikesDAL.getAllDataByView()
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve a specific record by its ID 
    getServiceById: async (like_id) => {
        try {
            return await NgoMediaLikesDAL.getDataByIdByView(like_id)
        } catch (error) {
            throw error
        }
    }, 
    // Method to mark a record as deleted (soft delete) by its ID
    deleteByid: async (like_id, req, res) => {
        try {
            return await NgoMediaLikesDAL.deleteDataById(like_id, req, res)
        } catch (error) {
            throw error
        }
    },getDataByNgoMediaId:async(ngo_media_id)=>{
        try{
            return await NgoMediaLikesDAL.getDataByNgoMediaId(ngo_media_id)
        }catch(error){
            throw error
        }
    },getDataByNgoMediaIdAndUserId:async(ngo_media_id,user_id)=>{
        try{
            return await NgoMediaLikesDAL.getDataByMediaIdAndUserId(ngo_media_id,user_id)
        }catch(error){
            throw error
        }
    }
}

export default NgoMediaLikesService