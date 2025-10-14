import PostMediaDAL from "./postmedia.data.layer.js";

const PostMediaService = {
  // Method to create a new record
  createSerive: async (data) => {
    try {
      return await PostMediaDAL.CreteData(data);
    } catch (error) {
      throw error;
    }
  },
  // Method to update an existing record by its ID
  updateService: async (media_id, data) => {
    try {
      return await PostMediaDAL.UpdateData(media_id, data);
    } catch (error) {
      throw error;
    }
  },
  // Method to retrieve all records
  getAllService: async () => {
    try {
      return await PostMediaDAL.getAllDataByView();
    } catch (error) {
      throw error;
    }
  },
  // Method to retrieve a specific record by its ID
  getServiceById: async (media_id) => {
    try {
      return await PostMediaDAL.getDataByIdByView(media_id);
    } catch (error) {
      throw error;
    }
  },
  // Method to mark a record as deleted (soft delete) by its
  deleteServiceById: async (media_id, req, res) => {
    try {
      return await PostMediaDAL.deleteDataById(media_id, req, res);
    } catch (error) {
      throw error;
    }
  },getDatabyPostIdByView:async(post_id)=>{
    try{
      return await PostMediaDAL.getDataByPostIdByView(post_id)
    }catch(error){
      throw error
    }
  },getPostMediaByPostIdsByIn:async(postIds)=>{
    try{
      return await PostMediaDAL.getPostMediaByPostIdsByIn(postIds)
    }catch(error){
      throw error
    }
  }
};

export default PostMediaService;