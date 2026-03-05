import LikesDAL from "./likes.data.layer.js";

const LikesService = {
  // Method to create a new record
  createSerive: async (data) => {
    try {
      return await LikesDAL.CreateData(data);
    } catch (error) {
      throw error;
    }
  },
  // Method to update an existing record by its ID
  updateService: async (like_id, data) => {
    try {
      return await LikesDAL.UpdateData(like_id, data);
    } catch (error) {
      throw error;
    }
  },
  // Method to retrieve all records
  getAllService: async () => {
    try {
      return await LikesDAL.getAllDataByView();
    } catch (error) {
      throw error;
    }
  },
  // Method to retrieve a specific record by its ID
  getServiceById: async (like_id) => {
    try {
      return await LikesDAL.getDataByIdByView(like_id);
    } catch (error) {
      throw error;
    }
  },
  // Method to mark a record as deleted (soft delete) by its
  deleteById: async (like_id, req, res) => {
    try {
      return await LikesDAL.deleteDataById(like_id, req, res);
    } catch (error) {
      throw error;
    }
  },getLikesByPostId:async(post_id,limit,offset)=>{
    try{
      return await LikesDAL.getLikesByPostId(post_id,limit,offset)
    }catch(error){
      throw error
    }
  },getLikesByUserId:async(user_id,limit,offset)=>{
    try{
      return await LikesDAL.getAllLikeByUserId(user_id,limit,offset)
    }catch(error){
      throw error
    }
  },getDataByUserIdAndPostId:async(user_id, post_id)=>{
    try {
      return await LikesDAL.getDataByUserIdAndPostId(user_id,post_id)
    } catch (error) {
      throw error
    }
  }
}

export default LikesService;