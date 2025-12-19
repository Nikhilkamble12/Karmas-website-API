import NgoRegistrationService from "./ngo.registration.service.js";
import commonPath from "../../middleware/comman_path/comman.path.js";
import saveBase64ToFile from "../../utils/helper/base64ToFile.js";
import { ROLE_MASTER, STATUS_MASTER } from "../../utils/constants/id_constant/id.constants.js";
import NgoMasterService from "../ngo_master/ngo.master.service.js";
import UserMasterService from "../user_master/user.master.service.js";
import CommonEmailtemplate from "../../utils/helper/common.email.templates.js";
const { commonResponse, responseCode, responseConst, logger, tokenData, currentTime, addMetaDataWhileCreateUpdate } = commonPath
import crypto from "crypto";
import sendEmail from "../../utils/helper/comman.email.function.js";



function generateRandomPassword(length = 10) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$&";
    let result = "";
    const bytes = crypto.randomBytes(length);

    for (let i = 0; i < length; i++) {
        result += chars[bytes[i] % chars.length];
    }
    return result;
}



const NgoRegistrationController = {
    // Create A new Record 
    create: async (req, res) => {
        try {
            const data = req.body;

            // Add metadata (created_by, created_at)
            await addMetaDataWhileCreateUpdate(data, req, res, false);
            data.status_id = STATUS_MASTER.NGO_REGISTRATION_REVIEW
            // Create the registration record
            const createData = await NgoRegistrationService.createService(data);

            if (!createData) {
                return res.status(responseCode.BAD_REQUEST).send(
                    commonResponse(responseCode.BAD_REQUEST, responseConst.ERROR_ADDING_RECORD, null, true)
                );
            }

            const ngo_registration_id = createData.dataValues.ngo_registration_id;

            // Object to hold only updated file paths
            const updateData = {};

            // Only call saveBase64ToFile if data exists
            if (data.ngo_logo_file && data.ngo_logo_file !== "") {
                updateData.ngo_logo_path = await saveBase64ToFile(
                    data.ngo_logo_file,
                    `ngo_registration/${ngo_registration_id}/logo`,
                    data.ngo_logo
                );
                if (data.ngo_logo) updateData.ngo_logo = data.ngo_logo;
            }

            if (data.pan_file && data.pan_file !== "") {
                updateData.pan_card_file_url = await saveBase64ToFile(
                    data.pan_file,
                    `ngo_registration/${ngo_registration_id}/pan`,
                    data.pan_cad_file_name
                );
                if (data.pan_cad_file_name) updateData.pan_cad_file_name = data.pan_cad_file_name;
            }

            if (data.crs_regis_file && data.crs_regis_file !== "") {
                updateData.crs_regis_file_path = await saveBase64ToFile(
                    data.crs_regis_file,
                    `ngo_registration/${ngo_registration_id}/crs_regis`,
                    data.crs_regis_file_name
                );
                if (data.crs_regis_file_name) updateData.crs_regis_file_name = data.crs_regis_file_name;
            }

            if (data.digital_signature_file && data.digital_signature_file !== "") {
                updateData.digital_signature_file_path = await saveBase64ToFile(
                    data.digital_signature_file,
                    `ngo_registration/${ngo_registration_id}/digital_signature`,
                    data.digital_signature_file_name
                );
                if (data.digital_signature_file_name) updateData.digital_signature_file_name = data.digital_signature_file_name;
            }

            if (data.stamp_file && data.stamp_file !== "") {
                updateData.stamp_file_path = await saveBase64ToFile(
                    data.stamp_file,
                    `ngo_registration/${ngo_registration_id}/stamp`,
                    data.stamp_file_name
                );
                if (data.stamp_file_name) updateData.stamp_file_name = data.stamp_file_name;
            }

            // Update record only if any file was saved
            if (Object.keys(updateData).length > 0) {
                await NgoRegistrationService.updateService(ngo_registration_id, updateData);
            }

            return res.status(responseCode.CREATED).send(
                commonResponse(responseCode.CREATED, responseConst.SUCCESS_ADDING_RECORD)
            );

        } catch (error) {
            console.error("Error:", error);
            logger.error(`Error ---> ${error}`);
            return res.status(responseCode.INTERNAL_SERVER_ERROR).send(
                commonResponse(responseCode.INTERNAL_SERVER_ERROR, responseConst.INTERNAL_SERVER_ERROR, null, true)
            );
        }
    },
    // update Record Into Db
    update: async (req, res) => {
        try {
            const id = req.query.id;
            const data = req.body;

            // Add metadata for modification (modified_by, modified_at)
            await addMetaDataWhileCreateUpdate(data, req, res, true);

            // Object to hold updated file paths/names
            const updateData = { ...data }; // start with the fields to update

            // Helper function to save file if present
            const saveFileIfPresent = async (file, folder, fileName, fieldPathName, fieldFileName) => {
                if (file && file !== "") {
                    const savedPath = await saveBase64ToFile(file, `ngo_registration/${id}/${folder}`, fileName);
                    updateData[fieldPathName] = savedPath;
                    if (fileName) updateData[fieldFileName] = fileName;
                }
            };

            // Conditionally save files
            await saveFileIfPresent(data.ngo_logo_file, "logo", data.ngo_logo, "ngo_logo_path", "ngo_logo");
            await saveFileIfPresent(data.pan_file, "pan", data.pan_cad_file_name, "pan_card_file_url", "pan_cad_file_name");
            await saveFileIfPresent(data.crs_regis_file, "crs_regis", data.crs_regis_file_name, "crs_regis_file_path", "crs_regis_file_name");
            await saveFileIfPresent(data.digital_signature_file, "digital_signature", data.digital_signature_file_name, "digital_signature_file_path", "digital_signature_file_name");
            await saveFileIfPresent(data.stamp_file, "stamp", data.stamp_file_name, "stamp_file_path", "stamp_file_name");

            // Update the record using ORM
            const updatedRowsCount = await NgoRegistrationService.updateService(id, updateData);

            if (updatedRowsCount === 0) {
                return res.status(responseCode.BAD_REQUEST).send(
                    commonResponse(responseCode.BAD_REQUEST, responseConst.ERROR_UPDATING_RECORD, null, true)
                );
            }

            return res.status(responseCode.CREATED).send(
                commonResponse(responseCode.CREATED, responseConst.SUCCESS_UPDATING_RECORD)
            );

        } catch (error) {
            console.error("Error:", error);
            logger.error(`Error ---> ${error}`);
            return res.status(responseCode.INTERNAL_SERVER_ERROR).send(
                commonResponse(responseCode.INTERNAL_SERVER_ERROR, responseConst.INTERNAL_SERVER_ERROR, null, true)
            );
        }
    },

    // Retrieve all records 
    getAllByView: async (req, res) => {
        try {
            // Fetch local data from JSON
            // const GetAllJson = await CommanJsonFunction.getAllData(CITY_FOLDER,CITY_JSON)
            // if(GetAllJson!==null){
            //     if(GetAllJson.length!==0){
            //       return res
            //       .status(responseCode.OK)
            //       .send(
            //         commonResponse(
            //           responseCode.OK,
            //           responseConst.DATA_RETRIEVE_SUCCESS,
            //           GetAllJson
            //         )
            //       );
            //     }
            //   }
            // Fetch data from the database if JSON is empty
            const getAll = await NgoRegistrationService.getAllService()

            // const fileStatus=await CommanJsonFunction.checkFileExistence(CITY_FOLDER,CITY_JSON)
            // // Store the data in JSON for future retrieval
            // if(fileStatus==false){
            //   const DataToSave=await  NgoRegistrationService.getAllService()
            //   if(DataToSave.length!==0){
            //     await CommanJsonFunction.storeData( CITY_FOLDER, CITY_JSON, DataToSave, null, CITY_VIEW_NAME)
            //   }
            // }
            // Return fetched data or handle case where no data is found
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
            } else {
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
    // Retrieve a record by its ID
    getByIdByView: async (req, res) => {
        try {
            const Id = req.query.id
            // Fetch data by ID from JSON
            // const getJsonDatabyId=await CommanJsonFunction.getFirstDataByField(CITY_FOLDER,CITY_JSON,"city_id",Id)
            // if(getJsonDatabyId!==null){
            //   return res
            //     .status(responseCode.OK)
            //     .send(
            //       commonResponse(
            //         responseCode.OK,
            //         responseConst.DATA_RETRIEVE_SUCCESS,
            //         getJsonDatabyId
            //       )
            //     );
            // }

            // If not found in JSON, fetch data from the database
            const getDataByid = await NgoRegistrationService.getServiceById(Id)

            // const fileStatus=await CommanJsonFunction.checkFileExistence(CITY_FOLDER,CITY_JSON)
            // // Store the data in JSON for future retrieval
            // if(fileStatus==false){
            //   const DataToSave=await  NgoRegistrationService.getAllService()
            //   if(DataToSave.length!==0){
            //     await CommanJsonFunction.storeData( CITY_FOLDER, CITY_JSON, DataToSave, null, CITY_VIEW_NAME)
            //   }
            // }
            // Return the fetched data or handle case where no data is found
            if (getDataByid.length !== 0) {
                return res
                    .status(responseCode.OK)
                    .send(
                        commonResponse(
                            responseCode.OK,
                            responseConst.DATA_RETRIEVE_SUCCESS,
                            getDataByid
                        )
                    );
            } else {
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
    // Delete A Record 
    deleteData: async (req, res) => {
        try {
            const id = req.query.id
            // Delete data from the database
            const deleteData = await NgoRegistrationService.deleteByid(id, req, res)
            // Also delete data from the JSON file
            // const deleteSatus=await CommanJsonFunction.deleteDataByField(CITY_FOLDER,CITY_JSON,"city_id",id)
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
    }, updateStatusOfRegistration: async (req, res) => {
        try {
            const ngo_registration_id = req.query.ngo_registration_id;
            const data = req.body;  // status_id comes from body

            // Fetch Registration Data
            const registration = await NgoRegistrationService.getServiceById(ngo_registration_id);
            if (!registration) {
                return res.status(404).send(commonResponse(404, responseConst.NGO_REGISTRATION_NOT_FOUND));
            }

            if (registration.status_id == STATUS_MASTER.NGO_REGISTRATION_APPROVED) {
                return res
                    .status(responseCode.BAD_REQUEST)
                    .send(
                        commonResponse(
                            responseCode.BAD_REQUEST,
                            responseConst.NGO_REGISTRATION_ALREADY_COMPLETED,
                            null,
                            true
                        )
                    );
            }
            // --------------------------------------------------------------------
            // STATUS-WISE OPERATIONS
            // --------------------------------------------------------------------

            // NGO APPROVED → Create USER + NGO
            if (data.status_id == STATUS_MASTER.NGO_REGISTRATION_APPROVED) {

                // Build NGO Master Payload
                const ngoPayload = {
                    ngo_name: registration.ngo_name,
                    unique_id: registration.unique_id,
                    darpan_reg_date: registration.darpan_reg_date,
                    ngo_type: registration.ngo_type,
                    registration_no: registration.registration_no,
                    act_name: registration.act_name,

                    city_of_registration_id: registration.city_of_registration_id,
                    state_of_registration_id: registration.state_of_registration_id,
                    country_of_registration_id: registration.country_of_registration_id,

                    date_of_registration: registration.date_of_registration,
                    address: registration.address,

                    city_id: registration.city_id,
                    state_id: registration.state_id,
                    country_id: registration.country_id,

                    telephone: registration.telephone,
                    mobile_no: registration.mobile_no,
                    website_url: registration.website_url,
                    email: registration.email,

                    ngo_logo: registration.ngo_logo,
                    ngo_logo_path: registration.ngo_logo_path,

                    pan_cad_file_name: registration.pan_cad_file_name,
                    pan_card_file_url: registration.pan_card_file_url,
                    crs_regis_file_name: registration.crs_regis_file_name,
                    crs_regis_file_path: registration.crs_regis_file_path,
                    digital_signature_file_name: registration.digital_signature_file_name,
                    digital_signature_file_path: registration.digital_signature_file_path,
                    stamp_file_name: registration.stamp_file_name,
                    stamp_file_path: registration.stamp_file_path,

                    // Mandatory system fields for ngo_master
                    total_request_assigned: 0,
                    total_request_completed: 0,
                    total_request_rejected: 0,
                    total_ngo_likes: 0,

                    status_id: STATUS_MASTER.ACTIVE,
                    is_blacklist: 0,
                    blacklist_reason: null,
                    remarks: registration.remarks || null,

                    is_active: 1,
                    created_by: req.user_id,
                    created_at: new Date()
                };


                // Create NGO entry
                const createdNgo = await NgoMasterService.createService(ngoPayload);

                // Build User Master Payload
                const randomPassword = generateRandomPassword(10);

                const userPayload = {
                    user_name: registration.email,
                    password: randomPassword,
                    full_name: registration.ngo_name,
                    role_id: ROLE_MASTER.NGO,
                    is_account_public: 1,

                    email_id: registration.email,
                    mobile_no: registration.mobile_no,

                    gender: registration.gender || null,
                    bio: null,
                    enrolling_date: new Date(),
                    ngo_id: createdNgo.ngo_id,
                    first_time_login: 1,

                    file_name: registration.ngo_logo,
                    file_path: registration.ngo_logo_path,

                    google_id: null,
                    is_blacklisted: 0,
                    ngo_level_id: null,
                    blacklist_reason: null,
                    total_follower: 0,
                    total_score: 0,
                    is_authenticated: 1,

                    is_active: 1,
                    created_by: req.user_id,
                    created_at: new Date()
                };


                // Create User entry
                const createdUser = await UserMasterService.createService(userPayload);

                // Finally update NGO Registration status
                await NgoRegistrationService.updateService(ngo_registration_id,
                    { status_id: data.status_id, is_admin_accepted: true, modified_at: new Date(), modified_by: req.user_id },
                );
                const ResponseTemplate = await CommonEmailtemplate.NgoRegistrationApprovedSuccessfully({ email_id: registration.email, username: registration.ngo_name, password: randomPassword })
                await sendEmail({ to: registration.email_id, subject: ResponseTemplate.subject, text: null, html: ResponseTemplate.html })
                return res.send(commonResponse(200, responseConst.NGO_APPROVED_SUCCESSFULLY, { ngo: createdNgo, user: createdUser }));
            }

            // NGO REJECTED
            else if (data.status_id === STATUS_MASTER.NGO_REGISTRATION_REJECTED) {

                await NgoRegistrationService.updateService(ngo_registration_id,
                    {
                        is_admin_accepted: false,
                        status_id: data.status_id,
                        remarks: data.remarks || null,
                        modified_by: req.user_id,
                        modified_at: new Date()
                    }
                );
                const ResponseTemplate = await CommonEmailtemplate.NgoRegistrationRejected({ email_id: registration.email, username: registration.ngo_name, reason: registration.reason })
                await sendEmail({ to: registration.email_id, subject: ResponseTemplate.subject, text: null, html: ResponseTemplate.html })
                return res.send(commonResponse(200, responseConst.NGO_REGISTRATION_REJECTED));
            }

            // NGO REOPEN
            else if (data.status_id === STATUS_MASTER.NGO_REGISTRATION_REOPEN) {

                await NgoRegistrationService.update(ngo_registration_id,
                    {
                        is_admin_accepted: false,
                        status_id: data.status_id,
                        modified_by: req.user_id,
                        modified_at: new Date()
                    }
                );
                const ResponseTemplate = await CommonEmailtemplate.NgoRegistrationResubmitRequired({ email_id: registration.email, username: registration.ngo_name, reason: registration.reason })
                await sendEmail({ to: registration.email_id, subject: ResponseTemplate.subject, text: null, html: ResponseTemplate.html })
                return res.send(commonResponse(200, responseConst.NGO_REGISTRATION_REOPEND));
            }

            // INVALID STATUS
            else {
                return res.status(400).send(commonResponse(400, responseConst));
            }

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
    }, ValidateEmailAndSendOtp: async (req, res) => {
        try {
            const { email_id } = req.body
            const checkWetherEmailPresent = await NgoRegistrationService.getDataByEmailId(email_id)
            if (checkWetherEmailPresent.length == 0) {
                return res
                    .status(responseCode.BAD_REQUEST)
                    .send(
                        commonResponse(
                            responseCode.BAD_REQUEST,
                            responseConst.NGO_REGISTRATION_NOT_FOUND,
                            null,
                            true
                        )
                    );
            }
            if (checkWetherEmailPresent[0].status_id == STATUS_MASTER.NGO_REGISTRATION_APPROVED) {
                return res
                    .status(responseCode.BAD_REQUEST)
                    .send(
                        commonResponse(
                            responseCode.BAD_REQUEST,
                            responseConst.NGO_REGISTRATION_ALREADY_COMPLETED,
                            null,
                            true
                        )
                    );
            }
            // 1. Generate 6 Digit Random Number
            const otp = Math.floor(100000 + Math.random() * 900000);

            // 2. Generate Email Template
            const emailContent = await CommonEmailtemplate.EmailVerificationRequestSent({
                email_id: checkWetherEmailPresent.email,
                otp: otp,
                username: checkWetherEmailPresent.ngo_name || "User", // Assuming 'full_name' exists, else default
                validity: "20 min"
            });
            // 3. Send Email (You need to implement the actual sending helper)
            await sendEmail({ to: checkWetherEmailPresent.email, subject: emailContent.subject, text: null, html: emailContent.html });
            // logger.info(`Email sent to ${getDataById.email_id}`);

            // 4. Calculate Expiry (Current Time + 20 Minutes)
            const expiryTime = new Date();
            expiryTime.setMinutes(expiryTime.getMinutes() + 20);

            // 5. Save OTP Log
            const updateNgoRegistration = {
                email_otp: otp,
            }

            if (otp && otp !== null) {
                await addMetaDataWhileCreateUpdate(updateNgoRegistration, req, res, false)
                const updatedRowsCount = await NgoRegistrationService.updateService(checkWetherEmailPresent.ngo_registration_id, updateNgoRegistration)
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

            }
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
    }, verifyOtpByData: async (req, res) => {
        try {
            const { email_id, otp } = req.body
            const checkWetherEmailPresent = await NgoRegistrationService.getDataByEmailId(email_id)
            if (checkWetherEmailPresent.length == 0) {
                return res
                    .status(responseCode.BAD_REQUEST)
                    .send(
                        commonResponse(
                            responseCode.BAD_REQUEST,
                            responseConst.NGO_REGISTRATION_NOT_FOUND,
                            null,
                            true
                        )
                    );
            }
            if (checkWetherEmailPresent[0].status_id == STATUS_MASTER.NGO_REGISTRATION_APPROVED) {
                return res
                    .status(responseCode.BAD_REQUEST)
                    .send(
                        commonResponse(
                            responseCode.BAD_REQUEST,
                            responseConst.NGO_REGISTRATION_ALREADY_COMPLETED,
                            null,
                            true
                        )
                    );
            }
            if (otp == checkWetherEmailPresent[0].email_otp) {
                return res
                    .status(responseCode.BAD_REQUEST)
                    .send(
                        commonResponse(
                            responseCode.BAD_REQUEST,
                            responseConst.OTP_VERIFIED_SUCCESSFULLY,
                            null,
                            true
                        )
                    );
            } else {
                return res
                    .status(responseCode.BAD_REQUEST)
                    .send(
                        commonResponse(
                            responseCode.BAD_REQUEST,
                            responseConst.INVALID_OTP_KINDLY_RECHECK,
                            null,
                            true
                        )
                    );
            }
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
    }, getDataByEmailId: async (req, res) => {
        try {
            const { email_id } = req.body
            const getData = await NgoRegistrationService.getDataByEmailId(email_id)
            if (getData.length !== 0) {
                return res
                    .status(responseCode.OK)
                    .send(
                        commonResponse(
                            responseCode.OK,
                            responseConst.DATA_RETRIEVE_SUCCESS,
                            getData
                        )
                    );
            } else {
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
    }

}

export default NgoRegistrationController