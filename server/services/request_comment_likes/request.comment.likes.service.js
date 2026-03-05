import RequestCommentLikesDAL from "./request.comment.likes.data.layer.js";


const RequestCommentLikesService = {
    // Method to create a new record
    createService: async (data) => {
        try {
            return await RequestCommentLikesDAL.CreateData(data)
        } catch (error) {
            throw error
        }
    },
    // Method to update an existing record by its ID 
    updateService: async (like_id, data) => {
        try {
            return await RequestCommentLikesDAL.UpdateData(like_id, data)
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve all records
    getAllService: async () => {
        try {
            return await RequestCommentLikesDAL.getAllDataByView()
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve a specific record by its ID 
    getServiceById: async (like_id) => {
        try {
            return await RequestCommentLikesDAL.getDataByIdByView(like_id)
        } catch (error) {
            throw error
        }
    }, 
    // Method to mark a record as deleted (soft delete) by its ID
    deleteByid: async (like_id, req, res) => {
        try {
            return await RequestCommentLikesDAL.deleteDataById(like_id, req, res)
        } catch (error) {
            throw error
        }
    },getRequestCommentLikesByRequestCommentId:async(request_cmt_id,limit,offset)=>{
        try{
            return await RequestCommentLikesDAL.getRequestCommentLikesByRequestCommentIdByView(request_cmt_id,limit,offset)
        }catch(error){
            throw error
        }
    },getRequestCommentLikesByUserId:async(user_id,limit,offset)=>{
        try{
            return await RequestCommentLikesDAL.getRequestCommentLikesByUserIdByView(user_id,limit,offset)
        }catch(error){
            throw error
        }
    }
}
export default RequestCommentLikesService