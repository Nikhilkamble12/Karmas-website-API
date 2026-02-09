import BlogsModel from "./blogs.model.js";
import commonPath from "../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
const { db, ViewFieldTableVise, tokenData } = commonPath; // Destructure necessary components from commonPath

const BlogsDAL = {
  // Method to create a new record in the database
  CreateData: async (data) => {
    try {
      const createdData = await BlogsModel(db.sequelize).create(data);
      return createdData; // Return the created data
    } catch (error) {
      throw error; // Throw error for handling in the controller
    }
  },
  // Method to update an existing record by its ID
  UpdateData: async (blog_id, data) => {
    try {
      const updateData = await BlogsModel(db.sequelize).update(data, {
        where: { blog_id: blog_id }, 
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
        `${ViewFieldTableVise.BLOG_FIELDS}`,
        { type: db.Sequelize.QueryTypes.SELECT } 
      );
      return getAllData; // Return the retrieved data
    } catch (error) {
      throw error; // Throw error for handling in the controller
    }
  },
  // Method to retrieve a specific record by its ID
  getDataByIdByView: async (blog_id) => {
    try {
      const getDataById = await db.sequelize.query(
        // Use a placeholder (?) or named replacement (:id)
        `${ViewFieldTableVise.BLOG_FIELDS} WHERE blog_id = :id`, 
        { 
          replacements: { id: blog_id }, // Securely pass the value here
          type: db.Sequelize.QueryTypes.SELECT 
        }
      );
      return getDataById[0] ?? null; // Return null if not found, rather than empty array if expecting single object
    } catch (error) {
      throw error; 
    }
  },
  // Method to mark a record as deleted (soft delete)
  deleteDataById: async (blog_id, req, res) => {
    try {
      const [deleteDataById] = await BlogsModel(db.sequelize).update(
        {
          is_active: 0,
          deleted_by: tokenData(req, res),
          deleted_at: new Date(),
        },
        {
          where: {
            blog_id: blog_id,
          },
        }
      );
      return deleteDataById; // Return the result of the update operation
    } catch (error) {
      throw error; // Throw error for handling in the controller
    }
  },
  // Method to retrieve blogs with pagination and selected fields
  getAllDataWithPagination: async (limit, offset) => {
    try {
      const getAllData = await db.sequelize.query(
        `SELECT blog_id, user_id, title FROM (${ViewFieldTableVise.BLOG_FIELDS}) as blog_view 
         LIMIT ${limit} OFFSET ${offset}`,
        { type: db.Sequelize.QueryTypes.SELECT }
      );
      return getAllData; // Return the retrieved data
    } catch (error) {
      throw error; // Throw error for handling in the controller
    }
  },getAllDataByViewByLimit: async (limit, offset) => {
    try {
        const getAllData = await db.sequelize.query(
            // Append LIMIT and OFFSET to your existing query string
            `${ViewFieldTableVise.BLOG_FIELDS} LIMIT :limit OFFSET :offset`,
            { 
                // Securely pass the values
                replacements: { 
                    limit: limit, 
                    offset: offset 
                },
                type: db.Sequelize.QueryTypes.SELECT 
            }
        );
        return getAllData; 
    } catch (error) {
        throw error; 
    }
},
};

export default BlogsDAL; // Export the CommentsDAL object for use in the controller
