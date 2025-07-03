import NotificationHistoryModel from "./notification.history.model.js";
import commonPath from "../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
const { db, ViewFieldTableVise, tokenData } = commonPath // Destructure necessary components from commonPath

const NotificationHistoryDAL = {
    // Method to create a new record in the database
     CreateData: async (data) => {
        try {
            const createdData = await NotificationHistoryModel(db.sequelize).create(data)
            return createdData // Return the created data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, 
    // Method to update an existing record by its ID
    UpdateData: async (notification_history_id, data) => {
        try {
            const updateData = await NotificationHistoryModel(db.sequelize).update(data, { where: { notification_history_id: notification_history_id } })
            return updateData // Return the result of the update operation
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, 
    // Method to retrieve all records by view
    getAllDataByView: async () => {
        try {
            const getAllData = await db.sequelize.query(`${ViewFieldTableVise.NOTIFICATION_HISTORY_FIELDS}`, { type: db.Sequelize.QueryTypes.SELECT })
            return getAllData // Return the retrieved data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    },
    // Method to retrieve a specific record by its ID
    getDataByIdByView: async (notification_history_id) => {
        try {
            const getDataById = await db.sequelize.query(` ${ViewFieldTableVise.NOTIFICATION_HISTORY_FIELDS} where notification_history_id  = ${notification_history_id} `, { type: db.Sequelize.QueryTypes.SELECT })
            return getDataById[0] ?? [] // Return the retrieved data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, 
    // Method to mark a record as deleted (soft delete)
    deleteDataById: async (notification_history_id, req, res) => {
        try {
            const [deleteDataById] = await NotificationHistoryModel(db.sequelize).update({ is_active: 0, deleted_by: tokenData(req, res), deleted_at: new Date() }, {
                where: {
                    notification_history_id: notification_history_id
                }
            })
            return deleteDataById
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    },CreateBulkData: async (dataArray) => {
    try {
        const createdData = await NotificationHistoryModel(db.sequelize).bulkCreate(dataArray, {
            // validate: true, // Ensure each row passes model validations
        });
        return createdData;
    } catch (error) {
        throw error;
    }
},getDataByUserIdByView:async(user_id)=>{
    try{
        const getAllData = await db.sequelize.query(` ${ViewFieldTableVise.NOTIFICATION_HISTORY_FIELDS} where user_id = ${user_id} `, { type: db.Sequelize.QueryTypes.SELECT })
        return getAllData
    }catch(error){
        throw error
    }
}
}

export default NotificationHistoryDAL