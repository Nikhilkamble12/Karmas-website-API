import UserMasterDAL from "../user_master/user.master.data.layer.js";

const AuthService={
    getDataByUserIdAndPassword: async(user_name,password)=>{
        try{
            return await UserMasterDAL.getDataByUsernameAndPassword(user_name,password)
        }catch(error){
            throw error
        }
    },checkWetherUserIsPresent:async(user_name)=>{
        console.log("user_name",user_name)
        try{
            return await UserMasterDAL.checkIfUserNameIsPresent(user_name)
        }catch(error){
            throw error
        }
    }
}
export default AuthService