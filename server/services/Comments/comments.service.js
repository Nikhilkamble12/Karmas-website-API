import CommentsDAL from "./comments.data.layer.js"

const CommentService = {
     // Method to create a new record
     createService: async (data) => {
        try {
            return await CommentsDAL.CreateData(data)
        } catch (error) {
            throw error
        }
    },
    // Method to update an existing record by its ID 
    updateService: async (comment_id, data) => {
        try {
            return await CommentsDAL.UpdateData(comment_id, data)
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve all records
    getAllService: async () => {
        try {
            return await CommentsDAL.getAllDataByView()
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve a specific record by its ID 
    getServiceById: async (comment_id) => {
        try {
            return await CommentsDAL.getDataByIdByView(comment_id)
        } catch (error) {
            throw error
        }
    }, 
    // Method to mark a record as deleted (soft delete) by its ID
    deleteByid: async (comment_id, req, res) => {
        try {
            return await CommentsDAL.deleteDataById(comment_id, req, res)
        } catch (error) {
            throw error
        }
    },getCommentByPostOrParentId:async(post_id,parent_id)=>{
        try{
            return await CommentsDAL.getCommentByPostAndParentId(post_id,parent_id)
        }catch(error){
            throw error
        }
    }
}
export default CommentService