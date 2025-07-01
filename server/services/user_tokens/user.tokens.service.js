import UserTokenDAL from "./user.tokens.data.layer.js";

const UserTokenService = {
    // Method to create a new record
    createService: async (data) => {
        try {
            return await UserTokenDAL.CreateData(data)
        } catch (error) {
            throw error
        }
    },
    // Method to update an existing record by its ID 
    updateService: async (user_token_id, data) => {
        try {
            return await UserTokenDAL.UpdateData(user_token_id, data)
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve all records
    getAllService: async () => {
        try {
            return await UserTokenDAL.getAllDataByView()
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve a specific record by its ID 
    getServiceById: async (user_token_id) => {
        try {
            return await UserTokenDAL.getDataByIdByView(user_token_id)
        } catch (error) {
            throw error
        }
    }, 
    // Method to mark a record as deleted (soft delete) by its ID
    deleteByid: async (user_token_id, req, res) => {
        try {
            return await UserTokenDAL.deleteDataById(user_token_id, req, res)
        } catch (error) {
            throw error
        }
    },CreateOrUpdateUserToken:async(userId, tokenData)=>{
        try{
            return await UserTokenDAL.CreateOrUpdateUserToken(userId, tokenData)
        }catch(error){
            throw error
        }
    },GetAllActiveTokens:async()=>{
        try{
            return await UserTokenDAL.GetAllActiveTokens()
        }catch(error){
            throw error
        }
    },GetTokensByUserIds:async(user_id)=>{
        try{
            return await UserTokenDAL.GetTokensByUserIds(user_id)
        }catch(error){
            throw error
        }
    }
}

export default UserTokenService