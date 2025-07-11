import NgoLikesDAL from "./ngo.likes.data.layer.js";

const NgolikesService = {
    // Method to create a new record
    createService: async (data) => {
        try {
            return await NgoLikesDAL.CreateData(data)
        } catch (error) {
            throw error
        }
    },
    // Method to update an existing record by its ID 
    updateService: async (like_id, data) => {
        try {
            return await NgoLikesDAL.UpdateData(like_id, data)
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve all records
    getAllService: async () => {
        try {
            return await NgoLikesDAL.getAllDataByView()
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve a specific record by its ID 
    getServiceById: async (like_id) => {
        try {
            return await NgoLikesDAL.getDataByIdByView(like_id)
        } catch (error) {
            throw error
        }
    }, 
    // Method to mark a record as deleted (soft delete) by its ID
    deleteByid: async (like_id, req, res) => {
        try {
            return await NgoLikesDAL.deleteDataById(like_id, req, res)
        } catch (error) {
            throw error
        }
    },getDataByUserId:async(user_id,ngo_id)=>{
        try{
            return await NgoLikesDAL
        }catch(error){
            throw error
        }
    }
}

export default NgolikesService