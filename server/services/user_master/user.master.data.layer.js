import UserMasterModel from "./user.master.model.js";
import commonPath from "../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
const { db, ViewFieldTableVise, tokenData } = commonPath // Destructure necessary components from commonPath

const UserMasterDAL = {
    // Method to create a new record in the database
    CreateData: async (data) => {
        try {
            console.log("data",data)
            const createdData = await UserMasterModel(db.sequelize).create(data)
            return createdData // Return the created data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, 
    // Method to update an existing record by its ID
    UpdateData: async (user_id, data) => {
        try {
            const updateData = await UserMasterModel(db.sequelize).update(data, { where: { user_id: user_id } })
            return updateData // Return the result of the update operation
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, 
    // Method to retrieve all records by view
    getAllDataByView: async () => {
        try {
            const getAllData = await db.sequelize.query(`${ViewFieldTableVise.USER_MASTER_FIELDS}`, { type: db.Sequelize.QueryTypes.SELECT })
            return getAllData // Return the retrieved data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    },
    // Method to retrieve a specific record by its ID
    getDataByIdByView: async (user_id) => {
        try {
            const getDataById = await db.sequelize.query(` ${ViewFieldTableVise.USER_MASTER_FIELDS} where user_id  = ${user_id} `, { type: db.Sequelize.QueryTypes.SELECT })
            return getDataById[0] ?? [] // Return the retrieved data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, 
    // Method to mark a record as deleted (soft delete)
    deleteDataById: async (user_id, req, res) => {
        try {
            const [deleteDataById] = await UserMasterModel(db.sequelize).update({ is_active: 0, deleted_by: tokenData(req, res), deleted_at: new Date() }, {
                where: {
                    user_id: user_id
                }
            })
            return deleteDataById
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    },getDataByUsernameAndPassword: async (user_name,password)=>{
        try{
            const getData = await db.sequelize.query(
                `${ViewFieldTableVise.USER_MASTER_FIELDS} WHERE user_name = ':user_name' AND password = ':password'`, 
                {
                    replacements: { user_name, password },
                    type: db.Sequelize.QueryTypes.SELECT
                }
            );
            return getData
        }catch(error){
            throw error
        }
    },checkIfUserNameIsPresent:async(user_name)=>{
        try{
            console.log('user_name',user_name)
            const getData =await db.sequelize.query(`${ViewFieldTableVise.USER_MASTER_FIELDS} where user_name = '${user_name}'`,{type:db.Sequelize.QueryTypes.SELECT})
            return getData[0] ?? []
        }catch(error){
            throw error
        }
    }
}

export default UserMasterDAL