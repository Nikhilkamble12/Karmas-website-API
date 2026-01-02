import PostTagModel from "./post.tag.model.js";
import commonPath from "../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
const { db, ViewFieldTableVise, tokenData } = commonPath // Destructure necessary components from commonPath

const PostTagDAL = {
      CreateData: async (data) => {
        try {
            const createdData = await PostTagModel(db.sequelize).create(data)
            return createdData // Return the created data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, 
    // Method to update an existing record by its ID
    UpdateData: async (post_tag_id, data) => {
        try {
            delete data.post_tag_id

            const updateData = await PostTagModel(db.sequelize).update(data, { where: { post_tag_id: post_tag_id } })
            return updateData // Return the result of the update operation
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, 
    // Method to retrieve all records by view
    getAllDataByView: async () => {
        try {
            let getAllData = await db.sequelize.query(`${ViewFieldTableVise.POST_TAG_FIELDS}`, { type: db.Sequelize.QueryTypes.SELECT })
            let fulldata = []
            if(getAllData && getAllData.length>0){
            fulldata = getAllData.map(row => ({
            ...row, // keep all existing columns
            tagged_user_file_path:
                row.tagged_user_file_path &&
                row.tagged_user_file_path !== 'null' &&
                row.tagged_user_file_path.trim() !== ''
                ? `${process.env.GET_LIVE_CURRENT_URL}/resources/${row.tagged_user_file_path}`
                : null,
                user_file_path:
                row.user_file_path &&
                row.user_file_path !== 'null' &&
                row.user_file_path.trim() !== ''
                ? `${process.env.GET_LIVE_CURRENT_URL}/resources/${row.user_file_path}`
                : null
            }));
            }
            return fulldata // Return the retrieved data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    },
    // Method to retrieve a specific record by its ID
    getDataByIdByView: async (post_tag_id) => {
        try {
            const getDataById = await db.sequelize.query(` ${ViewFieldTableVise.POST_TAG_FIELDS} where post_tag_id  = ${post_tag_id} `, { type: db.Sequelize.QueryTypes.SELECT })
            const resultWithImages = getDataById.map(row => ({
            ...row, // keep all existing columns
            tagged_user_file_path:
                row.tagged_user_file_path &&
                row.tagged_user_file_path !== 'null' &&
                row.tagged_user_file_path.trim() !== ''
                ? `${process.env.GET_LIVE_CURRENT_URL}/resources/${row.tagged_user_file_path}`
                : null,
                user_file_path:
                row.user_file_path &&
                row.user_file_path !== 'null' &&
                row.user_file_path.trim() !== ''
                ? `${process.env.GET_LIVE_CURRENT_URL}/resources/${row.user_file_path}`
                : null
            }));
            return resultWithImages[0] ?? [] // Return the retrieved data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, 
    // Method to mark a record as deleted (soft delete)
    deleteDataById: async (post_tag_id, req, res) => {
        try {
            const [deleteDataById] = await PostTagModel(db.sequelize).update({ is_active: 0, deleted_by: tokenData(req, res), deleted_at: new Date() }, {
                where: {
                    post_tag_id: post_tag_id
                }
            })
            return deleteDataById
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    },getDataByPostId:async(post_id)=>{
        try{
           const getDataById = await db.sequelize.query(` ${ViewFieldTableVise.POST_TAG_FIELDS} where post_id  = ${post_id} `, { type: db.Sequelize.QueryTypes.SELECT })
            const resultWithImages = getDataById.map(row => ({
            ...row, // keep all existing columns
            tagged_user_file_path:
                row.tagged_user_file_path &&
                row.tagged_user_file_path !== 'null' &&
                row.tagged_user_file_path.trim() !== ''
                ? `${process.env.GET_LIVE_CURRENT_URL}/resources/${row.tagged_user_file_path}`
                : null,
               user_file_path:
                row.user_file_path &&
                row.user_file_path !== 'null' &&
                row.user_file_path.trim() !== ''
                ? `${process.env.GET_LIVE_CURRENT_URL}/resources/${row.user_file_path}`
                : null 
            })); 
            return resultWithImages
        }catch(error){
            throw error
        }
    },deletePostTagByPostId:async(post_id,req,res)=>{
        try{
             const [deleteDataById] = await PostTagModel(db.sequelize).update({ is_active: 0, deleted_by: tokenData(req, res), deleted_at: new Date() }, {
                where: {
                    post_id: post_id
                }
            })
            return deleteDataById
        }catch(error){
            throw error
        }
    },getPostTagByUserId:async(user_id)=>{
        try{
            let getAllData = await db.sequelize.query(`${ViewFieldTableVise.POST_TAG_FIELDS} where tagged_user_id = ${user_id}`, { type: db.Sequelize.QueryTypes.SELECT })
            let fulldata = []
            if(getAllData && getAllData.length>0){
            fulldata = getAllData.map(row => ({
            ...row, // keep all existing columns
            tagged_user_file_path:
                row.tagged_user_file_path &&
                row.tagged_user_file_path !== 'null' &&
                row.tagged_user_file_path.trim() !== ''
                ? `${process.env.GET_LIVE_CURRENT_URL}/resources/${row.tagged_user_file_path}`
                : null,
                user_file_path:
                row.user_file_path &&
                row.user_file_path !== 'null' &&
                row.user_file_path.trim() !== ''
                ? `${process.env.GET_LIVE_CURRENT_URL}/resources/${row.user_file_path}`
                : null
            }));
            }
            return fulldata
        }catch(error){
            throw error
        }
    }
}
export default PostTagDAL