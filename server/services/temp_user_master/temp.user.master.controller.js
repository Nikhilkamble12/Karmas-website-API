import TempUserMasterService from "./temp.user.master.service.js";
import commonPath from "../../middleware/comman_path/comman.path.js";
import UserMasterService from "../user_master/user.master.service.js";
import CommonEmailtemplate from "../../utils/helper/common.email.templates.js";
import sendEmail from "../../utils/helper/comman.email.function.js";

const {
  commonResponse,
  responseCode,
  responseConst,
  logger,
  addMetaDataWhileCreateUpdate,
  tokenData,currentTime
} = commonPath;

const TempUserMasterController = {
  // Create a new temp user
  create: async (req, res) => {
    try {
      const data = req.body;

      const existingUser = await UserMasterService.checkIfEmailOrUsernameExists(
        data.email_id,
        data.user_name
      );

      if (existingUser) {
        if (existingUser.email_id === data.email_id) {
          return res
            .status(responseCode.BAD_REQUEST)
            .send(
              commonResponse(
                responseCode.BAD_REQUEST,
                responseConst.EMAIL_ALREADY_IN_USE,
                null,
                true
              )
            );
        }

        if (existingUser.user_name === data.user_name) {
          return res
            .status(responseCode.BAD_REQUEST)
            .send(
              commonResponse(
                responseCode.BAD_REQUEST,
                responseConst.USERNAME_ALREADY_IN_USE,
                null,
                true
              )
            );
        }
      }
      const accessToken = req.get("x-access-token");
      if (accessToken && accessToken !== "null" && accessToken !== "") {
        const tokenUser = await tokenData(req, res);
        data.created_by = tokenUser;
        data.created_at = currentTime();
      } else {
        data.created_by = 1;
        data.created_at = currentTime();
      }
      // --- OTP AND EMAIL LOGIC START ---

      // 1. Generate 6 Digit Random Number
      const otp = Math.floor(100000 + Math.random() * 900000);

      // 2. Generate Email Template
      const emailContent =
        await CommonEmailtemplate.EmailVerificationRequestSent({
          email_id: data.email_id,
          otp: otp,
          username: data.full_name || "User", // Assuming 'full_name' exists, else default
          validity: "20 min",
        });
    
      // 3. Send Email (You need to implement the actual sending helper)
      await sendEmail({
        to: data.email_id,
        subject: emailContent.subject,
        text: null,
        html: emailContent.html,
      });
      // logger.info(`Email sent to ${getDataById.email_id}`);

      // 4. Calculate Expiry (Current Time + 20 Minutes)
      const expiryTime = new Date();
      expiryTime.setMinutes(expiryTime.getMinutes() + 20);
      data.otp = otp;
      data.otp_expiry_time = expiryTime;
      const createData = await TempUserMasterService.createService(data);

      if (createData) {
        return res
          .status(responseCode.CREATED)
          .send(
            commonResponse(
              responseCode.CREATED,
              responseConst.SUCCESS_ADDING_RECORD
            )
          );
      }

      return res
        .status(responseCode.BAD_REQUEST)
        .send(
          commonResponse(
            responseCode.BAD_REQUEST,
            responseConst.ERROR_ADDING_RECORD,
            null,
            true
          )
        );
    } catch (error) {
      logger.error(`Error ---> ${error}`);
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

  // Update temp user
  update: async (req, res) => {
    try {
      const user_id = req.query.id;
      const data = req.body;
      const getOlderData = await TempUserMasterService.getServiceById(user_id);
      const oldData = await TempUserMasterService.getServiceById(user_id);

      if (!oldData) {
        return res
          .status(responseCode.BAD_REQUEST)
          .send(
            commonResponse(
              responseCode.BAD_REQUEST,
              responseConst.DATA_NOT_FOUND,
              null,
              true
            )
          );
      }

      const emailChanged = data.email_id && data.email_id !== oldData.email_id;

      const usernameChanged =
        data.user_name && data.user_name !== oldData.user_name;

      // Only check uniqueness if something changed
      if (emailChanged || usernameChanged) {
        const existingUser =
          await UserMasterService.checkIfEmailOrUsernameExists(
            data.email_id ?? oldData.email_id,
            data.user_name ?? oldData.user_name
          );

        if (existingUser) {
          if (emailChanged && existingUser.email_id === data.email_id) {
            return res
              .status(responseCode.BAD_REQUEST)
              .send(
                commonResponse(
                  responseCode.BAD_REQUEST,
                  responseConst.EMAIL_ALREADY_IN_USE,
                  null,
                  true
                )
              );
          }

          if (usernameChanged && existingUser.user_name === data.user_name) {
            return res
              .status(responseCode.BAD_REQUEST)
              .send(
                commonResponse(
                  responseCode.BAD_REQUEST,
                  responseConst.USERNAME_ALREADY_IN_USE,
                  null,
                  true
                )
              );
          }
        }
      }

      // Add modified_by / modified_at
      await addMetaDataWhileCreateUpdate(data, req, res, true);

      const updatedRowsCount = await TempUserMasterService.updateService(
        user_id,
        data
      );

      if (updatedRowsCount === 0) {
        return res
          .status(responseCode.BAD_REQUEST)
          .send(
            commonResponse(
              responseCode.BAD_REQUEST,
              responseConst.ERROR_UPDATING_RECORD,
              null,
              true
            )
          );
      }

      return res
        .status(responseCode.CREATED)
        .send(
          commonResponse(
            responseCode.CREATED,
            responseConst.SUCCESS_UPDATING_RECORD
          )
        );
    } catch (error) {
      logger.error(`Error ---> ${error}`);
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

  // Get all temp users (VIEW)
  getAllByView: async (req, res) => {
    try {
      const getAll = await TempUserMasterService.getAllService();

      if (getAll.length !== 0) {
        return res
          .status(responseCode.OK)
          .send(
            commonResponse(
              responseCode.OK,
              responseConst.DATA_RETRIEVE_SUCCESS,
              getAll
            )
          );
      }

      return res
        .status(responseCode.BAD_REQUEST)
        .send(
          commonResponse(
            responseCode.BAD_REQUEST,
            responseConst.DATA_NOT_FOUND,
            null,
            true
          )
        );
    } catch (error) {
      logger.error(`Error ---> ${error}`);
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

  // Get temp user by ID (VIEW)
  getByIdByView: async (req, res) => {
    try {
      const user_id = req.query.id;

      const getDataById = await TempUserMasterService.getServiceById(user_id);

      if (getDataById) {
        return res
          .status(responseCode.OK)
          .send(
            commonResponse(
              responseCode.OK,
              responseConst.DATA_RETRIEVE_SUCCESS,
              getDataById
            )
          );
      }

      return res
        .status(responseCode.BAD_REQUEST)
        .send(
          commonResponse(
            responseCode.BAD_REQUEST,
            responseConst.DATA_NOT_FOUND,
            null,
            true
          )
        );
    } catch (error) {
      logger.error(`Error ---> ${error}`);
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

  // Soft delete temp user
  deleteData: async (req, res) => {
    try {
      const user_id = req.query.id;

      const deleteData = await TempUserMasterService.deleteById(
        user_id,
        req,
        res
      );

      if (deleteData === 0) {
        return res
          .status(responseCode.BAD_REQUEST)
          .send(
            commonResponse(
              responseCode.BAD_REQUEST,
              responseConst.ERROR_DELETING_RECORD,
              null,
              true
            )
          );
      }

      return res
        .status(responseCode.CREATED)
        .send(
          commonResponse(
            responseCode.CREATED,
            responseConst.SUCCESS_DELETING_RECORD
          )
        );
    } catch (error) {
      logger.error(`Error ---> ${error}`);
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
  verifyOtp: async (req, res) => {
    try {
      const { email_id, otp } = req.body;

      if (!email_id || !otp) {
        return res
          .status(responseCode.BAD_REQUEST)
          .send(
            commonResponse(
              responseCode.BAD_REQUEST,
              responseConst.INVALID_REQUEST,
              null,
              true
            )
          );
      }

            // 2. Get temp user
      const tempUser = await TempUserMasterService.getByEmail(email_id);

      if (!tempUser) {
        return res
          .status(responseCode.BAD_REQUEST)
          .send(
            commonResponse(
              responseCode.BAD_REQUEST,
              responseConst.USER_NOT_FOUND,
              null,
              true
            )
          );
      }

      // 1. Check if already verified (exists in user_master)
      const verifiedUser = await UserMasterService.getUserByEmailIdByView(email_id);
      if (verifiedUser) {
        return res
          .status(responseCode.BAD_REQUEST)
          .send(
            commonResponse(
              responseCode.BAD_REQUEST,
              responseConst.USER_ALREADY_VERIFIED,
              null,
              true
            )
          );
      }

      // 3. OTP validation
      if (Number(tempUser.otp) !== Number(otp)) {
        return res
          .status(responseCode.BAD_REQUEST)
          .send(
            commonResponse(
              responseCode.BAD_REQUEST,
              responseConst.INVALID_OTP,
              null,
              true
            )
          );
      }

      // 4. Expiry validation
      if (new Date(tempUser.otp_expiry_time) < new Date()) {
        return res
          .status(responseCode.BAD_REQUEST)
          .send(
            commonResponse(
              responseCode.BAD_REQUEST,
              responseConst.OTP_EXPIRED,
              null,
              true
            )
          );
      }

      // 5. Create user_master record (VERIFICATION COMPLETE)
      await UserMasterService.createService(tempUser);

      // 6. Cleanup temp record
      await TempUserMasterService.deleteDataByIdHard(tempUser.user_id, req, res);

      return res
        .status(responseCode.OK)
        .send(
          commonResponse(responseCode.OK, responseConst.OTP_VERIFIED_SUCCESS)
        );
    } catch (error) {
      logger.error(`Error ---> ${error}`);
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
  },resendOtp: async (req, res) => {
    try {
        const { email_id } = req.body;

        if (!email_id) {
            return res.status(responseCode.BAD_REQUEST).send(
                commonResponse(
                    responseCode.BAD_REQUEST,
                    responseConst.INVALID_REQUEST,
                    null,
                    true
                )
            );
        }

        // Block resend if already verified
        const verifiedUser =
            await UserMasterService.getUserByEmailIdByView(email_id);

        if (verifiedUser) {
            return res.status(responseCode.BAD_REQUEST).send(
                commonResponse(
                    responseCode.BAD_REQUEST,
                    responseConst.USER_ALREADY_VERIFIED,
                    null,
                    true
                )
            );
        }

        // Get temp user
        const tempUser =
            await TempUserMasterService.getByEmail(email_id);

        if (!tempUser) {
            return res.status(responseCode.BAD_REQUEST).send(
                commonResponse(
                    responseCode.BAD_REQUEST,
                    responseConst.USER_NOT_FOUND,
                    null,
                    true
                )
            );
        }

        // Generate new OTP
        const otp = Math.floor(100000 + Math.random() * 900000);

        const expiryTime = new Date();
        expiryTime.setMinutes(expiryTime.getMinutes() + 20);

        // Update OTP
        await TempUserMasterService.updateService(
            tempUser.user_id,
            {
                otp,
                otp_expiry_time: expiryTime,
            }
        );

        // Send email
        const emailContent =
            await CommonEmailtemplate.EmailVerificationRequestSent({
                email_id,
                otp,
                username: tempUser.full_name || "User",
                validity: "20 min",
            });

        await sendEmail({
            to: email_id,
            subject: emailContent.subject,
            html: emailContent.html,
        });

        return res.status(responseCode.OK).send(
            commonResponse(
                responseCode.OK,
                responseConst.OTP_RESENT_SUCCESS
            )
        );

    } catch (error) {
        logger.error(`Error ---> ${error}`);
        return res.status(responseCode.INTERNAL_SERVER_ERROR).send(
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

export default TempUserMasterController;
