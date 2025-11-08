import PostCommentLikesModel from "../post_comment_likes/post.comment.likes.model.js";
import commonPath from "../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
const { db, ViewFieldTableVise, tokenData } = commonPath // Destructure necessary components from commonPath

const PostCommentLikesDAL = {
    // Method to create a new record in the database
     CreateData: async (data) => {
        try {
            const createdData = await PostCommentLikesModel(db.sequelize).create(data)
            return createdData // Return the created data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, 
    // Method to update an existing record by its ID
    UpdateData: async (like_id, data) => {
        try {
            const updateData = await PostCommentLikesModel(db.sequelize).update(data, { where: { like_id: like_id } })
            return updateData // Return the result of the update operation
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, 
    // Method to retrieve all records by view
    getAllDataByView: async () => {
        try {
            const getAllData = await db.sequelize.query(` ${ViewFieldTableVise.POST_COMMENT_LIKES} `, { type: db.Sequelize.QueryTypes.SELECT })
            return getAllData // Return the retrieved data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    },
    // Method to retrieve a specific record by its ID
    getDataByIdByView: async (like_id) => {
        try {
            const getDataById = await db.sequelize.query(` ${ViewFieldTableVise.POST_COMMENT_LIKES} where like_id  = ${like_id} `, { type: db.Sequelize.QueryTypes.SELECT })
            return getDataById[0] ?? [] // Return the retrieved data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, 
    // Method to mark a record as deleted (soft delete)
    deleteDataById: async (like_id, req, res) => {
        try {
            const [deleteDataById] = await PostCommentLikesModel(db.sequelize).update({ is_active: 0, deleted_by: tokenData(req, res), deleted_at: new Date() }, {
                where: {
                    like_id: like_id
                }
            })
            return deleteDataById
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    },getPostCommentLikesByPostCommentIdByView:async(post_cmt_id,limit,offset)=>{
        try{
            let query = `${ViewFieldTableVise.POST_COMMENT_LIKES} where post_cmt_id = ${post_cmt_id}`;
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
    },getPostCommentLikesByUserIdByView:async(user_id,limit,offset)=>{
        try{
           let query = `${ViewFieldTableVise.POST_COMMENT_LIKES} where user_id = ${user_id} and is_liked = true`;
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
    }
}

export default PostCommentLikesDAL;