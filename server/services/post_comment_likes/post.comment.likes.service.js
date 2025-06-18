import PostCommentLikesDAL from "./post.comment.likes.data.layer.js";

const PostCommentLikesService = {
    // Method to create a new record
    createService: async (data) => {
        try {
            return await PostCommentLikesDAL.CreateData(data)
        } catch (error) {
            throw error
        }
    },
    // Method to update an existing record by its ID 
    updateService: async (like_id, data) => {
        try {
            return await PostCommentLikesDAL.UpdateData(like_id, data)
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve all records
    getAllService: async () => {
        try {
            return await PostCommentLikesDAL.getAllDataByView()
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve a specific record by its ID 
    getServiceById: async (like_id) => {
        try {
            return await PostCommentLikesDAL.getDataByIdByView(like_id)
        } catch (error) {
            throw error
        }
    }, 
    // Method to mark a record as deleted (soft delete) by its ID
    deleteByid: async (like_id, req, res) => {
        try {
            return await PostCommentLikesDAL.deleteDataById(like_id, req, res)
        } catch (error) {
            throw error
        }
    },getPostCommentLikesByPostCommentId:async(post_cmt_id,limit,offset)=>{
        try{
            return await PostCommentLikesDAL.getPostCommentLikesByPostCommentIdByView(post_cmt_id,limit,offset)
        }catch(error){
            throw error
        }
    },getPostCommentLikesByUserId:async(user_id,limit,offset)=>{
        try{
            return await PostCommentLikesDAL.getPostCommentLikesByUserIdByView(user_id,limit,offset)
        }catch(error){
            throw error
        }
    }
}
export default PostCommentLikesService