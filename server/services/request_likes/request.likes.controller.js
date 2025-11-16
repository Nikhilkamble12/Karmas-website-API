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
            data.user_id = await tokenData(req, res);

            // Add metadata for creation
            await addMetaDataWhileCreateUpdate(data, req, res, false);

            // Check if user has already liked/disliked this request
            const existingLike = await RequestLikeService.getDataByUserIdandRequestId(data.user_id, data.request_id);

            if (existingLike && existingLike.length > 0) {
                const oldLike = existingLike[0];

                // ---- Case 1: dislike -> like ----
                if (!oldLike.is_liked && data.is_liked) {
                    // Update user activity like count
                    const getUserActivityData = await UserActivtyService.getDataByUserId(data.user_id);
                    const total_request_like_no = parseInt(getUserActivityData[0].total_request_like_no ?? 0) + 1;
                    await UserActivtyService.updateService(getUserActivityData[0].user_activity_id, { total_request_like_no:total_request_like_no });

                    // Update request total_likes
                    const getRequestData = await RequestService.getServiceById(data.request_id);
                    const total_likes = parseInt(getRequestData.total_likes ?? 0) + 1;
                    await RequestService.updateService(data.request_id, { total_likes });
                }

                // ---- Case 2: like -> dislike ----
                if (oldLike.is_liked && !data.is_liked) {
                    const getUserActivityData = await UserActivtyService.getDataByUserId(data.user_id);
                    const total_request_like_no = Math.max(0, parseInt(getUserActivityData[0].total_request_like_no ?? 0) - 1);
                    await UserActivtyService.updateService(getUserActivityData[0].user_activity_id, { total_request_like_no:total_request_like_no });

                    const getRequestData = await RequestService.getServiceById(data.request_id);
                    const total_likes = Math.max(0, parseInt(getRequestData.total_likes ?? 0) - 1);
                    await RequestService.updateService(data.request_id, { total_likes });
                }

                // ---- Update the existing like record ----
                await RequestLikeService.updateService(oldLike.like_id, data);

                return res
                    .status(responseCode.OK)
                    .send(
                        commonResponse(
                            responseCode.OK, 
                            responseConst.SUCCESS_UPDATING_RECORD
                        )
                    );
            } 
            // ---- New like entry ----
            else {
                // Increment total_request_like_no and total_likes if it’s a like
                if (data.is_liked) {
                    const getUserActivityData = await UserActivtyService.getDataByUserId(data.user_id);
                    const total_request_like_no = parseInt(getUserActivityData[0].total_request_like_no ?? 0) + 1;
                    await UserActivtyService.updateService(getUserActivityData[0].user_activity_id, { total_request_like_no:total_request_like_no });

                    const getRequestData = await RequestService.getServiceById(data.request_id);
                    const total_likes = parseInt(getRequestData.total_likes ?? 0) + 1;
                    await RequestService.updateService(data.request_id, { total_likes });
                }

                // Create new like record
                const createData = await RequestLikeService.createService(data);

                // ---- Send notification only for new likes ----
                if (createData && data.is_liked) {
                    const currentUser = await UserMasterService.getServiceById(data.user_id);
                    const requestData = await RequestService.getServiceById(data.request_id);
                    const getUserToken = await UserTokenService.GetTokensByUserIds(requestData.request_user_id);
                    const requestMediaData = await RequestMediaService.getDataByRequestIdByView(data.request_id);

                    if (currentUser.file_path && currentUser.file_path !== "null" && currentUser.file_path !== "") {
                        currentUser.file_path = `${process.env.GET_LIVE_CURRENT_URL}/resources/${currentUser.file_path}`;
                    } else {
                        currentUser.file_path = null;
                    }

                    const template = notificationTemplates.requestLiked({ username: currentUser.user_name });

                    if (requestData.request_user_id !== data.user_id && getUserToken.length !== 0) {
                        await sendTemplateNotification({
                            templateKey: "Requestliked-notification",
                            templateData: template,
                            userIds: getUserToken,
                            metaData: {
                                like_id: createData.dataValues.like_id,
                                user_profile: currentUser?.file_path,
                                media_url: requestMediaData.length !== 0 ? requestMediaData[0]?.media_url : null,
                                created_by: data.user_id
                            }
                        });
                    }
                }

                return res
                    .status(responseCode.CREATED)
                    .send(
                        commonResponse(
                            responseCode.CREATED, 
                            responseConst.SUCCESS_ADDING_RECORD
                        )
                    );
            }

        } catch (error) {
            console.log("error", error);
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