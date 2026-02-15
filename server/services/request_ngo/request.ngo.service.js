import RequestNgoDAL from "./request.ngo.data.layer.js";

const RequestNgoService = {
     // Method to create a new record
     createService: async (data) => {
        try {
            return await RequestNgoDAL.CreateData(data)
        } catch (error) {
            throw error
        }
    },
    // Method to update an existing record by its ID 
    updateService: async (Request_Ngo_Id, data) => {
        try {
            return await RequestNgoDAL.UpdateData(Request_Ngo_Id, data)
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve all records
    getAllService: async () => {
        try {
            return await RequestNgoDAL.getAllDataByView()
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve a specific record by its ID 
    getServiceById: async (Request_Ngo_Id) => {
        try {
            return await RequestNgoDAL.getDataByIdByView(Request_Ngo_Id)
        } catch (error) {
            throw error
        }
    }, 
    // Method to mark a record as deleted (soft delete) by its ID
    deleteByid: async (Request_Ngo_Id, req, res) => {
        try {
            return await RequestNgoDAL.deleteDataById(Request_Ngo_Id, req, res)
        } catch (error) {
            throw error
        }
    },getRequestAndNGoData:async(NgoId,RequestId)=>{
        try{
           return await RequestNgoDAL.getDataByRequestIdAndNgoId(RequestId,NgoId)
        }catch(error){
            throw error
        }
    },getAllDataByNgoId:async(ngo_id)=>{
        try{
            return await RequestNgoDAL.getDataByNgoId(ngo_id)
        }catch(error){
            throw error
        }
    },getAllNgoByRequestIdOnly:async(RequestId)=>{
        try{
            return await RequestNgoDAL.getAllNgoByRequestIdOnly(RequestId)
        }catch(error){
            throw error
        }
    },getAllByFilterByNgoId:async(ngo_id, offset , limit , status_id )=>{
        try{
            return await RequestNgoDAL.getNgoDataByFilterAndNgoId(ngo_id, offset , limit , status_id)
        }catch(error){
            throw error
        }
    },getRequestNgoCountByNgo:async(ngo_id)=>{
        try{
            return await RequestNgoDAL.getRequestNgoCountById(ngo_id)
        }catch(error){
            throw error
        }
    },UpdateRequestCountByNgoDataCount:async(ngo_id,fieldName, amount)=>{
        try{
            return await RequestNgoDAL.UpdateRequestCountByNgoDataCount(ngo_id,fieldName, amount)
        }catch(error){
            throw error
        }
    },UpdateRequestCountByRequestListDataCount:async(RequestId,fieldName, amount)=>{
        try{
            return await RequestNgoDAL.UpdateRequestCountByRequestListDataCount(RequestId,fieldName, amount)
        }catch(error){
            throw error
        }
    },UpdateRequestCountByRequestNgoId:async(Request_Ngo_Id, fieldName, amount)=>{
        try{
            return await RequestNgoDAL.UpdateRequestCountByRequestNgoId(Request_Ngo_Id, fieldName, amount)
        }catch(error){
            throw error
        }
    }
}
export default RequestNgoService