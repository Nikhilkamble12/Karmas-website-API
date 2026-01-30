import RequestDocumentModel from "./request.documents.model.js";
import commonPath from "../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
const { db, ViewFieldTableVise, tokenData } = commonPath // Destructure necessary components from commonPath


const RequestDocumentsDAL = {
    // Method to create a new record in the database
    CreateData: async (data) => {
        try {
            const createdData = await RequestDocumentModel(db.sequelize).create(data)
            return createdData // Return the created data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    },
    // Method to update an existing record by its ID
    UpdateData: async (request_document_id, data) => {
        try {
            const updateData = await RequestDocumentModel(db.sequelize).update(data, { where: { request_document_id: request_document_id } })
            return updateData // Return the result of the update operation
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    },
    // Method to retrieve all records by view
    getAllDataByView: async () => {
        try {
            const getAllData = await db.sequelize.query(`${ViewFieldTableVise.REQUEST_DOCUMENTS_FIELDS}`, { type: db.Sequelize.QueryTypes.SELECT })
            return getAllData // Return the retrieved data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    },
    // Method to retrieve a specific record by its ID
    getDataByIdByView: async (request_document_id) => {
        try {
            const getDataById = await db.sequelize.query(` ${ViewFieldTableVise.REQUEST_DOCUMENTS_FIELDS} where request_document_id  = ${request_document_id} `, { type: db.Sequelize.QueryTypes.SELECT })
            return getDataById[0] ?? [] // Return the retrieved data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    },
    // Method to mark a record as deleted (soft delete)
    deleteDataById: async (request_document_id, req, res) => {
        try {
            const [deleteDataById] = await RequestDocumentModel(db.sequelize).update({ is_active: 0, deleted_by: tokenData(req, res), deleted_at: new Date() }, {
                where: {
                    request_document_id: request_document_id
                }
            })
            return deleteDataById
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, 
    getDataByRequestIdByView: async (RequestId) => {
        try {
            const getDataById = await db.sequelize.query(` ${ViewFieldTableVise.REQUEST_DOCUMENTS_FIELDS} where RequestId  = ${RequestId} `, { type: db.Sequelize.QueryTypes.SELECT })
            return getDataById ?? [] // Return the retrieved data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    },
}

export default RequestDocumentsDAL