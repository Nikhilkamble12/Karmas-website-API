import PostsModel from "./posts.model.js";
import commonPath from "../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
const { db, ViewFieldTableVise, tokenData } = commonPath; // Destructure necessary components from commonPath

const PostDAL = {
  // Method to create a new record in the database
  CreateData: async (data) => {
    try {
      const createdData = await PostsModel(db.sequelize).create(data);
      return createdData; // Return the created data
    } catch (error) {
      throw error; // Throw error for handling in the controller
    }
  },
  // Method to update an existing record by its ID
  UpdateData: async (post_id, data) => {
    try {
      // console.log("data", data);
      // console.log("post_id", post_id);
      const updateData = await PostsModel(db.sequelize).update(data, {
        where: { post_id: post_id }, 
      }); // Return the result of the update operation
      return updateData;
    } catch (error) {
      throw error; // Throw error for handling in the controller
    }
  },
  // Method to retrieve all records by view
  getAllDataByView: async () => {
    try {
      const getAllData = await db.sequelize.query(
        `${ViewFieldTableVise.POSTS_FIELDS}`,
        { type: db.Sequelize.QueryTypes.SELECT } // Return the retrieved data
      );
      return getAllData;
    } catch (error) {
      throw error; // Throw error for handling in the controller
    }
  },
  // Method to retrieve a specific record by its ID
  getDataByIdByView: async (post_id) => {
    try {
      const getDataById = await db.sequelize.query(
        ` ${ViewFieldTableVise.POSTS_FIELDS} where post_id  = ${post_id} `,
        { type: db.Sequelize.QueryTypes.SELECT } // Return the retrieved data
      );
      return getDataById[0] ?? [];
    } catch (error) {
      throw error; // Throw error for handling in the controller
    }
  },
  // Method to mark a record as deleted (soft delete)
  deleteDataById: async (post_id, req, res) => {
    try {
      const [deleteDataById] = await PostsModel(db.sequelize).update(
        {
          is_active: 0,
          deleted_by: tokenData(req, res),
          deleted_at: new Date(),
        },
        {
          where: {
            post_id: post_id,
          },
        }
      );
      return deleteDataById; // Return the result of the update operation
    } catch (error) {
      throw error; // Throw error for handling in the controller
    }
  },
};

export default PostDAL;
