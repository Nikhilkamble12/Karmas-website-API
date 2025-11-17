import PostTagDAL from "./post.tag.data.layer.js";

const PostTagService = {
    // Method to create a new record
     createService: async (data) => {
        try {
            return await PostTagDAL.CreateData(data)
        } catch (error) {
            throw error
        }
    },
    // Method to update an existing record by its ID 
    updateService: async (post_tag_id, data) => {
        try {
            return await PostTagDAL.UpdateData(post_tag_id, data)
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve all records
    getAllService: async () => {
        try {
            return await PostTagDAL.getAllDataByView()
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve a specific record by its ID 
    getServiceById: async (post_tag_id) => {
        try {
            return await PostTagDAL.getDataByIdByView(post_tag_id)
        } catch (error) {
            throw error
        }
    }, 
    // Method to mark a record as deleted (soft delete) by its ID
    deleteByid: async (post_tag_id, req, res) => {
        try {
            return await PostTagDAL.deleteDataById(post_tag_id, req, res)
        } catch (error) {
            throw error
        }
    },getDataByPostId:async(post_id)=>{
        try{
            return await PostTagDAL.getDataByPostId(post_id)
        }catch(error){
            throw error
        }
    },
    deletePostTagByPostId:async(post_id,req,res)=>{
        try{
            return await PostTagDAL.deletePostTagByPostId(post_id,req,res)
        }catch(error){
            throw error
        }
    }
}

export default PostTagService