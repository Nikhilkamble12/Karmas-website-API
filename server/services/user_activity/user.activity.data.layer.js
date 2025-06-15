import UserActivityModel from "./user.activity.model.js";
import commonPath from "../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
import VIEW_NAME from "../../utils/db/view.constants.js";
const { db, ViewFieldTableVise, tokenData } = commonPath // Destructure necessary components from commonPath

const UserActivityDAL = {
    // Method to create a new record in the database
    CreateData: async (data) => {
        try {
            const createdData = await UserActivityModel(db.sequelize).create(data)
            return createdData // Return the created data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, 
    // Method to update an existing record by its ID
    UpdateData: async (user_activity_id, data) => {
        try {
            const updateData = await UserActivityModel(db.sequelize).update(data, { where: { user_activity_id: user_activity_id } })
            return updateData // Return the result of the update operation
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, 
    // Method to retrieve all records by view
    getAllDataByView: async () => {
        try {
            const getAllData = await db.sequelize.query(` ${ViewFieldTableVise.USER_ACTIVITY_FIELDS} `, { type: db.Sequelize.QueryTypes.SELECT })
            return getAllData // Return the retrieved data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    },
    // Method to retrieve a specific record by its ID
    getDataByIdByView: async (user_activity_id) => {
        try {
            const getDataById = await db.sequelize.query(` ${ViewFieldTableVise.USER_ACTIVITY_FIELDS} where user_activity_id  = ${user_activity_id} `, { type: db.Sequelize.QueryTypes.SELECT })
            return getDataById[0] ?? [] // Return the retrieved data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, 
    // Method to mark a record as deleted (soft delete)
    deleteDataById: async (user_activity_id, req, res) => {
        try {
            const [deleteDataById] = await UserActivityModel(db.sequelize).update({ is_active: 0, deleted_by: tokenData(req, res), deleted_at: new Date() }, {
                where: {
                    user_activity_id: user_activity_id
                }
            })
            return deleteDataById
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    },getDataByUserId : async(user_id)=>{
        try{
            const getData = await db.sequelize.query(` ${ViewFieldTableVise.USER_ACTIVITY_FIELDS} where user_id = ${user_id} `,{type:db.Sequelize.QueryTypes.SELECT})
            return getData
        }catch(error){
            throw error
        }
    },updateByUserId:async(user_id,data)=>{
        try{
            const updateData = await UserActivityModel(db.sequelize).update(data, { where: { user_id: user_id } })
            return updateData // Return the result of the update operation
        }catch(error){
            throw error
        }
    }
}
export default UserActivityDAL