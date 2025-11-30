import RequestCommentLikesService from "./request.comment.likes.service.js";
import commonPath from "../../middleware/comman_path/comman.path.js";
import UserActivtyService from "../user_activity/user.activity.service.js";
const { commonResponse, responseCode, responseConst, logger, tokenData, currentTime, addMetaDataWhileCreateUpdate } = commonPath

const RequestCommentLikesController = {
    // Create A new Record 
    create: async (req, res) => {
        try {
            const data = req.body;

            // 1. Setup Data
            await addMetaDataWhileCreateUpdate(data, req, res, false);
            const userId = await tokenData(req, res);
            data.user_id = userId;

            // 2. Create the Record FIRST
            // We do this before updating counters to ensure the like is valid.
            const createData = await RequestCommentLikesService.createService(data);

            if (createData) {
                // 3. Update Counters (Atomic & Parallel)
                if (data.is_liked) {
                    // Increment User Activity (Fire and Forget)
                    // We don't need to read the old value first.
                    await UserActivtyService.UpdateUserDataCount(userId, 'total_request_comment_likes_no', 1);
                }

                return res.status(responseCode.CREATED).send(
                    commonResponse(
                        responseCode.CREATED,
                        responseConst.SUCCESS_ADDING_RECORD
                    )
                );
            } else {
                return res.status(responseCode.BAD_REQUEST).send(
                    commonResponse(
                        responseCode.BAD_REQUEST,
                        responseConst.ERROR_ADDING_RECORD,
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

    update: async (req, res) => {
        try {
            const id = req.query.id;
            const data = req.body;

            await addMetaDataWhileCreateUpdate(data, req, res, true);

            // 1. Get current state (Read Once)
            const oldLikeData = await RequestCommentLikesService.getServiceById(id);

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

                if (isNowLiked) {
                    // Changed from Dislike -> Like (Add 1)
                    tasks.push(UserActivtyService.UpdateUserDataCount(userId, 'total_request_comment_likes_no', 1));
                } else {
                    // Changed from Like -> Dislike (Subtract 1)
                    tasks.push(UserActivtyService.UpdateUserDataCount(userId, 'total_request_comment_likes_no', -1));
                }

                // Add the record update to the task list
                tasks.push(RequestCommentLikesService.updateService(id, data));

                // Run updates in parallel
                await Promise.all(tasks);
            } else {
                // Status didn't change, just update metadata/record
                await RequestCommentLikesService.updateService(id, data);
            }

            return res.status(responseCode.CREATED).send(
                commonResponse(responseCode.CREATED, responseConst.SUCCESS_UPDATING_RECORD)
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
            const getAll = await RequestCommentLikesService.getAllService()

            // const fileStatus=await CommanJsonFunction.checkFileExistence(CITY_FOLDER,CITY_JSON)
            // // Store the data in JSON for future retrieval
            // if(fileStatus==false){
            //   const DataToSave=await RequestCommentLikesService.getAllService()
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
            const getDataByid = await RequestCommentLikesService.getServiceById(Id)

            // const fileStatus=await CommanJsonFunction.checkFileExistence(CITY_FOLDER,CITY_JSON)
            // // Store the data in JSON for future retrieval
            // if(fileStatus==false){
            //   const DataToSave=await RequestCommentLikesService.getAllService()
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

            // 1. Fetch Data First (Fail Fast)
            // We MUST fetch before deleting to know who the user was
            const likeData = await RequestCommentLikesService.getServiceById(id);

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

            // 2. Decrement Counter (Atomic)
            // Only decrement if the record was actually a "Like"
            if (likeData.is_liked) {
                // FIX: Use likeData.user_id, NOT tokenData. 
                // This ensures we update the stats of the person who created the like.
                tasks.push(
                    UserActivtyService.UpdateUserDataCount(likeData.user_id, 'total_request_comment_likes_no', -1)
                );
            }

            // 3. Delete the Record
            // Push the delete operation into the same parallel queue
            tasks.push(RequestCommentLikesService.deleteByid(id, req, res));

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
    getRequestCommentLikesByRequestCommentId: async (req, res) => {
        try {
            const request_cmt_id = req.query.request_cmt_id
            const limit = req.query.limit
            const offset = req.query.offset
            const getRequestCommentLikesByRequestCommentId = await RequestCommentLikesService.getRequestCommentLikesByRequestCommentId(request_cmt_id, limit, offset)
            if (getRequestCommentLikesByRequestCommentId.length !== 0) {
                return res
                    .status(responseCode.OK)
                    .send(
                        commonResponse(
                            responseCode.OK,
                            responseConst.DATA_RETRIEVE_SUCCESS,
                            getRequestCommentLikesByRequestCommentId
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
    }, geRequestCommentLikesByUserIdByView: async (req, res) => {
        try {
            const user_id = req.query.user_id
            const limit = req.query.limit
            const offset = req.query.offset
            const RequestCommentLikesByView = await RequestCommentLikesService.getRequestCommentLikesByUserId(user_id, limit, offset)
            if (RequestCommentLikesByView.length !== 0) {
                return res
                    .status(responseCode.OK)
                    .send(
                        commonResponse(
                            responseCode.OK,
                            responseConst.DATA_RETRIEVE_SUCCESS,
                            RequestCommentLikesByView
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
export default RequestCommentLikesController