import RequestTagModel from "./request.tag.model.js";
import commonPath from "../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
const { db, ViewFieldTableVise, tokenData } = commonPath // Destructure necessary components from commonPath

const RequestTagDAL = {
    // Method to create a new record in the database
      CreateData: async (data) => {
        try {
            const createdData = await RequestTagModel(db.sequelize).create(data)
            return createdData // Return the created data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, 
    // Method to update an existing record by its ID
    UpdateData: async (request_tag_id, data) => {
        try {
            delete data.request_tag_id

            const updateData = await RequestTagModel(db.sequelize).update(data, { where: { request_tag_id: request_tag_id } })
            return updateData // Return the result of the update operation
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, 
    // Method to retrieve all records by view
    getAllDataByView: async () => {
        try {
            let getAllData = await db.sequelize.query(`${ViewFieldTableVise.REQUEST_TAG_FIELDS}`, { type: db.Sequelize.QueryTypes.SELECT })
            let fulldata = []
            if(getAllData && getAllData.length>0){
            fulldata = getAllData.map(row => ({
            ...row, // keep all existing columns
            tagged_user_image_path:
                row.tagged_user_image_path &&
                row.tagged_user_image_path !== 'null' &&
                row.tagged_user_image_path.trim() !== ''
                ? `${process.env.GET_LIVE_CURRENT_URL}/resources/${row.tagged_user_image_path}`
                : null,
            user_image_path:
                row.user_image_path &&
                row.user_image_path !== 'null' &&
                row.user_image_path.trim() !== ''
                ? `${process.env.GET_LIVE_CURRENT_URL}/resources/${row.user_image_path}`
                : null
            }));
            }
            return fulldata // Return the retrieved data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    },
    // Method to retrieve a specific record by its ID
    getDataByIdByView: async (request_tag_id) => {
        try {
            const getDataById = await db.sequelize.query(` ${ViewFieldTableVise.REQUEST_TAG_FIELDS} where request_tag_id  = ${request_tag_id} `, { type: db.Sequelize.QueryTypes.SELECT })
            const resultWithImages = getDataById.map(row => ({
            ...row, // keep all existing columns
             tagged_user_image_path:
                row.tagged_user_image_path &&
                row.tagged_user_image_path !== 'null' &&
                row.tagged_user_image_path.trim() !== ''
                ? `${process.env.GET_LIVE_CURRENT_URL}/resources/${row.tagged_user_image_path}`
                : null,
            user_image_path:
                row.user_image_path &&
                row.user_image_path !== 'null' &&
                row.user_image_path.trim() !== ''
                ? `${process.env.GET_LIVE_CURRENT_URL}/resources/${row.user_image_path}`
                : null
            }));
            return resultWithImages[0] ?? [] // Return the retrieved data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, 
    // Method to mark a record as deleted (soft delete)
    deleteDataById: async (request_tag_id, req, res) => {
        try {
            const [deleteDataById] = await RequestTagModel(db.sequelize).update({ is_active: 0, deleted_by: tokenData(req, res), deleted_at: new Date() }, {
                where: {
                    request_tag_id: request_tag_id
                }
            })
            return deleteDataById
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    },getAllByRequestIdByView:async(request_id)=>{
        try{
            const getData = await db.sequelize.query(` ${ViewFieldTableVise.REQUEST_TAG_FIELDS} where request_id = ${request_id} `,{type:db.Sequelize.QueryTypes.SELECT})
            return getData
        }catch(error){
            throw error
        }
    }
}

export default RequestTagDAL