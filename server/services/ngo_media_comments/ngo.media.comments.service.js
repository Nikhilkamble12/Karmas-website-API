import NgoMediaCommentsDAL from "./ngo.media.comments.data.layer.js";

const NgoMediaCommentsService = {
    // Method to create a new record
    createService: async (data) => {
        try {
            return await NgoMediaCommentsDAL.CreateData(data)
        } catch (error) {
            throw error
        }
    },
    // Method to update an existing record by its ID 
    updateService: async (comment_id, data) => {
        try {
            return await NgoMediaCommentsDAL.UpdateData(comment_id, data)
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve all records
    getAllService: async () => {
        try {
            return await NgoMediaCommentsDAL.getAllDataByView()
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve a specific record by its ID 
    getServiceById: async (comment_id) => {
        try {
            return await NgoMediaCommentsDAL.getDataByIdByView(comment_id)
        } catch (error) {
            throw error
        }
    },
    // Method to mark a record as deleted (soft delete) by its ID
    deleteByid: async (comment_id, req, res) => {
        try {
            return await NgoMediaCommentsDAL.deleteDataById(comment_id, req, res)
        } catch (error) {
            throw error
        }
    }, getDataByMediaIdOnlyParent: async (ngo_media_id) => {
        try {
            return await NgoMediaCommentsDAL.getCommentByNgoMediaOnlyParent(ngo_media_id)
        } catch (error) {
            throw error
        }
    },getDataByMediaAndParentId:async(ngo_media_id,parent_id)=>{
        try{
            return await NgoMediaCommentsDAL.getCommentsByNgoMediaAndParentId(ngo_media_id,parent_id)
        }catch(error){
            throw error
        }
    },UpdateDataCount: async (comment_id, fieldName, amount) => {
        try{
            return await NgoMediaCommentsDAL.UpdateDataCount(comment_id, fieldName, amount)
        }catch(error){
            throw error
        }
    }
}

export default NgoMediaCommentsService