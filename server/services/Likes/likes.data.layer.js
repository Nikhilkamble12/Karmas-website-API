import LikesModel from "./likes.model.js";
import commonPath from "../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
const { db, ViewFieldTableVise, tokenData } = commonPath; // Destructure necessary components from commonPath

const LikesDAL = {
  // Method to create a new record in the database
  CreateData: async (data) => {
    try {
      const createdData = await LikesModel(db.sequelize).create(data);
      return createdData; // Return the created data
    } catch (error) {
      throw error; // Throw error for handling in the controller
    }
  },
  // Method to update an existing record by its ID
  UpdateData: async (like_id, data) => {
    try {
      const updateData = await LikesModel(db.sequelize).update(data, {
        where: { like_id: like_id },
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
        `${ViewFieldTableVise.LIKES_FIELDS}`,
        { type: db.Sequelize.QueryTypes.SELECT } // Return the retrieved data
      );
      return getAllData;
    } catch (error) {
      throw error; // Throw error for handling in the controller
    }
  },
  // Method to retrieve a specific record by its ID
  getDataByIdByView: async (like_id) => {
    try {
      const getDataById = await db.sequelize.query(
        ` ${ViewFieldTableVise.LIKES_FIELDS} where like_id  = ${like_id} `,
        { type: db.Sequelize.QueryTypes.SELECT } // Return the retrieved data
      );
      return getDataById[0] ?? [];
    } catch (error) {
      throw error; // Throw error for handling in the controller
    }
  },
  // Method to mark a record as deleted (soft delete)
  deleteDataById: async (like_id, req, res) => {
    try {
      const [deleteDataById] = await LikesModel(db.sequelize).update(
        {
          is_active: 0,
          deleted_by: tokenData(req, res),
          deleted_at: new Date(),
        },
        { where: { like_id: like_id } }
      );
      return deleteDataById;
    } catch (error) {
      throw error; // Throw error for handling in the controller
    }
  },getLikesByPostId:async(post_id,limit,offset)=>{
    try{
       let query = `${ViewFieldTableVise.LIKES_FIELDS} WHERE post_id = ${post_id}`;
        if (limit && offset && typeof limit === 'number' && typeof offset === 'number' && limit!=="null" && offset!=="null"){
          query += ` LIMIT ${limit} OFFSET ${offset}`;
        }
      const getDataById = await db.sequelize.query(
        ` ${query}`,
        { type: db.Sequelize.QueryTypes.SELECT } // Return the retrieved data
      );
      return getDataById ?? [];
    }catch(error){
      throw error
    }
  },getAllLikeByUserId:async(user_id,limit,offset)=>{
    try{
      let query = `${ViewFieldTableVise.LIKES_FIELDS} WHERE user_id = ${user_id} and is_like = true`;
        if (limit && offset && typeof limit === 'number' && typeof offset === 'number' && limit!=="null" && offset!=="null"){
          query += ` LIMIT ${limit} OFFSET ${offset}`;
        }
      const getDataById = await db.sequelize.query(
        ` ${query}`,
        { type: db.Sequelize.QueryTypes.SELECT } // Return the retrieved data
      );
      return getDataById ?? [];
    }catch(error){
      throw error
    }
  },getDataByUserIdAndPostId:async(user_id,post_id)=>{
    try{
        const getAllData = await db.sequelize.query(`${ViewFieldTableVise.LIKES_FIELDS} where user_id = ${user_id} and post_id = ${post_id} `, { type: db.Sequelize.QueryTypes.SELECT })
        return getAllData
    }catch(error){
        throw error
    }
  }
};

export default LikesDAL; // Export the LikesDAL object for use in the service