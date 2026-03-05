import NgoRequestDocumentCategoryDAL from "./ngo.request.document.category.data.layer.js";


const NgoRequestDocumentCategoryService = {
    createService: async (data) => {
        try {
            return await NgoRequestDocumentCategoryDAL.CreateData(data)
        } catch (error) {
            throw error
        }
    },
    // Method to update an existing record by its ID 
    updateService: async (categrory_document_id, data) => {
        try {
            return await NgoRequestDocumentCategoryDAL.UpdateData(categrory_document_id, data)
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve all records
    getAllService: async () => {
        try {
            return await NgoRequestDocumentCategoryDAL.getAllDataByView()
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve a specific record by its ID 
    getServiceById: async (categrory_document_id) => {
        try {
            return await NgoRequestDocumentCategoryDAL.getDataByIdByView(categrory_document_id)
        } catch (error) {
            throw error
        }
    }, 
    // Method to mark a record as deleted (soft delete) by its ID
    deleteByid: async (categrory_document_id, req, res) => {
        try {
            return await NgoRequestDocumentCategoryDAL.deleteDataById(categrory_document_id, req, res)
        } catch (error) {
            throw error
        }
    },checkWetherAlreadyCreatedAndDocumentType:async(ngo_id,category_id,document_type_id)=>{
        try{
            return await NgoRequestDocumentCategoryDAL.checkWetherAlreadyCreatedByDocument(ngo_id, category_id,document_type_id)
        }catch(error){
            throw error
        }
    },getDataByNgoId:async(ngo_id)=>{
        try{
            return await NgoRequestDocumentCategoryDAL.getDataByNgoId(ngo_id)
        }catch(error){
            throw error
        }
    },getDataByNgoIdAndCategory:async(ngo_id,category_id)=>{
        try{
            return await NgoRequestDocumentCategoryDAL.getByNgoIdAndCategoryId(ngo_id,category_id)
        }catch(error){
            throw error
        }
    },getDataByNgoIdAndCategoryCount:async(ngo_id,category_id)=>{
        try{
            return await NgoRequestDocumentCategoryDAL.getByNgoIdAndCategoryIdCount(ngo_id,category_id)
        }catch(error){
            throw error
        }
    },getByNgoIdUsingInAndCategoryId:async(ngo_id, category_id)=>{
        try{
            return await NgoRequestDocumentCategoryDAL.getByNgoIdUsingInAndCategoryId(ngo_id, category_id)
        }catch(error){
            throw error
        }
    }
}
export default NgoRequestDocumentCategoryService