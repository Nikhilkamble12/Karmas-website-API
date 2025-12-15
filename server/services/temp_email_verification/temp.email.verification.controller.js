import TempEmailVerificationService from "./temp.email.verification.service.js";
import commonPath from "../../middleware/comman_path/comman.path.js";
import UserMasterService from "../user_master/user.master.service.js";
import sendEmail from "../../utils/helper/comman.email.function.js";
import CommonEmailtemplate from "../../utils/helper/common.email.templates.js";

const {
    commonResponse,
    responseCode,
    responseConst,
    logger
} = commonPath;

const TempEmailVerificationController = {

    // CREATE
    create: async (req, res) => {
        try {
            const data = req.body;

            const result =
                await TempEmailVerificationService.createService(data);

            return res.status(responseCode.CREATED).send(
                commonResponse(
                    responseCode.CREATED,
                    responseConst.SUCCESS_ADDING_RECORD
                )
            );
        } catch (error) {
            logger.error(error);
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

    // GET ALL
    getAll: async (req, res) => {
        try {
            const data =
                await TempEmailVerificationService.getAllService();

            if (!data.length) {
                return res.status(responseCode.BAD_REQUEST).send(
                    commonResponse(
                        responseCode.BAD_REQUEST,
                        responseConst.DATA_NOT_FOUND,
                        null,
                        true
                    )
                );
            }

            return res.status(responseCode.OK).send(
                commonResponse(
                    responseCode.OK,
                    responseConst.DATA_RETRIEVE_SUCCESS,
                    data
                )
            );
        } catch (error) {
            logger.error(error);
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

    // GET BY ID
    getById: async (req, res) => {
        try {
            const { id } = req.query;

            const data =
                await TempEmailVerificationService.getServiceById(id);

            if (!data) {
                return res.status(responseCode.BAD_REQUEST).send(
                    commonResponse(
                        responseCode.BAD_REQUEST,
                        responseConst.DATA_NOT_FOUND,
                        null,
                        true
                    )
                );
            }

            return res.status(responseCode.OK).send(
                commonResponse(
                    responseCode.OK,
                    responseConst.DATA_RETRIEVE_SUCCESS,
                    data
                )
            );
        } catch (error) {
            logger.error(error);
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

    // UPDATE
    update: async (req, res) => {
        try {
            const { id } = req.query;
            const data = req.body;

            const affectedRows =
                await TempEmailVerificationService.updateService(id, data);

            if (!affectedRows) {
                return res.status(responseCode.BAD_REQUEST).send(
                    commonResponse(
                        responseCode.BAD_REQUEST,
                        responseConst.ERROR_UPDATING_RECORD,
                        null,
                        true
                    )
                );
            }

            return res.status(responseCode.OK).send(
                commonResponse(
                    responseCode.OK,
                    responseConst.SUCCESS_UPDATING_RECORD
                )
            );
        } catch (error) {
            logger.error(error);
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

    // DELETE
    delete: async (req, res) => {
        try {
            const { id } = req.query;

            const affectedRows =
                await TempEmailVerificationService.deleteByid(id);

            if (!affectedRows) {
                return res.status(responseCode.BAD_REQUEST).send(
                    commonResponse(
                        responseCode.BAD_REQUEST,
                        responseConst.ERROR_DELETING_RECORD,
                        null,
                        true
                    )
                );
            }

            return res.status(responseCode.OK).send(
                commonResponse(
                    responseCode.OK,
                    responseConst.SUCCESS_DELETING_RECORD
                )
            );
        } catch (error) {
            logger.error(error);
            return res.status(responseCode.INTERNAL_SERVER_ERROR).send(
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

        // Block if already verified
        const verifiedUser = await UserMasterService.getUserByEmailIdByView(email_id);
        if (verifiedUser && verifiedUser.length>0) {
            return res.status(responseCode.BAD_REQUEST).send(
                commonResponse(
                    responseCode.BAD_REQUEST,
                    responseConst.USER_ALREADY_VERIFIED,
                    null,
                    true
                )
            );
        }

        const { otp } =
            await TempEmailVerificationService.resendOtpService(email_id);
        

                        // 2. Generate Email Template
            const emailContent = await CommonEmailtemplate.EmailVerificationRequestSent({
                email_id: email_id,
                otp: otp,
                username: "Guest", // Assuming 'full_name' exists, else default
                validity: "20 min"
            });
            // 3. Send Email (You need to implement the actual sending helper)
            await sendEmail({to:email_id, subject:emailContent.subject,text:null, html:emailContent.html});

        return res.status(responseCode.OK).send(
            commonResponse(
                responseCode.OK,
                responseConst.OTP_GENERATED_SUCCESSFULLY
            )
        );

    } catch (error) {
        console.log("error",error)
        logger.error(error);
        return res.status(responseCode.INTERNAL_SERVER_ERROR).send(
            commonResponse(
                responseCode.INTERNAL_SERVER_ERROR,
                responseConst.INTERNAL_SERVER_ERROR,
                null,
                true
            )
        );
    }
},verifyOtp: async (req, res) => {
    try {
        const { email_id, otp } = req.body;

        // 1. Validation
        if (!email_id || !otp) {
            return res.status(responseCode.BAD_REQUEST).send(
                commonResponse(responseCode.BAD_REQUEST, responseConst.DATA_MISSING_KINDLY_CHECK, null, true)
            );
        }

        // 2. CHECK: Is Account Already In Use?
        // If the user exists in the main user table, they shouldn't be verifying a signup OTP.
        const existingUser = await UserMasterService.getUserByEmailIdByView(email_id);
        if (existingUser && existingUser.length>0) {
            return res.status(responseCode.CONFLICT).send( // 409 Conflict
                commonResponse(
                    responseCode.CONFLICT,
                    responseConst.EMAIL_ALREADY_IN_USE,
                    null,
                    true
                )
            );
        }

        // 3. Get the temp record to check OTP validity
        const tempRecord = await TempEmailVerificationService.checkEmailService(email_id);

        // 4. CHECK: Did they request an OTP?
        if (!tempRecord) {
            return res.status(responseCode.NOT_FOUND).send(
                commonResponse(
                    responseCode.NOT_FOUND,
                    responseConst.KINDLY_REGENRATE_OTP,
                    null,
                    true
                )
            );
        }

        // 5. CHECK: Is OTP Expired?
        const currentTime = new Date();
        const expiryTime = new Date(tempRecord.expires_at);

        if (currentTime > expiryTime) {
            return res.status(responseCode.BAD_REQUEST).send(
                commonResponse(
                    responseCode.BAD_REQUEST,
                    responseConst.INVALID_OTP_KINDLY_RECHECK,
                    null,
                    true
                )
            );
        }

        // 6. CHECK: Does OTP Match? (Ensure types match, e.g., string vs number)
        // We use == to loosely match string "123456" with number 123456, or use String()
        if (String(tempRecord.otp) !== String(otp)) {
            return res.status(responseCode.BAD_REQUEST).send(
                commonResponse(
                    responseCode.BAD_REQUEST,
                    responseConst.OTP_HAS_EXPIRED,
                    null,
                    true
                )
            );
        }

        // ----------------SUCCESS----------------
        
        // Optional: Delete the OTP from temp table so it can't be used again
        // await TempEmailVerificationService.deleteTempRecord(email_id);

        return res.status(responseCode.OK).send(
            commonResponse(
                responseCode.OK,
                responseConst.OTP_VERIFIED_SUCCESSFULLY,
                { email_id: email_id, is_verified: true }
            )
        );

    } catch (error) {
        logger.error("Error in verifyOtp:", error);
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

export default TempEmailVerificationController;
