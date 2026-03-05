import RequestCommentDAL from "./request.comments.data.layer.js";

const RequestCommentService = {
     // Method to create a new record
    createService: async (data) => {
        try {
            return await RequestCommentDAL.CreateData(data)
        } catch (error) {
            throw error
        }
    },
    // Method to update an existing record by its ID 
    updateService: async (like_id, data) => {
        try {
            return await RequestCommentDAL.UpdateData(like_id, data)
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve all records
    getAllService: async () => {
        try {
            return await RequestCommentDAL.getAllDataByView()
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve a specific record by its ID 
    getServiceById: async (like_id) => {
        try {
            return await RequestCommentDAL.getDataByIdByView(like_id)
        } catch (error) {
            throw error
        }
    }, 
    // Method to mark a record as deleted (soft delete) by its ID
    deleteByid: async (like_id, req, res) => {
        try {
            return await RequestCommentDAL.deleteDataById(like_id, req, res)
        } catch (error) {
            throw error
        }
    },getRequestCommentByRequestAndParentId:async(request_id,parent_id, limit, offset)=>{
        try{
            return await RequestCommentDAL.getRequestCommentByRequestIdAndParentId(request_id, parent_id, limit, offset)
        }catch(error){
            throw error
        }
    },getRequestCommentByUserId:async(user_id, limit, offset)=>{
        try{
            return await RequestCommentDAL.getRequestCommentByUserIdByView(user_id, limit, offset)
        }catch(error){
            throw error
        }
    },UpdateDataCount: async (comment_id, fieldName, amount) => {
        try{
            return await RequestCommentDAL.UpdateDataCount(comment_id,fieldName,amount)
        }catch(error){
            throw error
        }
    }
}
export default RequestCommentService