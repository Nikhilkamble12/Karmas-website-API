import UserRequestStatsModel from "./user.request.stats.model.js";
import commonPath from "../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
import RequestDAL from "../requests/requests.data.layer.js";
const { db, ViewFieldTableVise, tokenData } = commonPath // Destructure necessary components from commonPath

const UserRequestStatsDAL = {
    // Method to create a new record in the database
     CreateData: async (data) => {
        try {
            const createdData = await UserRequestStatsModel(db.sequelize).create(data)
            return createdData // Return the created data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, 
    // Method to update an existing record by its ID
    UpdateData: async (UserRequestStatsDAL, data) => {
        try {
            const updateData = await UserRequestStatsModel(db.sequelize).update(data, { where: { UserRequestStatsDAL: UserRequestStatsDAL } })
            return updateData // Return the result of the update operation
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, 
    // Method to retrieve all records by view
    getAllDataByView: async () => {
        try {
            const getAllData = await db.sequelize.query(`${ViewFieldTableVise.USER_REQUEST_STATS_FIELDS}`, { type: db.Sequelize.QueryTypes.SELECT })
            return getAllData // Return the retrieved data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    },
    // Method to retrieve a specific record by its ID
    getDataByIdByView: async (UserRequestStatsDAL) => {
        try {
            const getDataById = await db.sequelize.query(` ${ViewFieldTableVise.USER_REQUEST_STATS_FIELDS} where UserRequestStatsDAL  = ${UserRequestStatsDAL} `, { type: db.Sequelize.QueryTypes.SELECT })
            return getDataById[0] ?? [] // Return the retrieved data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, 
    // Method to mark a record as deleted (soft delete)
    deleteDataById: async (UserRequestStatsDAL, req, res) => {
        try {
            const [deleteDataById] = await UserRequestStatsModel(db.sequelize).update({ is_active: 0, deleted_by: tokenData(req, res), deleted_at: new Date() }, {
                where: {
                    UserRequestStatsDAL: UserRequestStatsDAL
                }
            })
            return deleteDataById
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    },getDataByUserIdByView:async(user_id)=>{
        try{
           const getAllData = await db.sequelize.query(`${ViewFieldTableVise.USER_REQUEST_STATS_FIELDS} where user_id = ${user_id} `, { type: db.Sequelize.QueryTypes.SELECT })
            return getAllData // Return the retrieved data 
        }catch(error){
            throw error
        }
    },CreateOrUpdateData: async (user_id) => {
    try {
        const model = UserRequestStatsModel(db.sequelize);
        const getDataByUserId = await RequestDAL.getSumOfTotalRequestByUserId(user_id)
        const data = {
            user_id:user_id,
            total_request:getDataByUserId[0].total_request ?? 0,
            total_draft_request:getDataByUserId[0].total_request_draft ?? 0,
            total_insiated_request:getDataByUserId[0].total_request_insiated_status ?? 0,
            total_request_approved:getDataByUserId[0].total_request_approved_status ?? 0,
            total_rejected_request:getDataByUserId[0].total_request_rejected ?? 0,
            is_active:true,
        }
        // Check if record exists by user_id
        const existingRecord = await model.findOne({ where: { user_id } });

        if (existingRecord) {
            // Update the record
            await model.update(data, { where: { user_id } });
            return { message: "Record updated successfully.", updated: true };
        } else {   
            // Create a new record with user_id included
            await model.create({ ...data, user_id });
            return { message: "Record created successfully.", created: true };
        }
    } catch (error) {
        throw error;
    }
},

}

export default UserRequestStatsDAL