import AuthService from "./auth.service.js";
import commonPath from "../../middleware/comman_path/comman.path.js";
import BonusMasterService from "../bonus_master/bonus.master.service.js";
import { BONUS_MASTER, STATUS_MASTER } from "../../utils/constants/id_constant/id.constants.js";
import UserActivtyService from "../user_activity/user.activity.service.js";
import UserMasterService from "../user_master/user.master.service.js";
import ScoreHistoryService from "../score_history/score.history.service.js";
import CommonEmailtemplate from "../../utils/helper/common.email.templates.js";
import sendEmail from "../../utils/helper/comman.email.function.js";
import RESPONSE_CONSTANTS from "../../utils/constants/response/response.constant.js";
import UserTokenService from "../user_tokens/user.tokens.service.js";
import GroupRolePagePermissionService from "../access_control/group_role_page_permission/group.role.page.permission.service.js";
import MenuService from "../access_control/menu/menu.service.js";
import RoleMasterService from "../access_control/role_master/role.master.service.js";
// import RoleService from "../access_control/role/role.service.js";
const { commonResponse, responseCode, responseConst, logger, tokenData, currentTime, addMetaDataWhileCreateUpdate, JWT } = commonPath

let AuthController = {
  loginUser: async (req, res) => {
    try {
      console.log(req.body)
      const { user_name, password, google_id,web_token,android_token } = req.body;

      let userData;
      // if google id -> fetch by googleid
      if( google_id){
        userData = await AuthService.checkWetherUserIsPresertByGoogleId(google_id.trim())
      } else {
        userData = await AuthService.checkWetherUserIsPresent(user_name.trim())
      }
      // else getbyusername 
      // let userData = await AuthService.checkWetherUserIsPresent(user_name.trim())
      // const hash = await argon2Verify.hashArgon(password);
      // console.log("hash",hash)
      if (userData.length == 0) {
        console.log("inside serData==null")
        logger.error(`User with name or Id ${user_name || google_id} not found`);
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
      if(userData.is_blacklisted == 1 || userData.is_blacklisted==true){
        return res
          .status(responseCode.UNAUTHORIZED)
          .send(
            commonResponse(
              responseCode.UNAUTHORIZED,
              responseConst.USER_HAS_BLOCKED_YOU,
              null,
              true
            )
          );
      }
      
      if(!google_id) {
        if (password.trim() !== userData.password) {
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
      }
      if(web_token){
        const DataToUpdate = {
          web_token:android_token,
          is_web:true,
          role_id:userData.role_id
        }
        await UserTokenService.CreateOrUpdateUserToken(userData.user_id,DataToUpdate)
      }else if(android_token){
         const DataToUpdate = {
          android_token:android_token,
          is_android:true,
          role_id:userData.role_id
        }
        await UserTokenService.CreateOrUpdateUserToken(userData.user_id,DataToUpdate)
      }
      let levelGroupRolePagePermission = []
          if(userData.ngo_level_id && userData.ngo_level_id!==null && userData.ngo_level_id!=="" && userData.ngo_level_id!==0){
           levelGroupRolePagePermission = await GroupRolePagePermissionService.getByRoleIdAndNgoLevelId(userData.role_id,userData.ngo_level_id)
          }
      const getMenuByRoleId = await RoleMasterService.getServiceById(userData.role_id)
      const CommonGroupRolePagePermission = await GroupRolePagePermissionService.getDataByRoleId(userData.role_id)
      if (userData?.first_time_login == true) {
        const getBonusData = await BonusMasterService.getBonusMasterDataByCategoryStatus(BONUS_MASTER.WELCOME_BONUS_ID, STATUS_MASTER.ACTIVE)
        if (getBonusData.length > 0) {
          let total_bonus_to_give = getBonusData[0].create_score ?? 0
          const git_score = {
            user_id: userData.user_id,
            git_score: total_bonus_to_give,
            request_id: null,
            score_category_id: BONUS_MASTER.WELCOME_BONUS_ID,
            description: `GOT BONUS FORFIRST LOGIN`,
            date: currentTime()
          }
          await addMetaDataWhileCreateUpdate(git_score, req, res, false);
          const createGitScore = await ScoreHistoryService.createService(git_score)
          const getPreviousBonus = await UserActivtyService.getDataByUserId(userData.user_id)
          let updateUserActivity = {}
          const totalScore = parseFloat(getPreviousBonus[0].total_scores_no) + parseFloat(total_bonus_to_give)
          updateUserActivity.total_scores_no = totalScore
          await addMetaDataWhileCreateUpdate(updateUserActivity, req, res, true);
          const updateUserActivityData = await UserActivtyService.updateService(getPreviousBonus[0].user_activity_id, updateUserActivity)
          const updateuser = await UserMasterService.updateService(userData.user_id, { first_time_login: false })
        }
      }

      //   if(passwordVerify==true){
      // const getMenuById=await RoleService.getRoleById(userData.dataValues.role_id)
      const token = JWT.sign(
        {
          user_id: userData.user_id,
          user_name: userData.user_name
        },
        process.env.JWT_SECRET,
        { expiresIn: "360d" }
      );
      let jwtResponseData = {};
      jwtResponseData = {
        userDetails: {
          user_id: userData.user_id,
          user_name: userData.user_name,
          full_name: userData.full_name,
          role: userData.role
        },
        token: token,
        permission:{
          normal_permission:CommonGroupRolePagePermission,
          specail_permission:levelGroupRolePagePermission,
        },
        menu:getMenuByRoleId?.menu ?? []
      };
      if (token) {
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

    } catch (error) {
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
  }, 
  // sendResetOtp: async (req, res) => {
  //   try {
  //     const { email } = req.body;
  //     const user = await AuthService.checkWetherEmailIsPresent(email.trim());
  //     if (!user || user.length == 0) {
  //       return res.status(404).send(
  //         commonResponse(
  //           responseCode.NOT_FOUND,
  //           responseConst.USER_NOT_FOUND,
  //           null,
  //           true
  //         )
  //       );
  //     }

  //     const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
  //     const expiry = new Date(Date.now() + 20 * 60000); // 20 minutes from now

  //     await UserMasterService.updateService(user.user_id, {
  //       reset_otp: otp,
  //       reset_otp_expiry: expiry
  //     });

  //     const { subject, html } = await CommonEmailtemplate.PasswordResetMail({
  //       username: user.username || user.fullname || email,
  //       otp: otp,
  //       validity: "20 minutes"
  //     }); 
  //     await sendEmail({to:user.email_id, subject:subject, text:null, html:html, attachments:null});

  //     return res
  //       .status(200)
  //       .send(commonResponse(
  //         responseCode.OK,
  //         responseConst.OTP_GENERATED_SUCCESSFULLY,
  //         null
  //       ));
  //   } catch (error) {
  //     console.log("error", error);
  //     return res.status(responseCode.INTERNAL_SERVER_ERROR).send(
  //       commonResponse(
  //         responseCode.INTERNAL_SERVER_ERROR,
  //         responseConst.INTERNAL_SERVER_ERROR,
  //         null,
  //         true
  //       )
  //     );
  //   }
  // }, 
  // resetPassword: async (req, res) => {
  //   try {
  //     const { email, otp, newPassword } = req.body;
  //     const user = await AuthService.checkWetherEmailIsPresent(email.trim());

  //     if (!user || user.length === 0) {
  //       return res.status(404).send(
  //         commonResponse(
  //           responseCode.NOT_FOUND,
  //           responseConst.USER_NOT_FOUND,
  //           null,
  //           true
  //         )
  //       );
  //     }
  //     if (!user.reset_otp || !user.reset_otp_expiry) {
  //       return res.status(400).send(
  //         commonResponse(
  //           responseCode.BAD_REQUEST,
  //           RESPONSE_CONSTANTS.KINDLY_REGENRATE_OTP,
  //           null,
  //           true
  //         )
  //       );
  //     }

  //     if (user.reset_otp !== otp) {
  //       return res.status(400).send(
  //         commonResponse(
  //           responseCode.BAD_REQUEST,
  //           RESPONSE_CONSTANTS.INVALID_OTP_KINDLY_RECHECK,
  //           null,
  //           true
  //         )
  //       );
  //     }
      
  //     if (new Date() > new Date(user.reset_otp_expiry)) {
  //       await UserMasterService.updateService(user.user_id, {
  //         reset_otp: null,
  //         reset_otp_expiry: null
  //       });
  //       return res.status(400).send(
  //         commonResponse(
  //           responseCode.BAD_REQUEST,
  //           RESPONSE_CONSTANTS.OTP_HAS_EXPIRED,
  //           null,
  //           true
  //         )
  //       );
  //     }
      

  //     await UserMasterService.updateService(user.user_id, {
  //       password: newPassword,
  //       reset_otp: null,
  //       reset_otp_expiry: null
  //     });

  //     const { subject, html } = await CommonEmailtemplate.PasswordHasBeenUpdatedSuccessfully({
  //       username: user.username || user.fullname || email
  //     });


  //     await sendEmail({to:user.email_id,subject:subject,text:null,html:html,attachments:null});

  //     return res
  //       .status(200)
  //       .send(commonResponse(
  //         responseCode.OK,
  //         RESPONSE_CONSTANTS.PASSWORD_UPDATED_SUCCESSFULLY,
  //          null
  //         ));
  //   } catch (error) {
  //     console.log("error", error);
  //     return res.status(responseCode.INTERNAL_SERVER_ERROR).send(
  //       commonResponse(
  //         responseCode.INTERNAL_SERVER_ERROR,
  //         responseConst.INTERNAL_SERVER_ERROR,
  //         null,
  //         true
  //       )
  //     );
  //   }
  // },
  sendResetOtp: async (req, res) => {
    try {
      const { email } = req.body;
      const user = await AuthService.checkWetherEmailIsPresent(email.trim());

      if (!user || user.length === 0) {
        return res.status(404).send(commonResponse(
          responseCode.NOT_FOUND,
          responseConst.USER_NOT_FOUND,
          null,
          true
        ));
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
      const expiry = new Date(Date.now() + 20 * 60000); // 20 minutes validity

      await UserMasterService.updateService(user.user_id, {
        reset_otp: otp,
        reset_otp_expiry: expiry
      });

      const { subject, html } = await CommonEmailtemplate.PasswordResetMail({
        username: user.username || user.fullname || email,
        otp,
        validity: "20 minutes"
      });

      await sendEmail({ to: user.email_id, subject, html });

      return res.status(200).send(commonResponse(
        responseCode.OK,
        responseConst.OTP_GENERATED_SUCCESSFULLY,
        null
      ));

    } catch (error) {
      console.error("sendPassword error:", error);
      return res.status(responseCode.INTERNAL_SERVER_ERROR).send(commonResponse(
        responseCode.INTERNAL_SERVER_ERROR,
        responseConst.INTERNAL_SERVER_ERROR,
        null,
        true
      ));
    }
  },
  validateOtp: async (req, res) => {
    try {
      const { email, otp } = req.body;
      const user = await AuthService.checkWetherEmailIsPresent(email.trim());

      if (!user || user.length === 0) {
        return res.status(404).send(commonResponse(
          responseCode.NOT_FOUND,
          responseConst.USER_NOT_FOUND,
          null,
          true
        ));
      }

      if (!user.reset_otp || !user.reset_otp_expiry) {
        return res.status(400).send(commonResponse(
          responseCode.BAD_REQUEST,
          RESPONSE_CONSTANTS.KINDLY_REGENRATE_OTP,
          null,
          true
        ));
      }

      if (user.reset_otp !== otp) {
        return res.status(400).send(commonResponse(
          responseCode.BAD_REQUEST,
          RESPONSE_CONSTANTS.INVALID_OTP_KINDLY_RECHECK,
          null,
          true
        ));
      }

      if (new Date() > new Date(user.reset_otp_expiry)) {
        await UserMasterService.updateService(user.user_id, {
          reset_otp: null,
          reset_otp_expiry: null
        });
        return res.status(400).send(commonResponse(
          responseCode.BAD_REQUEST,
          RESPONSE_CONSTANTS.OTP_HAS_EXPIRED,
          null,
          true
        ));
      }

      // ✅ OTP is valid
      return res.status(200).send(commonResponse(
        responseCode.OK,
        RESPONSE_CONSTANTS.OTP_VERIFIED_SUCCESSFULLY,
        null
      ));

    } catch (error) {
      console.error("verifyOtp error:", error);
      return res.status(responseCode.INTERNAL_SERVER_ERROR).send(commonResponse(
        responseCode.INTERNAL_SERVER_ERROR,
        responseConst.INTERNAL_SERVER_ERROR,
        null,
        true
      ));
    }
  },
  resetPassword: async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await AuthService.checkWetherEmailIsPresent(email.trim());

    if (!user || user.length === 0) {
      return res.status(404).send(commonResponse(
        responseCode.NOT_FOUND,
        responseConst.USER_NOT_FOUND,
        null,
        true
      ));
    }

    if (user.reset_otp !== otp) {
      return res.status(400).send(commonResponse(
        responseCode.BAD_REQUEST,
        RESPONSE_CONSTANTS.INVALID_OTP_KINDLY_RECHECK,
        null,
        true
      ));
    }

    if (new Date() > new Date(user.reset_otp_expiry)) {
      await UserMasterService.updateService(user.user_id, {
        reset_otp: null,
        reset_otp_expiry: null
      });
      return res.status(400).send(commonResponse(
        responseCode.BAD_REQUEST,
        RESPONSE_CONSTANTS.OTP_HAS_EXPIRED,
        null,
        true
      ));
    }

    await UserMasterService.updateService(user.user_id, {
      password: newPassword, 
      reset_otp: null,
      reset_otp_expiry: null
    });

    const { subject, html } = await CommonEmailtemplate.PasswordHasBeenUpdatedSuccessfully({
      username: user.username || user.fullname || email
    });

    await sendEmail({ to: user.email_id, subject, html });

    return res.status(200).send(commonResponse(
      responseCode.OK,
      RESPONSE_CONSTANTS.PASSWORD_UPDATED_SUCCESSFULLY,
      null
    ));

  } catch (error) {
    console.error("resetPassword error:", error);
    return res.status(responseCode.INTERNAL_SERVER_ERROR).send(commonResponse(
      responseCode.INTERNAL_SERVER_ERROR,
      responseConst.INTERNAL_SERVER_ERROR,
      null,
      true
    ));
  }
  },
  // googleAuthCallback: async (req, res) => {
  //   try {
  //     const user = req.user;

  //     let userData = await AuthService.checkWetherUserIsPresent(user.user_name.trim())

  //     if (userData.length == 0) {
  //       console.log("inside serData==null")
  //       logger.error(`User with name ${user.user_name} not found`);
  //       return res
  //         .status(responseCode.UNAUTHORIZED)
  //         .send(
  //           commonResponse(
  //             responseCode.UNAUTHORIZED,
  //             responseConst.INVALID_USERNAME,
  //             null,
  //             true
  //           )
  //         );
  //     }

  //     if (userData?.first_time_login == true) {
  //       const getBonusData = await BonusMasterService.getBonusMasterDataByCategoryStatus(BONUS_MASTER.WELCOME_BONUS_ID, STATUS_MASTER.ACTIVE)
  //       if (getBonusData.length > 0) {
  //         let total_bonus_to_give = getBonusData[0].create_score ?? 0
  //         const git_score = {
  //           user_id: userData.user_id,
  //           git_score: total_bonus_to_give,
  //           request_id: null,
  //           score_category_id: BONUS_MASTER.WELCOME_BONUS_ID,
  //           description: `GOT BONUS FORFIRST LOGIN`,
  //           date: currentTime()
  //         }
  //         await addMetaDataWhileCreateUpdate(git_score, req, res, false);
  //         const createGitScore = await ScoreHistoryService.createService(git_score)
  //         const getPreviousBonus = await UserActivtyService.getDataByUserId(userData.user_id)
  //         let updateUserActivity = {}
  //         const totalScore = parseFloat(getPreviousBonus[0].total_scores_no) + parseFloat(total_bonus_to_give)
  //         updateUserActivity.total_scores_no = totalScore
  //         await addMetaDataWhileCreateUpdate(updateUserActivity, req, res, true);
  //         const updateUserActivityData = await UserActivtyService.updateService(getPreviousBonus[0].user_activity_id, updateUserActivity)
  //         const updateuser = await UserMasterService.updateService(userData.user_id, { first_time_login: false })
  //       }
  //     }

  //     const token = JWT.sign(
  //       {
  //         user_id: user.user_id,
  //         user_name: user.user_name
  //       },
  //       process.env.JWT_SECRET,
  //       { expiresIn: "360d" }
  //     );

  //     let jwtResponseData = {
  //       userDetails: {
  //         user_id: user.user_id,
  //         user_name: user.user_name,
  //         full_name: user.full_name,
  //         role: user.role
  //       },
  //       token: token,
  //     };

  //     return res.status(responseCode.OK).send(
  //       commonResponse(
  //         responseCode.OK,
  //         responseConst.LOGGED_IN_SUCCESFULLY,
  //         jwtResponseData
  //       )
  //     );
  //   } catch (error) {
  //     console.error("Google Auth Callback Error:", error);
  //     return res.status(responseCode.INTERNAL_SERVER_ERROR).send(
  //       commonResponse(
  //         responseCode.INTERNAL_SERVER_ERROR,
  //         responseConst.INTERNAL_SERVER_ERROR,
  //         null,
  //         true
  //       )
  //     );
  //   }
  // }
}

export default AuthController