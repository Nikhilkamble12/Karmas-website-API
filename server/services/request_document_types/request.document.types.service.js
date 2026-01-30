import RequestDocumentsTypesDAL from "./request.document.types.data.layer.js";

const RequestDocumentTypesService = {
    // Method to create a new record
    createService: async (data) => {
        try {
            return await RequestDocumentsTypesDAL.CreateData(data)
        } catch (error) {
            throw error
        }
    },
    // Method to update an existing record by its ID 
    updateService: async (request_document_id, data) => {
        try {
            return await RequestDocumentsTypesDAL.UpdateData(request_document_id, data)
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve all records
    getAllService: async () => {
        try {
            return await RequestDocumentsTypesDAL.getAllDataByView()
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve a specific record by its ID 
    getServiceById: async (request_document_id) => {
        try {
            return await RequestDocumentsTypesDAL.getDataByIdByView(request_document_id)
        } catch (error) {
            throw error
        }
    }, 
    // Method to mark a record as deleted (soft delete) by its ID
    deleteByid: async (request_document_id, req, res) => {
        try {
            return await RequestDocumentsTypesDAL.deleteDataById(request_document_id, req, res)
        } catch (error) {
            throw error
        }
    },
}

export default RequestDocumentTypesService