import UserMasterDAL from "./user.master.data.layer.js";

const UserMasterService = {
     // Method to create a new record
     createService: async (data) => {
        try {
            return await UserMasterDAL.CreateData(data)
        } catch (error) {
            throw error
        }
    },
    // Method to update an existing record by its ID 
    updateService: async (user_id, data) => {
        try {
            return await UserMasterDAL.UpdateData(user_id, data)
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve all records
    getAllService: async () => {
        try {
            return await UserMasterDAL.getAllDataByView()
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve a specific record by its ID 
    getServiceById: async (user_id) => {
        try {
            return await UserMasterDAL.getDataByIdByView(user_id)
        } catch (error) {
            throw error
        }
    }, 
    // Method to mark a record as deleted (soft delete) by its ID
    deleteByid: async (user_id, req, res) => {
        try {
            return await UserMasterDAL.deleteDataById(user_id, req, res)
        } catch (error) {
            throw error
        }
    },getUserDataByUserName:async(user_name)=>{
        try{
            return await UserMasterDAL.checkIfUserNameIsPresent(user_name)
        }catch(error){
            throw error
        }
    },findUserByFulNameAndUseName:async(user_name,limit,offset)=>{
        try{
            return await UserMasterDAL.checkWetherUserIsPresent(user_name,limit,offset)
        }catch(error){
            throw error
        }
    },getUserByNgoId:async(ngo_id)=>{
        try{
            return await UserMasterDAL.getUserByNgoIdByView(ngo_id)
        }catch(error){
            throw error
        }
    },BlockAllUserAccoringToNgo:async(ngo_id,data)=>{
        try{
            return await UserMasterDAL.BlockUserByNgoId(ngo_id,data)
        }catch(error){
            throw error
        }
    },getAllBlocakedUsed:async()=>{
        try{
            return await UserMasterDAL.getAllBlocakedUsed()
        }catch(error){
            throw error
        }
    }
}
export default UserMasterService