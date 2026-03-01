import CommentsModel from "./comments.model.js";
import commonPath from "../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
const { db, ViewFieldTableVise, tokenData } = commonPath // Destructure necessary components from commonPath

const CommentsDAL = {
     // Method to create a new record in the database
     CreateData: async (data) => {
        try {
            const createdData = await CommentsModel(db.sequelize).create(data)
            return createdData // Return the created data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, 
    // Method to update an existing record by its ID
    UpdateData: async (comment_id, data) => {
        try {
            const updateData = await CommentsModel(db.sequelize).update(data, { where: { comment_id: comment_id } })
            return updateData // Return the result of the update operation
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, 
    // Method to retrieve all records by view
    getAllDataByView: async () => {
        try {
            const getAllData = await db.sequelize.query(`${ViewFieldTableVise.COMMENTS_FIELDS}`, { type: db.Sequelize.QueryTypes.SELECT })
            return getAllData // Return the retrieved data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    },
    // Method to retrieve a specific record by its ID
    getDataByIdByView: async (comment_id) => {
        try {
            const getDataById = await db.sequelize.query(` ${ViewFieldTableVise.COMMENTS_FIELDS} where comment_id  = ${comment_id} `, { type: db.Sequelize.QueryTypes.SELECT })
            return getDataById[0] ?? [] // Return the retrieved data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, 
    // Method to mark a record as deleted (soft delete)
    deleteDataById: async (comment_id, req, res) => {
        try {
            const [deleteDataById] = await CommentsModel(db.sequelize).update({ is_active: 0, deleted_by: tokenData(req, res), deleted_at: new Date() }, {
                where: {
                    comment_id: comment_id
                }
            })
            return deleteDataById
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    },getCommentByPostAndParentId: async (post_id, parent_id,limit,offset) => {
        try {
          let whereClause = "";
          const replacements = {};
      
          // Check if post_id is valid
          if (post_id && post_id !== "null" && post_id !== "undefined") {
            whereClause += " WHERE post_id = :post_id";
            replacements.post_id = post_id;
          }
      
          // Check if parent_id is valid
          if (parent_id && parent_id !== "null" && parent_id !== "undefined") {
            whereClause += whereClause ? " AND parent_id = :parent_id" : " WHERE parent_id = :parent_id";
            replacements.parent_id = parent_id;
          }
          if (limit && offset && typeof limit === 'number' && typeof offset === 'number' && limit!=="null" && offset!=="null"){
          whereClause += whereClause ?  ` LIMIT ${limit} OFFSET ${offset}` : `LIMIT ${limit} OFFSET ${offset}`;
          replacements.limit = limit;
          replacements.offset = offset;
        }
      
          const query = `${ViewFieldTableVise.COMMENTS_FIELDS} ${whereClause}`;
          const getCommentData = await db.sequelize.query(query, {
            replacements,
            type: db.Sequelize.QueryTypes.SELECT
          });
      
          return getCommentData ?? [];
        } catch (error) {
          throw error;
        }
      },getCommentByUserIdByView:async(user_id,limit,offset)=>{
        try{
            let whereClause = "";
          const replacements = {};
      
          // Check if post_id is valid
          if (user_id && user_id !== "null" && user_id !== "undefined") {
            whereClause += " WHERE user_id = :user_id";
            replacements.user_id = user_id;
          }
      
          if (limit && offset && typeof limit === 'number' && typeof offset === 'number' && limit!=="null" && offset!=="null"){
          whereClause += whereClause ?  ` LIMIT ${limit} OFFSET ${offset}` : `LIMIT ${limit} OFFSET ${offset}`;
          replacements.limit = limit;
          replacements.offset = offset;
        }
            const getDatabyView = await db.sequelize.query(` ${ViewFieldTableVise.COMMENTS_FIELDS} ${whereClause} `,{replacements,type:db.Sequelize.QueryTypes.SELECT})
            return getDatabyView
        }catch(error){
            throw error
        }
      },// Method to safely increment a specific column (e.g., total_comment)
        IncrementDataCommentCount: async (comment_id, fieldName, amount = 1) => {
            try {
                // This runs: UPDATE Comments SET fieldName = fieldName + amount WHERE comment_id = X
                const result = await CommentsModel(db.sequelize).increment(fieldName, { 
                    by: amount, 
                    where: { comment_id: comment_id } 
                });
                return result;
            } catch (error) {
                throw error;
            }
        },
      
}
export default CommentsDAL // Export the CommentsDAL object for use in the controller