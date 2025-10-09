import RequestDAL from "./requests.data.layer.js";

const RequestService = {
    // Method to create a new record
    createService: async (data) => {
        try {
            return await RequestDAL.CreateData(data)
        } catch (error) {
            throw error
        }
    },
    // Method to update an existing record by its ID 
    updateService: async (RequestId, data) => {
        try {
            return await RequestDAL.UpdateData(RequestId, data)
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve all records
    getAllService: async () => {
        try {
            return await RequestDAL.getAllDataByView()
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve a specific record by its ID 
    getServiceById: async (RequestId) => {
        try {
            return await RequestDAL.getDataByIdByView(RequestId)
        } catch (error) {
            throw error
        }
    }, 
    // Method to mark a record as deleted (soft delete) by its ID
    deleteByid: async (RequestId, req, res) => {
        try {
            return await RequestDAL.deleteDataById(RequestId, req, res)
        } catch (error) {
            throw error
        }
    },getAllRequestByUserId:async(user_id,limit,offset)=>{
        try{
            return await RequestDAL.getUserByUserId(user_id,limit,offset)
        }catch(error){
            throw error
        }
    },getRequestsForUserFeed:async(user_id,limit,already_viewed)=>{
        try{
            return await RequestDAL.getRequestsForUserFeed(user_id,limit,already_viewed)
        }catch(error){
            throw error
        }
    },getCountOfTotalRequest:async()=>{
        try{
            return await RequestDAL.getSumOfTotalRequest()
        }catch(error){
            throw error
        }
    },getRecentHundredRequestDesc:async()=>{
        try{
            return await RequestDAL.getRecentHundredRequestDesc()
        }catch(error){
            throw error
        }
    },GetRequestByNgoId:async(ngo_id)=>{
        try{
            return await RequestDAL.getRequestByNgoId(ngo_id)
        }catch(error){
            throw error
        }
    },getSumOfTotalRequestByUserId:async(user_id)=>{
        try{
            return await RequestDAL.getSumOfTotalRequestByUserId(user_id)
        }catch(error){
            throw error
        }
    }
}

export default RequestService