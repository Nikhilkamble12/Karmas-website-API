import AuthService from "./auth.service.js";
import commonPath from "../../middleware/comman_path/comman.path.js";
import BonusMasterService from "../bonus_master/bonus.master.service.js";
import {
  BONUS_MASTER,
  OTP_TYPE_MASTER,
  STATUS_MASTER,
} from "../../utils/constants/id_constant/id.constants.js";
import UserActivtyService from "../user_activity/user.activity.service.js";
import UserMasterService from "../user_master/user.master.service.js";
import ScoreHistoryService from "../score_history/score.history.service.js";
import CommonEmailtemplate from "../../utils/helper/common.email.templates.js";
import sendEmail from "../../utils/helper/comman.email.function.js";
import UserTokenService from "../user_tokens/user.tokens.service.js";
import GroupRolePagePermissionService from "../access_control/group_role_page_permission/group.role.page.permission.service.js";
import MenuService from "../access_control/menu/menu.service.js";
import RoleMasterService from "../access_control/role_master/role.master.service.js";
import UserOtpLogsService from "../user_otp_log/user.otp.log.service.js";
// import RoleService from "../access_control/role/role.service.js";
const {
  commonResponse,
  responseCode,
  responseConst,
  logger,
  tokenData,
  currentTime,
  addMetaDataWhileCreateUpdate,
  JWT,
} = commonPath;
const JWT_VERIFY_OPTIONS = {
  algorithm: "HS256", // ✅ Use only one algorithm for better performance
  expiresIn: "360d",
};


// ============================================================================
// OPTIMIZATION 1: User Validation Helper (DRY principle)
// ============================================================================
const validateUser = (userData, user_name, google_id, isGoogleAuth = false) => {
  if (!userData || userData.length === 0) {
    logger.error(`User ${user_name || google_id} not found`);
    return {
      valid: false,
      code: responseCode.UNAUTHORIZED,
      message: responseConst.INVALID_CREDENTIAL,
    };
  }

  if (!isGoogleAuth && !userData.is_authenticated) {
    logger.error(`User ${user_name || google_id} not authenticated`);
    return {
      valid: false,
      code: responseCode.UNAUTHORIZED,
      message: responseConst.VERIFICATION_REMAINING,
    };
  }

  if (userData.is_blacklisted) {
    return {
      valid: false,
      code: responseCode.UNAUTHORIZED,
      message: responseConst.USER_HAS_BLOCKED_YOU,
    };
  }

  return { valid: true };
};

// ============================================================================
// OPTIMIZATION 2: Send Email Without Blocking (Fire-and-Forget)
// ============================================================================
const sendEmailAsync = (emailData) => {
  sendEmail(emailData).catch((err) => 
    logger.error("Email sending failed:", err)
  );
};

