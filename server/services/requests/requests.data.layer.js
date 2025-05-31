import RequestModel from "./requests.model.js";
import commonPath from "../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
const { db, ViewFieldTableVise, tokenData } = commonPath // Destructure necessary components from commonPath

const RequestDAL = {
     // Method to create a new record in the database
     CreateData: async (data) => {
        try {
            const createdData = await RequestModel(db.sequelize).create(data)
            return createdData // Return the created data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, 
    // Method to update an existing record by its ID
    UpdateData: async (RequestId, data) => {
        try {
            const updateData = await RequestModel(db.sequelize).update(data, { where: { RequestId: RequestId } })
            return updateData // Return the result of the update operation
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, 
    // Method to retrieve all records by view
    getAllDataByView: async () => {
        try {
            const getAllData = await db.sequelize.query(`${ViewFieldTableVise.REQUEST_FIELDS}`, { type: db.Sequelize.QueryTypes.SELECT })
            return getAllData // Return the retrieved data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    },
    // Method to retrieve a specific record by its ID
    getDataByIdByView: async (RequestId) => {
        try {
            const getDataById = await db.sequelize.query(` ${ViewFieldTableVise.REQUEST_FIELDS} where RequestId  = ${RequestId} `, { type: db.Sequelize.QueryTypes.SELECT })
            return getDataById[0] ?? [] // Return the retrieved data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, 
    // Method to mark a record as deleted (soft delete)
    deleteDataById: async (RequestId, req, res) => {
        try {
            const [deleteDataById] = await RequestModel(db.sequelize).update({ is_active: 0, deleted_by: tokenData(req, res), deleted_at: new Date() }, {
                where: {
                    RequestId: RequestId
                }
            })
            return deleteDataById
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    },getUserByUserId:async(user_id,limit,offset)=>{
        try{
             // Start with the base query
            let query = `${ViewFieldTableVise.REQUEST_FIELDS} WHERE created_by = ${user_id} order by RequestId desc`;

            // Add LIMIT and OFFSET if they’re provided
            if (limit && offset >= 0) {
            query += ` LIMIT ${offset}, ${limit}`;
            }

            const getAllData = await db.sequelize.query(query, {
            type: db.Sequelize.QueryTypes.SELECT
            });
            return getAllData
        }catch(error){
            throw error
        }
    }
}
export default RequestDAL