import PostDAL from "./posts.data.layer.js";

const PostService = {
  // Method to create a new record
  createSerive: async (data) => {
    try {
      return await PostDAL.CreateData(data);
    } catch (error) {
      throw error;
    }
  },
  // Method to update an existing record by its ID
  updateService: async (post_id, data) => {
    try {
      return await PostDAL.UpdateData(post_id, data);
    } catch (error) {
      throw error;
    }
  },
  // Method to retrieve all records
  getAllService: async () => {
    try {
      return await PostDAL.getAllDataByView();
    } catch (error) {
      throw error;
    }
  },
  // Method to retrieve a specific record by its ID
  getServiceById: async (post_id) => {
    try {
      return await PostDAL.getDataByIdByView(post_id);
    } catch (error) {
      throw error;
    }
  },
  // Method to mark a record as deleted (soft delete) by its
  deleteById: async (post_id, req, res) => {
    try {
      return await PostDAL.deleteDataById(post_id, req, res);
    } catch (error) {
      throw error;
    }
  },getPostByUserIdByFilterData:async(user_id,offset, limit)=>{
    try{
      return await PostDAL.getPostDataByUserIdByFilter(user_id,offset, limit)
    }catch(error){
      throw error
    }
  },getPostByUserIdForHomePage:async(user_id,limit,already_viewed)=>{
    try{
      return await PostDAL.getPostByUserIdForHome(user_id,limit,already_viewed)
    }catch(error){
      throw error
    }
  },getVideoPostByUserIdForHomePage:async(user_id,limit,already_viewed)=> {
    try {
      return await PostDAL.getVideoPostByUserIdForHomePage(user_id,limit,already_viewed)
    } catch (error) {
      throw error
    }
  }
};

export default PostService;
