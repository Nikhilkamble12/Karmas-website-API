import PostMediaModel from "./postmedia.model.js";
import commonPath from "../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
const { db, ViewFieldTableVise, tokenData } = commonPath; // Destructure necessary components from commonPath

const PostMediaDAL = {
  CreteData : async (data) => {
    // Method to create a new record in the database
    try {
      const createdData = await PostMediaModel(db.sequelize).create(data);
      return createdData; // Return the created data
    } catch (error) {
      throw error; // Throw error for handling in the controller
    }
  },
  // Method to update an existing record by its ID
  UpdateData : async (media_id, data) => {
    try {
      const updateData = await PostMediaModel(db.sequelize).update(data, {
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
        `${ViewFieldTableVise.POST_MEDIA_FIELDS}`,
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
        ` ${ViewFieldTableVise.POST_MEDIA_FIELDS} where media_id  = ${media_id} `,
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
      const [deleteDataById] = await PostMediaModel(db.sequelize).update(
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
  },getDataByPostIdByView:async(post_id)=>{
    try{
      const getDataById = await db.sequelize.query(
        ` ${ViewFieldTableVise.POST_MEDIA_FIELDS} where post_id  = ${post_id} `,
        { type: db.Sequelize.QueryTypes.SELECT } // Return the retrieved data
      );
      return getDataById ?? [];
    }catch(error){
      throw error
    }
  }
}

export default PostMediaDAL; 