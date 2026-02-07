import RequestDocumentsDAL from "./request.documents.data.layer.js";

const RequestDocumentService = {
    // Method to create a new record
    createService: async (data) => {
        try {
            return await RequestDocumentsDAL.CreateData(data)
        } catch (error) {
            throw error
        }
    },
    // Method to update an existing record by its ID 
    updateService: async (request_document_id, data) => {
        try {
            return await RequestDocumentsDAL.UpdateData(request_document_id, data)
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve all records
    getAllService: async () => {
        try {
            return await RequestDocumentsDAL.getAllDataByView()
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve a specific record by its ID 
    getServiceById: async (request_document_id) => {
        try {
            return await RequestDocumentsDAL.getDataByIdByView(request_document_id)
        } catch (error) {
            throw error
        }
    }, 
    // Method to mark a record as deleted (soft delete) by its ID
    deleteByid: async (request_document_id, req, res) => {
        try {
            return await RequestDocumentsDAL.deleteDataById(request_document_id, req, res)
        } catch (error) {
            throw error
        }
    },getDataByRequestIdByView:async(RequestId)=>{
        try{
            return await RequestDocumentsDAL.getDataByRequestIdByView(RequestId)
        }catch(error){
            throw error
        }
    },getDataByRequestIdAndDocumentTypeListCount:async(RequestId,document_type_id)=>{
        try{
            return await RequestDocumentsDAL.getDataByRequestIdAndDocumentTypeIdListCount(RequestId,document_type_id)
        }catch(error){
            throw error
        }
    },getDataByRequestIdListAndDocumentType:async(RequestId,document_type_id)=>{
        try{
            return await RequestDocumentsDAL.getDataByRequestIdListAndDocumentTypeId(RequestId,document_type_id)
        }catch(error){
            throw error
        }
    }
}

export default RequestDocumentService