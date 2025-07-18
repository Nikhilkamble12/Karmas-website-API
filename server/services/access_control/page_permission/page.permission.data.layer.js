import PagePermissionModel from "./page.permission.model.js";
import commonPath from "../../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
const { db, ViewFieldTableVise, tokenData } = commonPath // Destructure necessary components from commonPath

const PagePermissionDAL = {
    // Method to create a new record in the database
     CreateData: async (data) => {
        try {
            const createdData = await PagePermissionModel(db.sequelize).create(data)
            return createdData // Return the created data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, 
    // Method to update an existing record by its ID
    UpdateData: async (page_permission_id, data) => {
        try {
            const updateData = await PagePermissionModel(db.sequelize).update(data, { where: { page_permission_id: page_permission_id } })
            return updateData // Return the result of the update operation
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, 
    // Method to retrieve all records by view
    getAllDataByView: async () => {
        try {
            const getAllData = await db.sequelize.query(`${ViewFieldTableVise.PAGE_PERMISSION_FIELDS}`, { type: db.Sequelize.QueryTypes.SELECT })
            return getAllData // Return the retrieved data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    },
    // Method to retrieve a specific record by its ID
    getDataByIdByView: async (page_permission_id) => {
        try {
            const getDataById = await db.sequelize.query(` ${ViewFieldTableVise.PAGE_PERMISSION_FIELDS} where page_permission_id  = ${page_permission_id} `, { type: db.Sequelize.QueryTypes.SELECT })
            return getDataById[0] ?? [] // Return the retrieved data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, 
    // Method to mark a record as deleted (soft delete)
    deleteDataById: async (page_permission_id, req, res) => {
        try {
            const [deleteDataById] = await PagePermissionModel(db.sequelize).update({ is_active: 0, deleted_by: tokenData(req, res), deleted_at: new Date() }, {
                where: {
                    page_permission_id: page_permission_id
                }
            })
            return deleteDataById
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    },getDataByPageId:async(page_id)=>{
        try{
            const getAllData = await db.sequelize.query(` ${ViewFieldTableVise.PAGE_PERMISSION_FIELDS} where page_id = ${page_id} `, { type: db.Sequelize.QueryTypes.SELECT })
            return getAllData
        }catch(error){
            throw error
        }
    },getDataByPageIdAndPermissionId:async(page_id,permission_id)=>{
        try{
           const getAllData = await db.sequelize.query(` ${ViewFieldTableVise.PAGE_PERMISSION_FIELDS} where page_id = ${page_id} and permission_id = ${permission_id} `, { type: db.Sequelize.QueryTypes.SELECT })
            return getAllData 
        }catch(error){
            throw error
        }
    }
}

export default PagePermissionDAL