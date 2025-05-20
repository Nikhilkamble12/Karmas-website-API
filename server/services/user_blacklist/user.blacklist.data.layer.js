import UserBlackListModel from "./user.blacklist.model.js";
import commonPath from "../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
const { db, ViewFieldTableVise, tokenData } = commonPath // Destructure necessary components from commonPath

const UserBlackListDAL = {
    // Method to create a new record in the database
     CreateData: async (data) => {
        try {
            const createdData = await UserBlackListModel(db.sequelize).create(data)
            return createdData // Return the created data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, 
    // Method to update an existing record by its ID
    UpdateData: async (blacklist_id, data) => {
        try {
            const updateData = await UserBlackListModel(db.sequelize).update(data, { where: { blacklist_id: blacklist_id } })
            return updateData // Return the result of the update operation
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, 
    // Method to retrieve all records by view
    getAllDataByView: async () => {
        try {
            const getAllData = await db.sequelize.query(`${ViewFieldTableVise.USER_BLACKLIST_FIELDS}`, { type: db.Sequelize.QueryTypes.SELECT })
            return getAllData // Return the retrieved data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    },
    // Method to retrieve a specific record by its ID
    getDataByIdByView: async (blacklist_id) => {
        try {
            const getDataById = await db.sequelize.query(` ${ViewFieldTableVise.USER_BLACKLIST_FIELDS} where blacklist_id  = ${blacklist_id} `, { type: db.Sequelize.QueryTypes.SELECT })
            return getDataById[0] ?? [] // Return the retrieved data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, 
    // Method to mark a record as deleted (soft delete)
    deleteDataById: async (blacklist_id, req, res) => {
        try {
            const [deleteDataById] = await UserBlackListModel(db.sequelize).update({ is_active: 0, deleted_by: tokenData(req, res), deleted_at: new Date() }, {
                where: {
                    blacklist_id: blacklist_id
                }
            })
            return deleteDataById
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    },getByUserId:async(user_id)=>{
        try{
            const getDatabyUserid = await db.sequelize.query(` ${ViewFieldTableVise.USER_BLACKLIST_FIELDS} where user_id = ${user_id} `,{type:db.Sequelize.QueryTypes.SELECT})
            return getDatabyUserid
        }catch(error){
            throw error
        }
    },getDatabyUserIdAndBlacklistUserid:async(user_id,blacklist_user_id)=>{
        try{
            const getDataByUserIdAndBackList = await db.sequelize.query(` ${ViewFieldTableVise} where user_id = ${user_id} and blacklisted_user_id = ${blacklist_user_id} `,{type:db.Sequelize.QueryTypes.SELECT})
            return getDataByUserIdAndBackList
        }catch(error){
            throw error
        }
    }
}

export default UserBlackListDAL