import RequestTagDAL from "./request.tag.data.layer.js";

const RequestTagService = {
     // Method to create a new record
     createService: async (data) => {
        try {
            return await RequestTagDAL.CreateData(data)
        } catch (error) {
            throw error
        }
    },
    // Method to update an existing record by its ID 
    updateService: async (request_tag_id, data) => {
        try {
            return await RequestTagDAL.UpdateData(request_tag_id, data)
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve all records
    getAllService: async () => {
        try {
            return await RequestTagDAL.getAllDataByView()
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve a specific record by its ID 
    getServiceById: async (request_tag_id) => {
        try {
            return await RequestTagDAL.getDataByIdByView(request_tag_id)
        } catch (error) {
            throw error
        }
    }, 
    // Method to mark a record as deleted (soft delete) by its ID
    deleteByid: async (request_tag_id, req, res) => {
        try {
            return await RequestTagDAL.deleteDataById(request_tag_id, req, res)
        } catch (error) {
            throw error
        }
    },getAllTagByRequestd:async(request_id)=>{
        try{
            return await RequestTagDAL.getAllByRequestIdByView(request_id)
        }catch(error){
            throw error
        }
    },getAllTagsByMultipleRequestIds:async(request_ids)=>{
        try{
            return await RequestTagDAL.getAllTagsByMultipleRequestIds(request_ids)  
        }catch(error){
            throw error
        }
    },getDataByUserId:async(user_id)=>{
        try{
            return await RequestTagDAL.getAllByUserIdByView(user_id)
        }catch(error){
            throw error
        }
    }
}

export default RequestTagService