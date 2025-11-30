import RequestCommentsModel from "./request.comments.model.js";
import commonPath from "../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
const { db, ViewFieldTableVise, tokenData } = commonPath // Destructure necessary components from commonPath

const RequestCommentDAL = {
    // Method to create a new record in the database
    CreateData: async (data) => {
        try {
            const createdData = await RequestCommentsModel(db.sequelize).create(data)
            return createdData // Return the created data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    },
    // Method to update an existing record by its ID
    UpdateData: async (comment_id, data) => {
        try {
            const updateData = await RequestCommentsModel(db.sequelize).update(data, { where: { comment_id: comment_id } })
            return updateData // Return the result of the update operation
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    },
    // Method to retrieve all records by view
    getAllDataByView: async () => {
        try {
            const getAllData = await db.sequelize.query(`${ViewFieldTableVise.REQUEST_COMMENTS}`, { type: db.Sequelize.QueryTypes.SELECT })
            return getAllData // Return the retrieved data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    },
    // Method to retrieve a specific record by its ID
    getDataByIdByView: async (comment_id) => {
        try {
            const getDataById = await db.sequelize.query(` ${ViewFieldTableVise.REQUEST_COMMENTS} where comment_id  = ${comment_id} `, { type: db.Sequelize.QueryTypes.SELECT })
            return getDataById[0] ?? [] // Return the retrieved data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    },
    // Method to mark a record as deleted (soft delete)
    deleteDataById: async (comment_id, req, res) => {
        try {
            const [deleteDataById] = await RequestCommentsModel(db.sequelize).update({ is_active: 0, deleted_by: tokenData(req, res), deleted_at: new Date() }, {
                where: {
                    comment_id: comment_id
                }
            })
            return deleteDataById
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, getRequestCommentByRequestIdAndParentId: async (request_id, parent_id, limit, offset) => {
        try {
            let whereClause = "";
            const replacements = {};

            // Check if post_id is valid
            if (request_id && request_id !== "null" && request_id !== "undefined") {
                whereClause += " WHERE request_id = :request_id";
                replacements.request_id = request_id;
            }

            // Check if parent_id is valid
            if (parent_id && parent_id !== "null" && parent_id !== "undefined") {
                whereClause += whereClause ? " AND parent_id = :parent_id" : " WHERE parent_id = :parent_id";
                replacements.parent_id = parent_id;
            }
            if (limit && offset && typeof limit === 'number' && typeof offset === 'number' && limit !== "null" && offset !== "null") {
                whereClause += whereClause ? ` LIMIT ${limit} OFFSET ${offset}` : `LIMIT ${limit} OFFSET ${offset}`;
                replacements.limit = limit;
                replacements.offset = offset;
            }

            const query = `${ViewFieldTableVise.REQUEST_COMMENTS} ${whereClause}`;
            const getCommentData = await db.sequelize.query(query, {
                replacements,
                type: db.Sequelize.QueryTypes.SELECT
            });

            return getCommentData ?? [];
        } catch (error) {
            throw error
        }
    }, getRequestCommentByUserIdByView: async (user_id, limit, offset) => {
        try {
            let whereClause = "";
            const replacements = {};

            // Check if post_id is valid
            if (user_id && user_id !== "null" && user_id !== "undefined") {
                whereClause += " WHERE user_id = :user_id";
                replacements.user_id = user_id;
            }

            if (limit && offset && typeof limit === 'number' && typeof offset === 'number' && limit !== "null" && offset !== "null") {
                whereClause += whereClause ? ` LIMIT ${limit} OFFSET ${offset}` : `LIMIT ${limit} OFFSET ${offset}`;
                replacements.limit = limit;
                replacements.offset = offset;
            }
            const getDatabyView = await db.sequelize.query(` ${ViewFieldTableVise.COMMENTS_FIELDS} ${whereClause} `, { replacements, type: db.Sequelize.QueryTypes.SELECT })
            return getDatabyView
        } catch (error) {
            throw error
        }
    },UpdateDataCount: async (comment_id, fieldName, amount) => {
    try {
        const result = await RequestCommentsModel(db.sequelize).increment(fieldName, { 
            by: amount, 
            where: { comment_id: comment_id } 
        });
        return result;
    } catch (error) {
        throw error;
    }
},
}

export default RequestCommentDAL