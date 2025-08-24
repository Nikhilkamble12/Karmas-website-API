import commonPath from "../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
import getBase64FromFile from "../../utils/helper/base64.retrive.data.js";
import saveBase64ToFile from "../../utils/helper/base64ToFile.js";
import getCurrentIndianTime from "../../utils/helper/get.current.time.ist.js";
import UserActivtyService from "../user_activity/user.activity.service.js";
import UserBlackListService from "../user_blacklist/user.blacklist.service.js";
import UserMasterService from "./user.master.service.js";
const { commonResponse, responseCode, responseConst, logger, tokenData, currentTime, addMetaDataWhileCreateUpdate } = commonPath

const UserMasterController = {
    // Create A new Record 
    create: async (req, res) => {
        try {
            const data = req.body;
            const currentTime = await getCurrentIndianTime()
            // Add metadata for creation (created by, created at)
            // await addMetaDataWhileCreateUpdate(data, req, res, false);
            const accessToken = req.get("x-access-token");

            if (accessToken && accessToken !== "null" && accessToken!=="") {
            const tokenUser = await tokenData(req, res);
            data.created_by = tokenUser;
            data.created_at = currentTime
            } else {
            data.created_by = 1;
            data.created_at = currentTime
            }

            // data.created_by=1,
            // data.created_at = new Date()
            // Create the record using ORM
            data.first_time_login = true
            const createData = await UserMasterService.createService(data);
            if(createData?.success==false){
                 return res
                    .status(responseCode.BAD_REQUEST)
                    .send(
                        commonResponse(
                            responseCode.BAD_REQUEST,
                            responseConst.UNIQUE_CONSTRANTS_FAILED,
                            createData.error,
                            true
                        )
                    );
            }
            if (createData) {
                let file_path = null, bg_image_path = null;
                if (data.Base64File !== null && data.Base64File !== "" && data.Base64File !== 0 && data.Base64File !== undefined && data.file_name && data.file_name !== "" && data.file_name !== 0) {
                    const user_id = createData.dataValues.user_id
                    await saveBase64ToFile(
                        data.Base64File,
                        "user_master/" + user_id,
                        currentTime().replace(/ /g, "_").replace(/:/g, "-") +
                        "_" +
                        data.file_name
                    );
                    const upload_page_1 = data.file_name
                        ? `user_master/${user_id}/${currentTime()
                            .replace(/ /g, "_")
                            .replace(/:/g, "-")}_${data.file_name}`
                        : null;
                    file_path = upload_page_1
                    //    const updateUserMaster = await UserMasterService.updateService(createData.dataValues.user_id,{file_path:upload_page_1})
                }

                if (data.bg_image_file !== null && data.bg_image_file !== "" && data.bg_image_file !== 0 && data.bg_image_file !== undefined && data.bg_image && data.bg_image !== "" && data.bg_image !== 0) {
                    await saveBase64ToFile(
                        data.bg_image_file,
                        "user_master/" + createData.dataValues.user_id + "/bg_image",
                        currentTime().replace(/ /g, "_").replace(/:/g, "-") +
                        "_" +
                        data.bg_image
                    );
                    const upload_page_2 = data.bg_image
                        ? `user_master/${createData.dataValues.user_id}/bg_image/${currentTime()
                            .replace(/ /g, "_")
                            .replace(/:/g, "-")}_${data.bg_image}`
                        : null;
                    bg_image_path = upload_page_2
                    //    const updateUserMaster = await UserMasterService.updateService(createData.dataValues.user_id,{bg_image_path:upload_page_2})
                }

                const updateData = {
                    file_path: file_path,
                    bg_image_path: bg_image_path
                };
                //console.log("updateData",updateData)
                const updateUserMaster = await UserMasterService.updateService(createData.dataValues.user_id, updateData);
            }
            if (createData) {
                const user_id = createData.dataValues.user_id
                const userActvityCreate = {
                    user_id: user_id,
                    created_by:user_id,
                    created_at :currentTime
                }
                // await addMetaDataWhileCreateUpdate(userActvityCreate, req, res, false);
                const UserActivity = await UserActivtyService.createService(userActvityCreate)

            }
            if (createData) {
                return res
                    .status(responseCode.CREATED)
                    .send(
                        commonResponse(
                            responseCode.CREATED,
                            responseConst.SUCCESS_ADDING_RECORD
                        )
                    );
            } else {
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
            }
        } catch (error) {
            console.log("error", error)
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
    // update Record Into Db
    update: async (req, res) => {
        try {
            const id = req.query.id
            const data = req.body
            // Add metadata for modification (modified by, modified at)
            await addMetaDataWhileCreateUpdate(data, req, res, true);
            if (data.Base64File !== null && data.Base64File !== "" && data.Base64File !== 0 && data.Base64File !== undefined && data.file_name && data.file_name !== "" && data.file_name !== 0) {
                await saveBase64ToFile(
                    data.Base64File,
                    "user_master/" + id,
                    currentTime().replace(/ /g, "_").replace(/:/g, "-") +
                    "_" +
                    data.file_name
                );
                const upload_page_1 = data.file_name
                    ? `user_master/${id}/${currentTime()
                        .replace(/ /g, "_")
                        .replace(/:/g, "-")}_${data.file_name}`
                    : null;
                data.file_path = upload_page_1
                delete data.Base64File
            }
            if (data.bg_image_file !== null && data.bg_image_file !== "" && data.bg_image_file !== 0 && data.bg_image_file !== undefined && data.bg_image && data.bg_image !== "" && data.bg_image !== 0) {
                await saveBase64ToFile(
                    data.bg_image_file,
                    "user_master/" + id + "/bg_image",
                    currentTime().replace(/ /g, "_").replace(/:/g, "-") +
                    "_" +
                    data.bg_image
                );
                const upload_page_2 = data.bg_image
                    ? `user_master/${id}/bg_image/${currentTime()
                        .replace(/ /g, "_")
                        .replace(/:/g, "-")}_${data.bg_image}`
                    : null;
                data.bg_image_path = upload_page_2
                delete data.bg_image_file
            }
            // Update the record using ORM
            const updatedRowsCount = await UserMasterService.updateService(id, data);
            if(updatedRowsCount?.success==false){
                 return res
                    .status(responseCode.BAD_REQUEST)
                    .send(
                        commonResponse(
                            responseCode.BAD_REQUEST,
                            responseConst.UNIQUE_CONSTRANTS_FAILED,
                            updatedRowsCount.error,
                            true
                        )
                    );
            }
            // if (updatedRowsCount > 0) {
            //     const newData = await UserMasterService.getServiceById(id);
            //     // Update the JSON data in the file
            //     await CommanJsonFunction.updateDataByField(CITY_FOLDER, CITY_JSON, "city_id", id, newData, CITY_VIEW_NAME);
            // }
            // Handle case where no records were updated
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
            console.log("error", error)
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
            const getAll = await UserMasterService.getAllService()

            // const fileStatus=await CommanJsonFunction.checkFileExistence(CITY_FOLDER,CITY_JSON)
            // // Store the data in JSON for future retrieval
            // if(fileStatus==false){
            //   const DataToSave=await UserMasterService.getAllService()
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
            const getDataByid = await UserMasterService.getServiceById(Id)

            // const fileStatus=await CommanJsonFunction.checkFileExistence(CITY_FOLDER,CITY_JSON)
            // // Store the data in JSON for future retrieval
            // if(fileStatus==false){
            //   const DataToSave=await UserMasterService.getAllService()
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
            console.log("error", error)
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
            const id = req.params.id
            // Delete data from the database
            const deleteData = await UserMasterService.deleteByid(id, req, res)
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
    }, getuserDataAndActivity: async (req, res) => {
        try {
            const token_user = tokenData(req, res)
            const Id = req.query.id
            if (Id !== token_user) {
                const checkWetherBlocked = await UserBlackListService.getDataByUserIdAndBackListUser(token_user, Id)
                if (checkWetherBlocked && checkWetherBlocked.length > 0) {
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
            }
            // If not found in JSON, fetch data from the database
            const getDataByid = await UserMasterService.getServiceById(Id)
            const getActivity = await UserActivtyService.getDataByUserId(Id)
            if (getDataByid.length !== 0) {
                getDataByid.getActivity = getActivity[0]
                if (getDataByid.file_path && getDataByid.file_path !== "" && getDataByid.file_path !== 0) {
                    getDataByid.Base64File = await getBase64FromFile(getDataByid.file_path)
                } else {
                    getDataByid.Base64File = null
                }
                if (getDataByid.bg_image_path && getDataByid.bg_image_path !== "" && getDataByid.bg_image_path !== 0) {
                    getDataByid.Bg_Base64File = await getBase64FromFile(getDataByid.bg_image_path)
                } else {
                    getDataByid.Bg_Base64File = null
                }
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
            console.log("error", error)
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
    }, getUserDataByUserName: async (req, res) => {
        try {
            const user_name = req.query.user_name
            const limit = req.query.limit
            const offset = req.query.offset
            const FindUserBySearchQuery = await UserMasterService.findUserByFulNameAndUseName(user_name, limit, offset)
            if (FindUserBySearchQuery.length !== 0) {
                for (let i = 0; i < FindUserBySearchQuery.length; i++) {
                    const currentuserData = FindUserBySearchQuery[i]
                    if (currentuserData.file_path && currentuserData.file_path !== "" && currentuserData.file_path !== 0) {
                        currentuserData.file_path = `${process.env.GET_LIVE_CURRENT_URL}/resources/${currentuserData.file_path}`
                    } else {
                        currentuserData.file_path = null
                    }
                }
                return res
                    .status(responseCode.OK)
                    .send(
                        commonResponse(
                            responseCode.OK,
                            responseConst.DATA_RETRIEVE_SUCCESS,
                            FindUserBySearchQuery
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
            console.log("error", error)
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
    }, blockAndUnblockUser: async (req, res) => {
        try {
            const user_id = req.query.user_id
            const tokenUser = await tokenData(req, res);
            const DataToUpdate = {
                is_blacklisted: req.body.is_blacklisted,
                blacklist_reason: req.body.blacklist_reason,
                blacklisted_by : tokenUser
            }
            await addMetaDataWhileCreateUpdate(DataToUpdate, req, res, true);
            const updatedRowsCount = await UserMasterService.updateService(user_id, DataToUpdate);
            // if (updatedRowsCount > 0) {
            //     const newData = await UserMasterService.getServiceById(id);
            //     // Update the JSON data in the file
            //     await CommanJsonFunction.updateDataByField(CITY_FOLDER, CITY_JSON, "city_id", id, newData, CITY_VIEW_NAME);
            // }
            // Handle case where no records were updated
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
    }, getAllBlockedUser: async (req, res) => {
        try {
            const getAll = await UserMasterService.getAllBlocakedUsed()
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
    },checkWetherUsernamePresent:async(req,res)=>{
        try{
            const user_name =  req.query.user_name
            const checkUserNamePresnt = await UserMasterService.getUserDataByUserName(user_name)
            if(checkUserNamePresnt.length>0){
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
            }else{
                return res
                    .status(responseCode.OK)
                    .send(
                        commonResponse(
                            responseCode.OK,
                            responseConst.USERNAME_IS_READY_TO_USE,
                            null,
                            false
                        )
                    );
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
    }, getBlockedUsersByUserId: async (req, res) => {
        try {
            const user_id = req.query.user_id
            const blockedUsers = await UserMasterService.getBlockedUsersByUserId(user_id)
            if (blockedUsers.length > 0) {
                return res
                    .status(responseCode.OK)
                    .send(
                        commonResponse(
                            responseCode.OK,
                            responseConst.DATA_RETRIEVE_SUCCESS,
                            blockedUsers
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
export default UserMasterController