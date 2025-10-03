import RequestLikeService from "./request.likes.service.js";
import commonPath from "../../middleware/comman_path/comman.path.js";
import UserActivtyService from "../user_activity/user.activity.service.js";
import UserMasterService from "../user_master/user.master.service.js";
import notificationTemplates from "../../utils/helper/notification.templates.js";
import RequestMediaService from "../request_media/request.media.service.js";
import RequestService from "../requests/requests.service.js";
import UserTokenService from "../user_tokens/user.tokens.service.js";
import sendTemplateNotification from "../../utils/helper/firebase.push.notification.js";
const { commonResponse, responseCode, responseConst, logger, tokenData, currentTime, addMetaDataWhileCreateUpdate } = commonPath

const RequestLikesController = {
    // Create A new Record 
    create: async (req, res) => {
        try {
            const data = req.body;
            // Add metadata for creation (created by, created at)
            await addMetaDataWhileCreateUpdate(data, req, res, false);
            if (data.is_liked) {
                const getUserActivityData = await UserActivtyService.getDataByUserId(tokenData(req, res))
                const total_request_like_no = parseInt(getUserActivityData[0].total_request_like_no) + 1
                const updateUserActivity = await UserActivtyService.updateService(getUserActivityData[0].user_activity_id, { total_request_like_no: total_request_like_no })
            }
            // data.created_by=1,
            // data.created_at = new Date()
            // Create the record using ORM
            const currentUser = await UserMasterService.getServiceById(data.user_id);
            const template = notificationTemplates.requestLiked({ username: currentUser.user_name})
            const createData = await RequestLikeService.createService(data);
            const requestMediaData = await RequestMediaService.getDataByRequestIdByView(data.request_id)

            if(currentUser.file_path && currentUser.file_path!=="null" && currentUser.file_path!==""){
                currentUser.file_path = `${process.env.GET_LIVE_CURRENT_URL}/resources/${currentUser.file_path}`;
            } else {
                currentUser.file_path = null;
            }

            if (createData) {
                const requestData = await RequestService.getServiceById(data.request_id);
                const getUserToken = await UserTokenService.GetTokensByUserIds(requestData.request_user_id);
                
                if(requestData.request_user_id !== data.user_id && getUserToken.length!==0) {
                    await sendTemplateNotification({templateKey:"Requestliked-notification",
                        templateData:template,
                        userIds:getUserToken,
                        metaData : {
                            like_id:createData.dataValues.request_like_id,
                            user_profile : currentUser?.file_path,
                            request_media_url : requestMediaData.length!==0 ? requestMediaData[0]?.media_url : null,
                            created_by: tokenData(req,res)
                        }
                    })
                }

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
            const getOlderData = await RequestLikeService.getServiceById(id)
            if (data.is_liked !== getOlderData.is_liked) {
                const getUserActivityData = await UserActivtyService.getDataByUserId(tokenData(req, res))
                if (data.is_liked) {
                    const total_likes = parseInt(getUserActivityData[0].total_request_like_no) + 1
                    const updateUserActivity = await UserActivtyService.updateService(getUserActivityData[0].user_activity_id, { total_request_like_no: total_likes })
                } else {
                    const total_likes = parseInt(getUserActivityData[0].total_request_like_no) - 1
                    const updateUserActivity = await UserActivtyService.updateService(getUserActivityData[0].user_activity_id, { total_request_like_no: total_likes })
                }
            }

            // Update the record using ORM
            const updatedRowsCount = await RequestLikeService.updateService(id, data);
            // if (updatedRowsCount > 0) {
            //     const newData = await RequestLikeService.getServiceById(id);
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
            const getAll = await RequestLikeService.getAllService()

            // const fileStatus=await CommanJsonFunction.checkFileExistence(CITY_FOLDER,CITY_JSON)
            // // Store the data in JSON for future retrieval
            // if(fileStatus==false){
            //   const DataToSave=await RequestLikeService.getAllService()
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
            const getDataByid = await RequestLikeService.getServiceById(Id)

            // const fileStatus=await CommanJsonFunction.checkFileExistence(CITY_FOLDER,CITY_JSON)
            // // Store the data in JSON for future retrieval
            // if(fileStatus==false){
            //   const DataToSave=await RequestLikeService.getAllService()
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
            const deleteData = await RequestLikeService.deleteByid(id, req, res)
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
    }, getRequestLikeByRequestId: async (req, res) => {
        try {
            const request_id = req.query.request_id
            const limit = req.query.limit
            const offset = req.query.offset
            const getRequestLikeByRequestId = await RequestLikeService.getRequestLikeByRequestId(request_id, limit, offset)
            if (getRequestLikeByRequestId.length !== 0) {
                return res
                    .status(responseCode.OK)
                    .send(
                        commonResponse(
                            responseCode.OK,
                            responseConst.DATA_RETRIEVE_SUCCESS,
                            getRequestLikeByRequestId
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
    },geRequestLikeByUserIdByView:async(req,res)=>{
        try{
            const user_id = req.query.user_id
            const limit = req.query.limit
            const offset = req.query.offset
            const RequestLikeByView = await RequestLikeService.getRequestLikeByUserId(user_id,limit,offset)
            if (RequestLikeByView.length !== 0) {
                return res
                    .status(responseCode.OK)
                    .send(
                        commonResponse(
                            responseCode.OK,
                            responseConst.DATA_RETRIEVE_SUCCESS,
                            RequestLikeByView
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
export default RequestLikesController