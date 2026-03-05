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

            // 1. Setup Data
            const userId = await tokenData(req, res);
            data.user_id = userId;
            await addMetaDataWhileCreateUpdate(data, req, res, false);

            // 2. Check for Existing Interaction (Read Once)
            const existingLike = await RequestLikeService.getDataByUserIdandRequestId(data.user_id, data.request_id);

            // ======================================================
            // SCENARIO A: UPDATE EXISTING (Toggle)
            // ======================================================
            if (existingLike && existingLike.length > 0) {
                const oldLike = existingLike[0];
                const tasks = [];

                // Case 1: Dislike -> Like
                if (!oldLike.is_liked && data.is_liked) {
                    tasks.push(UserActivtyService.UpdateUserDataCount(userId, 'total_request_like_no', 1));
                    tasks.push(RequestService.UpdateRequestCount(data.request_id, 'total_likes', 1));
                }
                // Case 2: Like -> Dislike
                else if (oldLike.is_liked && !data.is_liked) {
                    tasks.push(UserActivtyService.UpdateUserDataCount(userId, 'total_request_like_no', -1));
                    tasks.push(RequestService.UpdateRequestCount(data.request_id, 'total_likes', -1));
                }

                // Update the record itself
                tasks.push(RequestLikeService.updateService(oldLike.like_id, data));

                // Execute in Parallel
                await Promise.all(tasks);

                return res.status(responseCode.OK).send(
                    commonResponse(responseCode.OK, responseConst.SUCCESS_UPDATING_RECORD)
                );
            }

            // ======================================================
            // SCENARIO B: CREATE NEW
            // ======================================================
            else {
                // 1. Create Record First (Fail Fast)
                const createData = await RequestLikeService.createService(data);

                if (createData) {
                    const tasks = [];

                    // 2. Update Counters (Atomic & Parallel)
                    if (data.is_liked) {
                        tasks.push(UserActivtyService.UpdateUserDataCount(userId, 'total_request_like_no', 1));
                        tasks.push(RequestService.UpdateRequestCount(data.request_id, 'total_likes', 1));
                    }

                    // 3. Notification Logic (Async Wrapper)
                    if (data.is_liked) {
                        tasks.push((async () => {
                            // Fetch User and Request data in parallel for notification
                            const [currentUser, requestData] = await Promise.all([
                                UserMasterService.getServiceById(userId),
                                RequestService.getServiceById(data.request_id)
                            ]);

                            if (requestData && requestData.request_user_id !== userId) {
                                const getUserToken = await UserTokenService.GetTokensByUserIds(requestData.request_user_id);

                                if (getUserToken.length > 0) {
                                    const requestMediaData = await RequestMediaService.getDataByRequestIdByView(data.request_id);

                                    // Profile URL Logic
                                    const profileUrl = (currentUser.file_path && currentUser.file_path !== "null")
                                        ? `${process.env.GET_LIVE_CURRENT_URL}/resources/${currentUser.file_path}`
                                        : null;

                                    const template = notificationTemplates.requestLiked({ username: currentUser.user_name });

                                    await sendTemplateNotification({
                                        templateKey: "Requestliked-notification",
                                        templateData: template,
                                        userIds: getUserToken,
                                        metaData: {
                                            request_id:createData.request_id || createData.dataValues?.request_id,
                                            like_id: createData.like_id || createData.dataValues?.like_id,
                                            user_profile: profileUrl,
                                            media_url: requestMediaData.length > 0 ? requestMediaData[0]?.media_url : null,
                                            created_by: userId
                                        }
                                    });
                                }
                            }
                        })());
                    }

                    // Execute counters and notification logic simultaneously
                    await Promise.allSettled(tasks);

                    return res.status(responseCode.CREATED).send(
                        commonResponse(responseCode.CREATED, responseConst.SUCCESS_ADDING_RECORD)
                    );
                } else {
                    return res.status(responseCode.BAD_REQUEST).send(
                        commonResponse(responseCode.BAD_REQUEST, responseConst.ERROR_ADDING_RECORD, null, true)
                    );
                }
            }

        } catch (error) {
            logger.error(`Error ---> ${error}`);
            return res.status(responseCode.INTERNAL_SERVER_ERROR).send(
                commonResponse(responseCode.INTERNAL_SERVER_ERROR, responseConst.INTERNAL_SERVER_ERROR, null, true)
            );
        }
    },

    update: async (req, res) => {
        try {
            const id = req.query.id;
            const data = req.body;

            await addMetaDataWhileCreateUpdate(data, req, res, true);

            // 1. Get current state (Read Once)
            const oldLikeData = await RequestLikeService.getServiceById(id);

            if (!oldLikeData) {
                return res.status(responseCode.BAD_REQUEST).send(
                    commonResponse(responseCode.BAD_REQUEST, responseConst.DATA_NOT_FOUND, null, true)
                );
            }

            // 2. Logic Check: Did status change?
            if (data.is_liked !== undefined && data.is_liked !== oldLikeData.is_liked) {
                const tasks = [];
                const isNowLiked = Boolean(data.is_liked);
                const userId = await tokenData(req, res);
                // Ensure we have request_id (might not be in body for update)
                const requestId = data.request_id || oldLikeData.request_id;

                if (isNowLiked) {
                    // Changed from Dislike -> Like (Add 1)
                    tasks.push(UserActivtyService.UpdateUserDataCount(userId, 'total_request_like_no', 1));
                    tasks.push(RequestService.UpdateRequestCount(requestId, 'total_likes', 1));
                } else {
                    // Changed from Like -> Dislike (Subtract 1)
                    tasks.push(UserActivtyService.UpdateUserDataCount(userId, 'total_request_like_no', -1));
                    tasks.push(RequestService.UpdateRequestCount(requestId, 'total_likes', -1));
                }

                // Add the record update to the task list
                tasks.push(RequestLikeService.updateService(id, data));

                // Run updates in parallel
                await Promise.all(tasks);
            } else {
                // Status didn't change, just update metadata/record
                await RequestLikeService.updateService(id, data);
            }

            return res.status(responseCode.CREATED).send(
                commonResponse(responseCode.CREATED, responseConst.SUCCESS_UPDATING_RECORD)
            );

        } catch (error) {
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
            const id = req.query.id;

            // 1. Fetch First (Fail Fast)
            // We MUST fetch the like data BEFORE deleting it to know the user_id and request_id
            const likeData = await RequestLikeService.getServiceById(id);

            if (likeData && likeData.length == 0) {
                return res.status(responseCode.BAD_REQUEST).send(
                    commonResponse(
                        responseCode.BAD_REQUEST,
                        responseConst.DATA_NOT_FOUND,
                        null,
                        true
                    )
                );
            }

            const tasks = [];

            // 2. Decrement Counters (Atomic)
            // Only decrement if the record was actually a "Like" (is_liked == true)
            if (likeData.is_liked) {

                // A. Decrement User Activity (Total likes by user)
                // Fix: Use likeData.user_id, ensures accuracy even if Admin deletes it
                tasks.push(
                    UserActivtyService.UpdateUserDataCount(likeData.user_id, 'total_request_like_no', -1)
                );

                // B. Decrement Request Total Likes
                // Fix: Use likeData.request_id, replaces the undefined 'data.request_id'
                tasks.push(
                    RequestService.UpdateRequestCount(likeData.request_id, 'total_likes', -1)
                );
            }

            // 3. Delete the Record
            // Push the delete operation into the same parallel queue
            tasks.push(RequestLikeService.deleteByid(id, req, res));

            // 4. Execute Simultaneously

            const results = await Promise.allSettled(tasks);

            // Check the result of the Delete operation (it was the last task added)
            const deleteResult = results[results.length - 1];

            if (deleteResult.status === 'fulfilled' && deleteResult.value !== 0) {
                return res.status(responseCode.CREATED).send(
                    commonResponse(
                        responseCode.CREATED,
                        responseConst.SUCCESS_DELETING_RECORD
                    )
                );
            } else {
                return res.status(responseCode.BAD_REQUEST).send(
                    commonResponse(
                        responseCode.BAD_REQUEST,
                        responseConst.ERROR_DELETING_RECORD,
                        null,
                        true
                    )
                );
            }

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

    getRequestLikeByRequestId: async (req, res) => {
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
    }, geRequestLikeByUserIdByView: async (req, res) => {
        try {
            const user_id = req.query.user_id
            const limit = req.query.limit
            const offset = req.query.offset
            const RequestLikeByView = await RequestLikeService.getRequestLikeByUserId(user_id, limit, offset)
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
export default RequestLikesController