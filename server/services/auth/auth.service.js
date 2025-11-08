import UserMasterDAL from "../user_master/user.master.data.layer.js";

const AuthService={
    getDataByUserIdAndPassword: async(user_name,password)=>{
        try{
            return await UserMasterDAL.getDataByUsernameAndPassword(user_name,password)
        }catch(error){
            throw error
        }
    },checkWetherUserIsPresent:async(user_name)=>{
        try{
            return await UserMasterDAL.checkIfUserNameIsPresent(user_name)
        }catch(error){
            throw error
        }
    },checkWetherUserIsPresertByGoogleId:async(google_id)=>{
        try{
            return await UserMasterDAL.checkIfUserNameIsPresentByGoogleId(google_id)
        }catch(error){
            throw error
        }
    },checkWetherEmailIsPresent:async(email_id)=>{
        try{
            return await UserMasterDAL.checkIfEmailIsPresent(email_id)
        }catch(error){
            throw error
        }
    }
}
export default AuthService