import BlogMediaDAL from "./blog.media.data.layer.js";

const BlogMediaService = {
  // Method to create a new record
  createSerive: async (data) => {
    try {
      return await BlogMediaDAL.CreteData(data);
    } catch (error) {
      throw error;
    }
  },
  // Method to update an existing record by its ID
  updateService: async (media_id, data) => {
    try {
      return await BlogMediaDAL.UpdateData(media_id, data);
    } catch (error) {
      throw error;
    }
  },
  // Method to retrieve all records
  getAllService: async () => {
    try {
      return await BlogMediaDAL.getAllDataByView();
    } catch (error) {
      throw error;
    }
  },
  // Method to retrieve a specific record by its ID
  getServiceById: async (media_id) => {
    try {
      return await BlogMediaDAL.getDataByIdByView(media_id);
    } catch (error) {
      throw error;
    }
  },
  // Method to mark a record as deleted (soft delete) by its
  deleteServiceById: async (media_id, req, res) => {
    try {
      return await BlogMediaDAL.deleteDataById(media_id, req, res);
    } catch (error) {
      throw error;
    }
  },getDatabyBlogIdByView:async(blog_id)=>{
    try{
      return await BlogMediaDAL.getDataByBlogIdByView(blog_id)
    }catch(error){
      throw error
    }
  },getDatabyInBlogIdByView:async(blog_id)=>{
    try{
      return await BlogMediaDAL.getDataByINBlogIdByView(blog_id)
    }catch(error){
      throw error
    }
  }
};

export default BlogMediaService;