import NgoMediaCommentsModel from "./ngo.media.comments.model.js";
import commonPath from "../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
const { db, ViewFieldTableVise, tokenData } = commonPath // Destructure necessary components from commonPath

const NgoMediaCommentsDAL = {
    // Method to create a new record in the database
     CreateData: async (data) => {
        try {
            const createdData = await NgoMediaCommentsModel(db.sequelize).create(data)
            return createdData // Return the created data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, 
    // Method to update an existing record by its ID
    UpdateData: async (comment_id, data) => {
        try {
            const updateData = await NgoMediaCommentsModel(db.sequelize).update(data, { where: { comment_id: comment_id } })
            return updateData // Return the result of the update operation
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, 
    // Method to retrieve all records by view
    getAllDataByView: async () => {
        try {
            const getAllData = await db.sequelize.query(`${ViewFieldTableVise.NGO_MEDIA_COMMENTS_FIELDS}`, { type: db.Sequelize.QueryTypes.SELECT })
            return getAllData // Return the retrieved data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    },
    // Method to retrieve a specific record by its ID
    getDataByIdByView: async (comment_id) => {
        try {
            const getDataById = await db.sequelize.query(` ${ViewFieldTableVise.NGO_MEDIA_COMMENTS_FIELDS} where comment_id  = ${comment_id} `, { type: db.Sequelize.QueryTypes.SELECT })
            return getDataById[0] ?? [] // Return the retrieved data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, 
    // Method to mark a record as deleted (soft delete)
    deleteDataById: async (comment_id, req, res) => {
        try {
            const [deleteDataById] = await NgoMediaCommentsModel(db.sequelize).update({ is_active: 0, deleted_by: tokenData(req, res), deleted_at: new Date() }, {
                where: {
                    comment_id: comment_id
                }
            })
            return deleteDataById
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    },getCommentByNgoMediaOnlyParent:async(ngo_media_id)=>{
        try{
            const getAllData = await db.sequelize.query(` ${ViewFieldTableVise.NGO_MEDIA_COMMENTS_FIELDS} where ngo_media_id = ${ngo_media_id} and parent_id = 0 `, { type: db.Sequelize.QueryTypes.SELECT })
            return getAllData // Return the retrieved data
        }catch(error){
            throw error
        }
    },getCommentsByNgoMediaAndParentId:async(ngo_media_id,parent_id)=>{
        try{
            const getAllData = await db.sequelize.query(` ${ViewFieldTableVise.NGO_MEDIA_COMMENTS_FIELDS} where ngo_media_id = ${ngo_media_id} and parent_id = ${parent_id} `, { type: db.Sequelize.QueryTypes.SELECT })
            return getAllData
        }catch(error){
            throw error
        }
    }
}

export default NgoMediaCommentsDAL