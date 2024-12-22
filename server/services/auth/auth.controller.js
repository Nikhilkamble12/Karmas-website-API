import AuthService from "./auth.service.js";
import commonPath from "../../middleware/comman_path/comman.path.js";
// import RoleService from "../access_control/role/role.service.js";
const {commonResponse,responseCode,responseConst,logger,tokenData,currentTime,addMetaDataWhileCreateUpdate,JWT} = commonPath

 let AuthController={
    loginUser:async(req,res)=>{
        try{
          console.log( req.body)
          const { user_name, password } = req.body;
          
          let userData=await AuthService.checkWetherUserIsPresent(user_name.trim())
          // const hash = await argon2Verify.hashArgon(password);
          // console.log("hash",hash)
            console.log("userData",userData)
          if(userData.length == 0 ){
            console.log("inside serData==null")
            logger.error(`User with name ${user_name} not found`);
            return res
              .status(responseCode.UNAUTHORIZED)
              .send(
                commonResponse(
                  responseCode.UNAUTHORIZED,
                  responseConst.INVALID_USERNAME,
                  null,
                  true
                )
              );
          }
          if(password.trim()!==userData.password){
            logger.error(`Password For UserName ${user_name} not Matched} `);
            return res
            .status(responseCode.UNAUTHORIZED)
            .send(
              commonResponse(
                responseCode.UNAUTHORIZED,
                responseConst.INVALID_PASSWORD,
                null,
                true
              )
            );
          }

        //   if(passwordVerify==true){
            // const getMenuById=await RoleService.getRoleById(userData.dataValues.role_id)
            const token = JWT.sign(
              {
                user_id: userData.user_id  ,
                user_name: userData.user_name 
              },
              process.env.JWT_SECRET,
              { expiresIn: "24h" }
            );
            let jwtResponseData = {};
            jwtResponseData = {
              userDetails : {
                user_id: userData.user_id,
                user_name: userData.user_name,
              },
              token: token,
            };
          if(token){
            return res
              .status(responseCode.OK)
              .send(
                commonResponse(
                  responseCode.OK,
                  responseConst.LOGGED_IN_SUCCESFULLY,
                  jwtResponseData
                )
              );
          } else {
            return res
              .status(responseCode.UNAUTHORIZED)
              .send(
                commonResponse(
                  responseCode.UNAUTHORIZED,
                  responseConst.INVALID_PASSWORD,
                  null,
                  true
                )
              );
          }
        //   }else{
        //     logger.error(`Password For UserName ${user_name} not Matched} `);
        //     return res
        //     .status(responseCode.UNAUTHORIZED)
        //     .send(
        //       commonResponse(
        //         responseCode.UNAUTHORIZED,
        //         responseConst.INVALID_PASSWORD,
        //         null,
        //         true
        //       )
        //     );
        //   }
    
        }catch(error){
          logger.error(`Error ---> ${error}`);
          console.log(error);
          return res
            .status(responseCode.INTERNAL_SERVER_ERROR)
            .send(
              commonResponse(
                responseCode.INTERNAL_SERVER_ERROR,
                responseConst.INTERNAL_SERVER_ERROR,
                null,
                true
              )
            );
        }
      }
}

export default AuthController