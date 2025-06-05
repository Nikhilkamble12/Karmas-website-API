import SosUserListModel from "./sos.user.list.model.js";
import commonPath from "../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
import VIEW_NAME from "../../utils/db/view.constants.js";
const { db, ViewFieldTableVise, tokenData } = commonPath // Destructure necessary components from commonPath

const SosUserListDAL = {
    // Method to create a new record in the database
     CreateData: async (data) => {
        try {
            const createdData = await SosUserListModel(db.sequelize).create(data)
            return createdData // Return the created data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, 
    // Method to update an existing record by its ID
    UpdateData: async (sos_user_id, data) => {
        try {
            const updateData = await SosUserListModel(db.sequelize).update(data, { where: { sos_user_id: sos_user_id } })
            return updateData // Return the result of the update operation
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, 
    // Method to retrieve all records by view
    getAllDataByView: async () => {
        try {
            const getAllData = await db.sequelize.query(`${ViewFieldTableVise.SOS_USER_LIST_FIELDS}`, { type: db.Sequelize.QueryTypes.SELECT })
            return getAllData // Return the retrieved data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    },
    // Method to retrieve a specific record by its ID
    getDataByIdByView: async (sos_user_id) => {
        try {
            const getDataById = await db.sequelize.query(` ${ViewFieldTableVise.SOS_USER_LIST_FIELDS} where sos_user_id  = ${sos_user_id} `, { type: db.Sequelize.QueryTypes.SELECT })
            return getDataById[0] ?? [] // Return the retrieved data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, 
    // Method to mark a record as deleted (soft delete)
    deleteDataById: async (sos_user_id, req, res) => {
        try {
            const [deleteDataById] = await SosUserListModel(db.sequelize).update({ is_active: 0, deleted_by: tokenData(req, res), deleted_at: new Date() }, {
                where: {
                    sos_user_id: sos_user_id
                }
            })
            return deleteDataById
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    },getDataByUserIdByView:async(user_id)=>{
        try{
            const getAllData = await db.sequelize.query(`${ViewFieldTableVise.SOS_USER_LIST_FIELDS} where user_id = ${user_id} and is_currently_active = true`, { type: db.Sequelize.QueryTypes.SELECT })
            return getAllData // Return the retrieved data
        }catch(error){
            throw error
        }
    },getDataByUserIdAndContactUserId:async(user_id,contact_user_id)=>{
        try{
            const getAllData = await db.sequelize.query(`${ViewFieldTableVise.SOS_USER_LIST_FIELDS} where user_id = ${user_id} and contact_user_id = ${contact_user_id} `, { type: db.Sequelize.QueryTypes.SELECT })
            return getAllData // Return the retrieved data
        }catch(error){
            throw error
        }
    },getUserCountOnlyByView:async(user_id)=>{
        try{
            const getAllUser = await db.sequelize.query(` SELECT count(sos_user_id) as total_sos_count FROM ${VIEW_NAME.GET_ALL_SOS_USER_LIST} where user_id = ${user_id} and is_currently_active = true `,{type:db.Sequelize.QueryTypes.SELECT})
            return getAllUser
        }catch(error){
            throw error
        }
    },getAllCountByView:async()=>{
        try{
            const getCount = await db.sequelize.query(` SELECT COUNT(*) as total_count FROM ${VIEW_NAME.GET_ALL_SOS_USER_LIST} `,{type:db.Sequelize.QueryTypes.SELECT})
            return getCount
        }catch(error){
            throw error
        }
    },getMaxUserId : async () => {
    const result = await db.sequelize.query(
        `SELECT MAX(user_id) AS max_user_id FROM ${VIEW_NAME.GET_ALL_SOS_USER_LIST}`,
        { type: db.Sequelize.QueryTypes.SELECT }
    );
    return result; // This will be an array with one object: [{ max_user_id: 12345 }]
    },getAllServiceWithLimitOffset:async (limit, offset) => {
    const result = await db.sequelize.query(
        `SELECT *
         FROM ${VIEW_NAME.GET_ALL_SOS_USER_LIST}
         ORDER BY user_id
         LIMIT :limit OFFSET :offset`,
        {
            replacements: { limit, offset },
            type: db.Sequelize.QueryTypes.SELECT
        }
    );
    return result;
},getCountForUserIdRange:async (lowerLimit, upperLimit) => {
    const result = await db.sequelize.query(
        `SELECT COUNT(*) AS total_count 
         FROM ${VIEW_NAME.GET_ALL_SOS_USER_LIST}
         WHERE user_id BETWEEN :lowerLimit AND :upperLimit`,
        {
            replacements: { lowerLimit, upperLimit },
            type: db.Sequelize.QueryTypes.SELECT
        }
    );
    return result; // [{ total_count: 123 }]
}

}
export default SosUserListDAL