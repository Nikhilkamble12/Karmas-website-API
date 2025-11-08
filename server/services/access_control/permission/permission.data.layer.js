import PermissionModel from "./permission.model.js";
import commonPath from "../../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
import { Op } from "sequelize";
const { db, ViewFieldTableVise, tokenData } = commonPath // Destructure necessary components from commonPath

const PermissionDAL = {
    // Method to create a new record in the database
     CreateData: async (data) => {
        try {
            const createdData = await PermissionModel(db.sequelize).create(data)
            return createdData // Return the created data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, 
    // Method to update an existing record by its ID
    UpdateData: async (permission_id, data) => {
        try {
            const updateData = await PermissionModel(db.sequelize).update(data, { where: { permission_id: permission_id } })
            return updateData // Return the result of the update operation
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, 
    // Method to retrieve all records by view
    getAllDataByView: async () => {
        try {
            const getAllData = await db.sequelize.query(`${ViewFieldTableVise.PERMISSION_FIELDS} `, { type: db.Sequelize.QueryTypes.SELECT })
            return getAllData // Return the retrieved data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    },
    // Method to retrieve a specific record by its ID
    getDataByIdByView: async (permission_id) => {
        try {
            const getDataById = await db.sequelize.query(` ${ViewFieldTableVise.PERMISSION_FIELDS}  where permission_id  = ${permission_id} `, { type: db.Sequelize.QueryTypes.SELECT })
            return getDataById[0] ?? [] // Return the retrieved data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, 
    // Method to mark a record as deleted (soft delete)
    deleteDataById: async (permission_id, req, res) => {
        try {
            const [deleteDataById] = await PermissionModel(db.sequelize).update({ is_active: 0, deleted_by: tokenData(req, res), deleted_at: new Date() }, {
                where: {
                    permission_id: permission_id
                }
            })
            return deleteDataById
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    },getPermissionByDescByOnlyOne:async()=>{
    try{
      const getAllPermission = await PermissionModel(db.sequelize).findAll({
        where: {
          is_active: true,
          permission_values: {
            [Op.ne]: null, // Not equal to null
            [Op.ne]: ""    // Not equal to an empty string
          }
        },
        order: [['permission_id', 'DESC']],
         limit: 1
      });
      return getAllPermission
    }catch(error){
      throw error
    }
  }
}

export default PermissionDAL