import NgoMedialikesModel from "./ngo.media.likes.model.js";
import commonPath from "../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
const { db, ViewFieldTableVise, tokenData } = commonPath // Destructure necessary components from commonPath

const NgoMediaLikesDAL = {
    // Method to create a new record in the database
     CreateData: async (data) => {
        try {
            const createdData = await NgoMedialikesModel(db.sequelize).create(data)
            return createdData // Return the created data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, 
    // Method to update an existing record by its ID
    UpdateData: async (like_id, data) => {
        try {
            const updateData = await NgoMedialikesModel(db.sequelize).update(data, { where: { like_id: like_id } })
            return updateData // Return the result of the update operation
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, 
    // Method to retrieve all records by view
    getAllDataByView: async () => {
        try {
            const getAllData = await db.sequelize.query(`${ViewFieldTableVise.NGO_MEDIA_LIKES_FIELDS}`, { type: db.Sequelize.QueryTypes.SELECT })
            return getAllData // Return the retrieved data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    },
    // Method to retrieve a specific record by its ID
    getDataByIdByView: async (like_id) => {
        try {
            const getDataById = await db.sequelize.query(` ${ViewFieldTableVise.NGO_MEDIA_LIKES_FIELDS} where like_id  = ${like_id} `, { type: db.Sequelize.QueryTypes.SELECT })
            return getDataById[0] ?? [] // Return the retrieved data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, 
    // Method to mark a record as deleted (soft delete)
    deleteDataById: async (like_id, req, res) => {
        try {
            const [deleteDataById] = await NgoMedialikesModel(db.sequelize).update({ is_active: 0, deleted_by: tokenData(req, res), deleted_at: new Date() }, {
                where: {
                    like_id: like_id
                }
            })
            return deleteDataById
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    },getDataByMediaIdAndUserId:async(ngo_media_id,user_id)=>{
        try{
            const getAllData = await db.sequelize.query(`${ViewFieldTableVise.NGO_MEDIA_LIKES_FIELDS} where ngo_media_id = ${ngo_media_id} and user_id = ${user_id} `, { type: db.Sequelize.QueryTypes.SELECT })
            return getAllData
        }catch(error){
            throw error
        }
    },getDataByNgoMediaId:async(ngo_media_id)=>{
        try{
           const getAllData = await db.sequelize.query(`${ViewFieldTableVise.NGO_MEDIA_LIKES_FIELDS} where ngo_media_id = ${ngo_media_id} `, { type: db.Sequelize.QueryTypes.SELECT })
            return getAllData 
        }catch(error){
            throw error
        }
    }
}

export default NgoMediaLikesDAL