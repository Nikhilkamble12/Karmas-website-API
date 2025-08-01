import RequestModel from "./requests.model.js";
import commonPath from "../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
import VIEW_NAME from "../../utils/db/view.constants.js";
import { STATUS_MASTER } from "../../utils/constants/id_constant/id.constants.js";
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
    },getRequestsForUserFeed: async (user_id, limit = 20, already_viewed) => {
  try {
    const replacements = { user_id, limit: Number(limit) };
    
    let exclusionClause = '';
    console.log("already_viewed",already_viewed)
    if (already_viewed.trim().startsWith('[')) {
      // JSON-style string: "[174860345,174860346]"
      already_viewed = JSON.parse(already_viewed);
    } else {
      // Comma-separated string: "174860345,174860346"
      already_viewed = already_viewed
        .split(',')
        .map(id => parseInt(id.trim(), 10))
        .filter(id => !isNaN(id));
    }
    console.log(typeof(already_viewed))
    if (already_viewed && Array.isArray(already_viewed) && already_viewed.length > 0) {
      exclusionClause = `AND r.RequestId NOT IN (:already_viewed)`;
      replacements.already_viewed = already_viewed;
    }

    const query = `
      SELECT * FROM (
        (
          SELECT r.*
          FROM v_Requests r
          JOIN user_following uf ON uf.following_user_id = r.request_user_id
          WHERE uf.user_id = :user_id
            AND uf.is_following = 1
            AND uf.is_active = 1
            AND r.is_active = 1
            AND r.is_blacklist = 0
            AND r.request_user_id NOT IN (
              SELECT ub.user_id FROM user_blacklist ub WHERE ub.blacklisted_user_id = :user_id AND ub.is_active = 1
            )
            ${exclusionClause}
        )
        UNION
        (
          SELECT r.*
          FROM v_Requests r
          WHERE r.request_user_id NOT IN (
              SELECT following_user_id FROM user_following WHERE user_id = :user_id AND is_following = 1 AND is_active = 1
            )
            AND r.request_user_id NOT IN (
              SELECT user_id FROM user_blacklist WHERE blacklisted_user_id = :user_id AND is_active = 1
            )
            AND r.is_blacklist = 0
            AND r.is_active = 1
            ${exclusionClause}
          ORDER BY RAND()
          LIMIT 5
        )
      ) AS combined_requests
      ORDER BY created_at DESC
      LIMIT :limit;
    `;

    const results = await db.sequelize.query(query, {
      replacements,
      type: db.Sequelize.QueryTypes.SELECT
    });

    return results ?? [];
  } catch (error) {
    throw error;
  }
},getSumOfTotalRequest:async()=>{
  try{
    const getData = await db.sequelize.query(
  `SELECT 
    COUNT(RequestId) AS total_request,
    SUM(CASE WHEN status_id = ${STATUS_MASTER.REQUEST_INSIATED} THEN 1 ELSE 0 END) AS total_request_insiated_status,
    SUM(CASE WHEN status_id = ${STATUS_MASTER.REQUEST_APPROVED} THEN 1 ELSE 0 END) AS total_request_approved_status,
    SUM(CASE WHEN status_id = ${STATUS_MASTER.REQUEST_REJECTED} THEN 1 ELSE 0 END) AS total_request_rejected
  FROM ${VIEW_NAME.GET_ALL_REQUEST}
  `,
  { type: db.Sequelize.QueryTypes.SELECT }
);
    return getData
  }catch(error){
    throw error
  }
}

}
export default RequestDAL