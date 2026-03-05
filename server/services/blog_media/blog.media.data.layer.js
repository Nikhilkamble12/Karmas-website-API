import BlogMediaModel from "./blog.media.model.js";
import commonPath from "../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
const { db, ViewFieldTableVise, tokenData } = commonPath; // Destructure necessary components from commonPath

const BlogMediaDAL = {
  CreteData : async (data) => {
    // Method to create a new record in the database
    try {
      const createdData = await BlogMediaModel(db.sequelize).create(data);
      return createdData; // Return the created data
    } catch (error) {
      throw error; // Throw error for handling in the controller
    }
  },
  // Method to update an existing record by its ID
  UpdateData : async (media_id, data) => {
    try {
      const updateData = await BlogMediaModel(db.sequelize).update(data, {
        where: { media_id: media_id }, // Return the result of the update operation
      });
      return updateData;
    } catch (error) {
      throw error; // Throw error for handling in the controller
    }
  },
  // Method to retrieve all records by view
  getAllDataByView: async () => {
    try {
      const getAllData = await db.sequelize.query(
        `${ViewFieldTableVise.Blog_MEDIA_FIELDS}`,
        { type: db.Sequelize.QueryTypes.SELECT } // Return the retrieved data
      );
      return getAllData;
    } catch (error) {
      throw error; // Throw error for handling in the controller
    }
  },
  // Method to retrieve a specific record by its ID
  getDataByIdByView: async (media_id) => {
    try {
      const getDataById = await db.sequelize.query(
        ` ${ViewFieldTableVise.Blog_MEDIA_FIELDS} where media_id  = ${media_id} `,
        { type: db.Sequelize.QueryTypes.SELECT } // Return the retrieved data
      );
      return getDataById[0] ?? [];
    } catch (error) {
      throw error; // Throw error for handling in the controller
    }
  },
  // Method to mark a record as deleted (soft delete)
  deleteDataById: async (media_id, req, res) => {
    try {
      const [deleteDataById] = await BlogMediaModel(db.sequelize).update(
        {
          is_active: 0,
          deleted_by: tokenData(req, res),
          deleted_at: new Date(),
        },
        {
          where: {
            media_id: media_id,
          },
        }
      );
      return deleteDataById;
    } catch (error) {
      throw error; // Throw error for handling in the controller
    }
  },getDataByBlogIdByView:async(blog_id)=>{
    try{
      const getDataById = await db.sequelize.query(
        ` ${ViewFieldTableVise.Blog_MEDIA_FIELDS} where blog_id  = ${blog_id} `,
        { type: db.Sequelize.QueryTypes.SELECT } // Return the retrieved data
      );
      return getDataById ?? [];
    }catch(error){
      throw error
    }
  },getDataByINBlogIdByView:async(blog_id)=>{
    try{
      console.log("blog_id",blog_id)
      const getDataById = await db.sequelize.query(
        ` ${ViewFieldTableVise.Blog_MEDIA_FIELDS} where blog_id IN (${blog_id}) `,
        { type: db.Sequelize.QueryTypes.SELECT } // Return the retrieved data
      );
      return getDataById ?? [];
    }catch(error){
      throw error
    }
  }
}

export default BlogMediaDAL; 