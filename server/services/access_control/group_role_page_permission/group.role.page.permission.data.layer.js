import GroupRolePagePermissionModel from "./group.role.page.permission.model.js";
import commonPath from "../../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
const { db, ViewFieldTableVise, tokenData } = commonPath // Destructure necessary components from commonPath

const GroupRolePagePermissionDAL = {
    // Method to create a new record in the database
     CreateData: async (data) => {
        try {
            const createdData = await GroupRolePagePermissionModel(db.sequelize).create(data)
            return createdData // Return the created data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, 
    // Method to update an existing record by its ID
    UpdateData: async (role_page_permission_id, data) => {
        try {
            const updateData = await GroupRolePagePermissionModel(db.sequelize).update(data, { where: { role_page_permission_id: role_page_permission_id } })
            return updateData // Return the result of the update operation
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, 
    // Method to retrieve all records by view
    getAllDataByView: async () => {
        try {
            const getAllData = await db.sequelize.query(`${ViewFieldTableVise.GROUP_ROLE_PAGE_PERMISSION_FIELDS}`, { type: db.Sequelize.QueryTypes.SELECT })
            return getAllData // Return the retrieved data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    },
    // Method to retrieve a specific record by its ID
    getDataByIdByView: async (role_page_permission_id) => {
        try {
            const getDataById = await db.sequelize.query(` ${ViewFieldTableVise.GROUP_ROLE_PAGE_PERMISSION_FIELDS} where role_page_permission_id  = ${role_page_permission_id} `, { type: db.Sequelize.QueryTypes.SELECT })
            return getDataById[0] ?? [] // Return the retrieved data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, 
    // Method to mark a record as deleted (soft delete)
    deleteDataById: async (role_page_permission_id, req, res) => {
        try {
            const [deleteDataById] = await GroupRolePagePermissionModel(db.sequelize).update({ is_active: 0, deleted_by: tokenData(req, res), deleted_at: new Date() }, {
                where: {
                    role_page_permission_id: role_page_permission_id
                }
            })
            return deleteDataById
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    },getDataByRoleId:async(role_id)=>{
        try{
            const getAllData = await db.sequelize.query(`${ViewFieldTableVise.GROUP_ROLE_PAGE_PERMISSION_FIELDS} where  role_id = ${role_id} `, { type: db.Sequelize.QueryTypes.SELECT })
            return getAllData // Return the retrieved data
        }catch(error){
            throw error
        }
    },getDataByRoleIdAndPageId:async(role_id,page_id)=>{
        try{
             const getAllData = await db.sequelize.query(`${ViewFieldTableVise.GROUP_ROLE_PAGE_PERMISSION_FIELDS} where  role_id = ${role_id} and page_id = ${page_id} and ngo_level_id is null `, { type: db.Sequelize.QueryTypes.SELECT })
            return getAllData
        }catch(error){
            throw error
        }
    },getDataByRoleIdAndPageIdAndNgoLevelId:async(role_id,page_id,ngo_level_id)=>{
        try{
            const getAllData = await db.sequelize.query(`${ViewFieldTableVise.GROUP_ROLE_PAGE_PERMISSION_FIELDS} where  role_id = ${role_id} and page_id = ${page_id} and ngo_level_id = ${ngo_level_id} `, { type: db.Sequelize.QueryTypes.SELECT })
            return getAllData
        }catch(error){
            throw error
        }
    }
}

export default GroupRolePagePermissionDAL