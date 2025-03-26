import AuthService from "./auth.service.js";
import commonPath from "../../middleware/comman_path/comman.path.js";
import BonusMasterService from "../bonus_master/bonus.master.service.js";
import { BONUS_MASTER, STATUS_MASTER } from "../../utils/constants/id_constant/id.constants.js";
import UserActivtyService from "../user_activity/user.activity.service.js";
import UserMasterService from "../user_master/user.master.service.js";
import ScoreHistoryService from "../score_history/score.history.service.js";
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
          if(userData?.first_time_login==true){
            const getBonusData = await BonusMasterService.getBonusMasterDataByCategoryStatus(BONUS_MASTER.WELCOME_BONUS_ID,STATUS_MASTER.ACTIVE)
            if(getBonusData.length>0){
              let total_bonus_to_give = getBonusData[0].create_score ?? 0 
              const git_score = {
                user_id:userData.user_id,
                git_score:total_bonus_to_give,
                request_id:null,
                score_category_id:BONUS_MASTER.WELCOME_BONUS_ID,
                description:`GOT BONUS FORFIRST LOGIN`,
                date:currentTime()
              }
              await addMetaDataWhileCreateUpdate(git_score, req, res, false);
              const createGitScore = await ScoreHistoryService.createService(git_score)
              const getPreviousBonus = await UserActivtyService.getDataByUserId(userData.user_id)
              let updateUserActivity = {}
              const totalScore = parseFloat(getPreviousBonus[0].total_scores_no) + parseFloat(total_bonus_to_give)
              updateUserActivity.total_scores_no = totalScore
              await addMetaDataWhileCreateUpdate(updateUserActivity, req, res, true);
              const updateUserActivityData = await UserActivtyService.updateService(getPreviousBonus[0].user_activity_id,updateUserActivity)
              const updateuser = await UserMasterService.updateService(userData.user_id,{first_time_login:false})
            }
          }

        //   if(passwordVerify==true){
            // const getMenuById=await RoleService.getRoleById(userData.dataValues.role_id)
            const token = JWT.sign(
              {
                user_id: userData.user_id  ,
                user_name: userData.user_name 
              },
              process.env.JWT_SECRET,
              { expiresIn: "360d" }
            );
            let jwtResponseData = {};
            jwtResponseData = {
              userDetails : {
                user_id: userData.user_id,
                user_name: userData.user_name,
                full_name:userData.full_name,
                role:userData.role
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