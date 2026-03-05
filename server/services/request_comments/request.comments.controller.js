import RequestCommentService from "./request.comments.service.js";
import commonPath from "../../middleware/comman_path/comman.path.js";
import UserActivtyService from "../user_activity/user.activity.service.js";
import UserMasterService from "../user_master/user.master.service.js";
import notificationTemplates from "../../utils/helper/notification.templates.js";
import RequestMediaService from "../request_media/request.media.service.js";
import RequestService from "../requests/requests.service.js";
import UserTokenService from "../user_tokens/user.tokens.service.js";
import sendTemplateNotification from "../../utils/helper/firebase.push.notification.js";
const { commonResponse, responseCode, responseConst, logger, tokenData, currentTime, addMetaDataWhileCreateUpdate } = commonPath

const RequestCommentController = {
    // Create A new Record 
    create: async (req, res) => {
        try {
            const data = req.body;

            // 1. Validation & Setup
            // Simplified ID check
            if (!data.user_id || data.user_id == "null" || data.user_id == 0) {
                data.user_id = tokenData(req, res);
            }

            await addMetaDataWhileCreateUpdate(data, req, res, false);

            // 2. Create Comment FIRST (Fail Fast)
            const createData = await RequestCommentService.createService(data);

            if (createData) {
                const tasks = [];

                // 3. Parallel Counter Updates (Atomic)

                // A. Increment User Activity (Total comments by this user)
                tasks.push(UserActivtyService.UpdateUserDataCount(data.user_id, 'total_request_comment_no', 1));

                // B. Increment Parent Comment (If this is a reply)
                if (data.parent_id && data.parent_id > 0) {
                    tasks.push(RequestCommentService.UpdateDataCount(data.parent_id, 'total_comment', 1));
                }

                // 4. Notification Logic (Async Wrapper)
                // We wrap this so it runs in parallel with counters without blocking
                tasks.push((async () => {
                    const [currentUser, requestData] = await Promise.all([
                        UserMasterService.getServiceById(data.user_id),
                        RequestService.getServiceById(data.request_id)
                    ]);

                    // Only notify if commenting on someone else's request
                    if (requestData && requestData.request_user_id !== data.user_id) {
                        const getUserToken = await UserTokenService.GetTokensByUserIds(requestData.request_user_id);

                        if (getUserToken.length > 0) {
                            const requestMediaData = await RequestMediaService.getDataByRequestIdByView(data.request_id);

                            // Normalize Profile URL
                            const profileUrl = (currentUser.file_path && currentUser.file_path !== "null")
                                ? `${process.env.GET_LIVE_CURRENT_URL}/resources/${currentUser.file_path}`
                                : null;

                            const template = notificationTemplates.requestComment({ username: currentUser.user_name });

                            await sendTemplateNotification({
                                templateKey: "Requestcomment-notification",
                                templateData: template,
                                userIds: getUserToken,
                                metaData: {
                                    request_id:createData.request_id || createData.dataValues?.request_id,
                                    comment_id: createData.request_comment_id || createData.dataValues?.request_comment_id,
                                    user_profile: profileUrl,
                                    media_url: requestMediaData.length > 0 ? requestMediaData[0]?.media_url : null,
                                    created_by: data.user_id
                                }
                            });
                        }
                    }
                })());



                // Execute all updates and notifications simultaneously
                await Promise.allSettled(tasks);

                return res.status(responseCode.CREATED).send(
                    commonResponse(responseCode.CREATED, responseConst.SUCCESS_ADDING_RECORD)
                );
            } else {
                return res.status(responseCode.BAD_REQUEST).send(
                    commonResponse(responseCode.BAD_REQUEST, responseConst.ERROR_ADDING_RECORD, null, true)
                );
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

            // 1. Fetch current state to compare
            const currentComment = await RequestCommentService.getServiceById(id);

            if (!currentComment) {
                return res.status(responseCode.BAD_REQUEST).send(
                    commonResponse(responseCode.BAD_REQUEST, responseConst.DATA_NOT_FOUND, null, true)
                );
            }

            // 2. Handle Moving Comments (Changing Parent)
            if (data.parent_id !== undefined && data.parent_id != currentComment.parent_id) {
                const tasks = [];

                // A. Increment New Parent
                if (data.parent_id && data.parent_id != 0) {
                    tasks.push(RequestCommentService.UpdateDataCount(data.parent_id, 'total_comment', 1));
                }

                // B. Decrement Old Parent (Critical Fix)
                if (currentComment.parent_id && currentComment.parent_id != 0) {
                    tasks.push(RequestCommentService.UpdateDataCount(currentComment.parent_id, 'total_comment', -1));
                }

                // Execute counter updates
                await Promise.all(tasks);
            }

            // 3. Update the Record
            const updatedRowsCount = await RequestCommentService.updateService(id, data);

            if (updatedRowsCount === 0) {
                return res.status(responseCode.BAD_REQUEST).send(
                    commonResponse(responseCode.BAD_REQUEST, responseConst.ERROR_UPDATING_RECORD, null, true)
                );
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
            const getAll = await RequestCommentService.getAllService()

            // const fileStatus=await CommanJsonFunction.checkFileExistence(CITY_FOLDER,CITY_JSON)
            // // Store the data in JSON for future retrieval
            // if(fileStatus==false){
            //   const DataToSave=await RequestCommentService.getAllService()
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
            const getDataByid = await RequestCommentService.getServiceById(Id)

            // const fileStatus=await CommanJsonFunction.checkFileExistence(CITY_FOLDER,CITY_JSON)
            // // Store the data in JSON for future retrieval
            // if(fileStatus==false){
            //   const DataToSave=await RequestCommentService.getAllService()
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

            // 1. Fetch Data (Fail Fast)
            // We need the comment details to know which parent and user to update
            const commentToDelete = await RequestCommentService.getServiceById(id);

            if (commentToDelete && commentToDelete.length == 0) {
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

            // 2. Decrement Parent Counter (Atomic)
            // Check if this was a reply (parent_id > 0)
            if (commentToDelete.parent_id && parseInt(commentToDelete.parent_id) > 0) {
                // Atomic Decrement (-1) on the Parent
                tasks.push(
                    RequestCommentService.UpdateDataCount(commentToDelete.parent_id, 'total_comment', -1)
                );
            }

            // 3. Decrement User Activity Counter (Atomic)
            if (commentToDelete.user_id) {
                tasks.push(
                    UserActivtyService.UpdateUserDataCount(commentToDelete.user_id, 'total_request_comment_no', -1)
                );
            }

            // 4. Delete the Comment Record
            tasks.push(RequestCommentService.deleteByid(id, req, res));

            // 5. Execute Simultaneously

            const results = await Promise.allSettled(tasks);

            // Check the result of the Delete operation (last task added)
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
    getCommentByRequestAndParentId: async (req, res) => {
        try {
            const request_id = req.query.request_id
            const parent_id = req.query.parent_id
            const limit = req.query.limit
            const offset = req.query.offset
            const getDataById = await RequestCommentService.getRequestCommentByRequestAndParentId(request_id, parent_id, limit, offset)
            if (getDataById.length !== 0) {
                return res
                    .status(responseCode.OK)
                    .send(
                        commonResponse(
                            responseCode.OK,
                            responseConst.DATA_RETRIEVE_SUCCESS,
                            getDataById
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
    }, getCommentByUserIdByView: async (req, res) => {
        try {
            const user_id = req.query.user_id
            const limit = req.query.limit
            const offset = req.query.offset
            const getDataById = await RequestCommentService.getRequestCommentByUserId(user_id, limit, offset)
            if (getDataById.length !== 0) {
                return res
                    .status(responseCode.OK)
                    .send(
                        commonResponse(
                            responseCode.OK,
                            responseConst.DATA_RETRIEVE_SUCCESS,
                            getDataById
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

export default RequestCommentController