import NgoRegistrationService from "./ngo.registration.service.js";
import commonPath from "../../middleware/comman_path/comman.path.js";
import saveBase64ToFile from "../../utils/helper/base64ToFile.js";
import { STATUS_MASTER } from "../../utils/constants/id_constant/id.constants.js";
const { commonResponse, responseCode, responseConst, logger, tokenData, currentTime, addMetaDataWhileCreateUpdate } = commonPath


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
            if (data.ngo_logo_file) {
                updateData.ngo_logo_path = await saveBase64ToFile(
                    data.ngo_logo_file,
                    `ngo_registration/${ngo_registration_id}/logo`,
                    data.ngo_logo
                );
                if (data.ngo_logo) updateData.ngo_logo = data.ngo_logo;
            }

            if (data.pan_file) {
                updateData.pan_card_file_url = await saveBase64ToFile(
                    data.pan_file,
                    `ngo_registration/${ngo_registration_id}/pan`,
                    data.pan_cad_file_name
                );
                if (data.pan_cad_file_name) updateData.pan_cad_file_name = data.pan_cad_file_name;
            }

            if (data.crs_regis_file) {
                updateData.crs_regis_file_path = await saveBase64ToFile(
                    data.crs_regis_file,
                    `ngo_registration/${ngo_registration_id}/crs_regis`,
                    data.crs_regis_file_name
                );
                if (data.crs_regis_file_name) updateData.crs_regis_file_name = data.crs_regis_file_name;
            }

            if (data.digital_signature_file) {
                updateData.digital_signature_file_path = await saveBase64ToFile(
                    data.digital_signature_file,
                    `ngo_registration/${ngo_registration_id}/digital_signature`,
                    data.digital_signature_file_name
                );
                if (data.digital_signature_file_name) updateData.digital_signature_file_name = data.digital_signature_file_name;
            }

            if (data.stamp_file) {
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
                if (file) {
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
    },updateStatusOfRegistration:async(req,res)=>{
        try{
            const ngo_registration_id = req.query.ngo_registration_id
            const getData = await NgoRegistrationService.getServiceById(ngo_registration_id)
            const data = req.body
            if(data.status_id = STATUS_MASTER.NGO_REGISTRATION_APPROVED){

            }else if(data.status_id = STATUS_MASTER.NGO_REGISTRATION_REJECTED ){

            }else if(data.status_id = STATUS_MASTER.NGO_REGISTRATION_REOPEN){
                
            }
        }catch(error){
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