let AuthController = {
  loginUser: async (req, res) => {
    try {
      // ✅ OPTIMIZATION 3: Clean inputs once at start
      const { 
        user_name, 
        password, 
        google_id, 
        web_token, 
        android_token 
      } = req.body;

      const cleanIdentifier = user_name?.trim();
      const cleanGoogleId = google_id?.trim();
      const cleanPassword = password?.trim();

      // ✅ OPTIMIZATION 4: Fetch user data
      const userData = cleanGoogleId
        ? await AuthService.checkWetherUserIsPresertByGoogleId(cleanGoogleId)
        : await AuthService.checkWetherUserOrEmailIsPresent(cleanIdentifier);

      if (cleanGoogleId && (!userData || userData.length === 0 || !userData.user_id)) {
        logger.error(`Google account not registered: ${cleanGoogleId}`);
        return res
          .status(responseCode.NOT_FOUND)
          .send(
            commonResponse(
              responseCode.NOT_FOUND,
              "Google account not registered. Please sign up first.",
              null,
              true
            )
          );
      }
      console.log("userData",userData)
      // ✅ OPTIMIZATION 5: Validate user (single function)
      const validation = validateUser(userData, cleanIdentifier, cleanGoogleId, !!cleanGoogleId);
      if (!validation.valid) {
        return res
          .status(validation.code)
          .send(commonResponse(validation.code, validation.message, null, true));
      }

      // ✅ OPTIMIZATION 6: Password check (only if not Google login)
      if (!cleanGoogleId && cleanPassword !== userData.password) {
        logger.error(`Password mismatch for ${cleanIdentifier}`);
        return res
          .status(responseCode.UNAUTHORIZED)
          .send(
            commonResponse(
              responseCode.UNAUTHORIZED,
              responseConst.INVALID_CREDENTIAL,
              null,
              true
            )
          );
      }

      // ✅ OPTIMIZATION 7: Prepare token update data
      const tokenUpdateData = { role_id: userData.role_id };
      if (web_token) {
        tokenUpdateData.web_token = web_token;
        tokenUpdateData.is_web = true;
      } else if (android_token) {
        tokenUpdateData.android_token = android_token;
        tokenUpdateData.is_android = true;
      }

      // ✅ OPTIMIZATION 8: PARALLEL DATABASE QUERIES (Biggest Win!)
      const hasNgoLevel = userData.ngo_level_id && 
                          userData.ngo_level_id !== null && 
                          userData.ngo_level_id !== 0;

      const [
        _, // Token update result (we don't need it)
        levelGroupRolePagePermission,
        getMenuByRoleId,
        CommonGroupRolePagePermission,
        getBonusData
      ] = await Promise.all([
        UserTokenService.CreateOrUpdateUserToken(userData.user_id, tokenUpdateData),
        
        // Only fetch level permissions if needed
        hasNgoLevel
          ? GroupRolePagePermissionService.getByRoleIdAndNgoLevelId(
              userData.role_id,
              userData.ngo_level_id
            )
          : Promise.resolve([]),
        
        RoleMasterService.getServiceById(userData.role_id),
        
        GroupRolePagePermissionService.getDataByRoleId(userData.role_id),
        
        // Only fetch bonus if first time login
        userData?.first_time_login
          ? BonusMasterService.getBonusMasterDataByCategoryStatus(
              BONUS_MASTER.WELCOME_BONUS_ID,
              STATUS_MASTER.ACTIVE
            )
          : Promise.resolve([])
      ]);

      // ✅ OPTIMIZATION 9: First time login bonus (if needed)
      if (userData?.first_time_login && getBonusData.length > 0) {
        const total_bonus_to_give = getBonusData[0].create_score ?? 0;
        
        // Fetch previous bonus data
        const getPreviousBonus = await UserActivtyService.getDataByUserId(
          userData.user_id
        );
        
        const totalScore = 
          parseFloat(getPreviousBonus[0].total_scores_no) + 
          parseFloat(total_bonus_to_give);

        // ✅ OPTIMIZATION 10: Prepare all update data at once
        const git_score = {
          user_id: userData.user_id,
          git_score: total_bonus_to_give,
          request_id: null,
          score_category_id: BONUS_MASTER.WELCOME_BONUS_ID,
          description: `GOT BONUS FOR FIRST LOGIN`,
          date: currentTime(),
        };
        await addMetaDataWhileCreateUpdate(git_score, req, res, false);

        const updateUserActivity = {
          total_scores_no: totalScore,
        };
        await addMetaDataWhileCreateUpdate(updateUserActivity, req, res, true);

        // ✅ OPTIMIZATION 11: Execute updates in parallel
        await Promise.all([
          ScoreHistoryService.createService(git_score),
          UserActivtyService.updateService(
            getPreviousBonus[0].user_activity_id,
            updateUserActivity
          ),
          UserMasterService.updateService(userData.user_id, {
            first_time_login: false,
            total_score: totalScore,
          }),
        ]);
      }

      // ✅ OPTIMIZATION 12: Generate token (only after all logic succeeds)
      const token = JWT.sign(
        {
          user_id: userData.user_id,
          user_name: userData.user_name,
        },
        process.env.JWT_SECRET,
        JWT_VERIFY_OPTIONS
      );

      // ✅ OPTIMIZATION 13: Build response object efficiently
      const jwtResponseData = {
        userDetails: {
          user_id: userData.user_id,
          user_name: userData.user_name,
          full_name: userData.full_name,
          role: userData.role,
          ngo_id: userData?.ngo_id ?? null,
          first_time_login: userData.first_time_login,
        },
        token,
        permission: {
          normal_permission: CommonGroupRolePagePermission,
          specail_permission: levelGroupRolePagePermission,
        },
        menu: getMenuByRoleId?.menu ?? [],
      };

      return res
        .status(responseCode.OK)
        .send(
          commonResponse(
            responseCode.OK,
            responseConst.LOGGED_IN_SUCCESFULLY,
            jwtResponseData
          )
        );
    } catch (error) {
      logger.error(`loginUser error:`, error);
      console.error(error);
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
  //           responseConst.KINDLY_REGENRATE_OTP,
  //           null,
  //           true
  //         )
  //       );
  //     }

  //     if (user.reset_otp !== otp) {
  //       return res.status(400).send(
  //         commonResponse(
  //           responseCode.BAD_REQUEST,
  //           responseConst.INVALID_OTP_KINDLY_RECHECK,
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
  //           responseConst.OTP_HAS_EXPIRED,
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
  //         responseConst.PASSWORD_UPDATED_SUCCESSFULLY,
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
        return res
          .status(404)
          .send(
            commonResponse(
              responseCode.NOT_FOUND,
              responseConst.USER_NOT_FOUND,
              null,
              true
            )
          );
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
      const expiry = new Date(Date.now() + 20 * 60000); // 20 minutes validity
      const otpdataToCreate = {
        user_id: user.user_id,
        otp_code: otp,
        otp_type_id: OTP_TYPE_MASTER.RESET_PASSWORD,
        expiry_at: expiry,
        is_used: false,
        used_at: null,
      };
      await addMetaDataWhileCreateUpdate(otpdataToCreate, req, res, false);
      await UserOtpLogsService.createService(otpdataToCreate);

      const { subject, html } = await CommonEmailtemplate.PasswordResetMail({
        username: user.username || user.fullname || email,
        otp,
        email:email,
        validity: "20 minutes",
      });

      await sendEmail({ to: user.email_id, subject, html });

      return res
        .status(200)
        .send(
          commonResponse(
            responseCode.OK,
            responseConst.OTP_GENERATED_SUCCESSFULLY,
            null
          )
        );
    } catch (error) {
      console.error("sendPassword error:", error);
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
  validateOtp: async (req, res) => {
    try {
      const { email, otp } = req.body;
      const user = await AuthService.checkWetherEmailIsPresent(email.trim());

      if (!user || user.length === 0) {
        return res
          .status(404)
          .send(
            commonResponse(
              responseCode.NOT_FOUND,
              responseConst.USER_NOT_FOUND,
              null,
              true
            )
          );
      }
      const getUserOtpLogs =
        await UserOtpLogsService.matchOtpByUserIdTypeAndCode(
          user.user_id,
          OTP_TYPE_MASTER.RESET_PASSWORD,
          otp
        );
      if (
        getUserOtpLogs == null ||
        !getUserOtpLogs.otp_code ||
        !getUserOtpLogs.expiry_at
      ) {
        return res
          .status(400)
          .send(
            commonResponse(
              responseCode.BAD_REQUEST,
              responseConst.KINDLY_REGENRATE_OTP,
              null,
              true
            )
          );
      }

      if (getUserOtpLogs.otp_code !== otp) {
        return res
          .status(400)
          .send(
            commonResponse(
              responseCode.BAD_REQUEST,
              responseConst.INVALID_OTP_KINDLY_RECHECK,
              null,
              true
            )
          );
      }

      // ✅ OTP is valid
      return res
        .status(200)
        .send(
          commonResponse(
            responseCode.OK,
            responseConst.OTP_VERIFIED_SUCCESSFULLY,
            null
          )
        );
    } catch (error) {
      console.error("verifyOtp error:", error);
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
  resetPassword: async (req, res) => {
    try {
      const { email, otp, newPassword } = req.body;
      const user = await AuthService.checkWetherEmailIsPresent(email.trim());

      if (!user || user.length === 0) {
        return res
          .status(404)
          .send(
            commonResponse(
              responseCode.NOT_FOUND,
              responseConst.USER_NOT_FOUND,
              null,
              true
            )
          );
      }
      const getResetOtp = await UserOtpLogsService.matchOtpByUserIdTypeAndCode(
        user.user_id,
        OTP_TYPE_MASTER.RESET_PASSWORD,
        otp
      );
      console.log("getResetOtp",getResetOtp)
      if (getResetOtp == null) {
        return res
          .status(400)
          .send(
            commonResponse(
              responseCode.BAD_REQUEST,
              responseConst.KINDLY_REGENRATE_OTP,
              null,
              true
            )
          );
      }
      if (getResetOtp.otp_code !== otp) {
        return res
          .status(400)
          .send(
            commonResponse(
              responseCode.BAD_REQUEST,
              responseConst.INVALID_OTP_KINDLY_RECHECK,
              null,
              true
            )
          );
      }

      await UserMasterService.updateService(user.user_id, {
        password: newPassword,
      });
      await UserOtpLogsService.updateService(getResetOtp.otp_id, {
        is_used: 1,
        used_at: new Date(Date.now()),
      });

      const { subject, html } =
        await CommonEmailtemplate.PasswordHasBeenUpdatedSuccessfully({
          username: user.username || user.fullname || email,
        });

      await sendEmail({ to: user.email_id, subject, html });

      return res
        .status(200)
        .send(
          commonResponse(
            responseCode.OK,
            responseConst.PASSWORD_UPDATED_SUCCESSFULLY,
            null
          )
        );
    } catch (error) {
      console.error("resetPassword error:", error);
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
};

export default AuthController;
