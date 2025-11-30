import CommentService from "./comments.service.js";
import commonPath from "../../middleware/comman_path/comman.path.js";
import UserMasterService from "../user_master/user.master.service.js";
import UserActivtyService from "../user_activity/user.activity.service.js";
import notificationTemplates from "../../utils/helper/notification.templates.js";
import PostService from "../Posts/posts.service.js";
import UserTokenService from "../user_tokens/user.tokens.service.js";
import sendTemplateNotification from "../../utils/helper/firebase.push.notification.js";
import PostMediaService from "../PostMedia/postmedia.service.js";
const { commonResponse, responseCode, responseConst, logger, tokenData, currentTime, addMetaDataWhileCreateUpdate } = commonPath

const CommentsController = {
    create: async (req, res) => {
        try {
            const data = req.body;

            // 1. Setup & Validation
            await addMetaDataWhileCreateUpdate(data, req, res, false);

            // Helper to check valid IDs (removes the messy if statements)
            const isValidId = (id) => id && id !== "null" && id !== "undefined" && id != 0;

            if (!isValidId(data.user_id)) {
                data.user_id = tokenData(req, res);
            }

            // 2. Pre-fetch Data (Parallel - Fail Fast)
            const [postData, currentUser] = await Promise.all([
                PostService.getServiceById(data.post_id),
                UserMasterService.getServiceById(data.user_id)
            ]);

            if (!postData) {
                return res.status(responseCode.BAD_REQUEST).send(
                    commonResponse(responseCode.BAD_REQUEST, responseConst.POST_NOT_FOUND, null, true)
                );
            }

            // 3. Create the Comment (Do this FIRST)
            const createData = await CommentService.createService(data);

            if (createData) {
                // 4. Parallel Updates (Atomic Increments)
                // We push all update promises into an array and await them together
                const updateTasks = [];

                // A. Update Post Count (Increment by 1)
                // Assuming PostService has an increment function, otherwise use update with literal
                updateTasks.push(PostService.CountUpdatePost(postData.post_id, 'total_comments', 1));

                // B. Update User Activity (Increment by 1)
                // We don't need to fetch -> read -> update. Just increment.
                updateTasks.push(UserActivtyService.UpdateUserDataCount(data.user_id, 'total_comments_no', 1));

                // C. Update Parent Comment Count (If this is a reply)
                if (isValidId(data.parent_id)) {
                    // Use your new helper function here!
                    updateTasks.push(CommentService.IncrementCommentCount(data.parent_id, 'total_comment', 1));
                }

                // D. Send Notification (Async wrapper)
                updateTasks.push((async () => {
                    if (data.user_id === postData.user_id) return; // Don't notify self

                    const getUserToken = await UserTokenService.GetTokensByUserIds(postData.user_id);
                    if (getUserToken.length > 0) {
                        const postMediaData = await PostMediaService.getDatabyPostIdByView(data.post_id);

                        // Format Profile URL
                        const profileUrl = (currentUser.file_path && currentUser.file_path !== "null")
                            ? `${process.env.GET_LIVE_CURRENT_URL}/resources/${currentUser.file_path}`
                            : null;

                        const template = notificationTemplates.postComment({ username: currentUser.user_name });

                        await sendTemplateNotification({
                            templateKey: "PostComment-Notification",
                            templateData: template,
                            userIds: getUserToken,
                            metaData: {
                                comment_id: createData.post_id || createData.dataValues?.post_id,
                                media_url: postMediaData[0]?.media_url || null,
                                user_profile: profileUrl,
                                created_by: tokenData(req, res)
                            }
                        });
                    }
                })());

                // Execute all updates simultaneously
                await Promise.allSettled(updateTasks);



                return res.status(responseCode.CREATED).send(
                    commonResponse(responseCode.CREATED, responseConst.SUCCESS_ADDING_RECORD)
                );
            } else {
                return res.status(responseCode.BAD_REQUEST).send(
                    commonResponse(responseCode.BAD_REQUEST, responseConst.ERROR_ADDING_RECORD, null, false)
                );
            }

        } catch (error) {
            console.log("error", error)
            logger.error(`Error ---> ${error}`);
            return res.status(responseCode.INTERNAL_SERVER_ERROR).send(
                commonResponse(responseCode.INTERNAL_SERVER_ERROR, responseConst.INTERNAL_SERVER_ERROR, null, true)
            );
        }
    }, update: async (req, res) => {
        try {
            const id = req.query.id;
            const data = req.body;

            // 1. Get current state of the comment
            const currentComment = await CommentService.getServiceById(id);
            if (!currentComment) {
                return res.status(responseCode.BAD_REQUEST).send(commonResponse(responseCode.BAD_REQUEST, responseConst.COMMENT_NOT_FOUND, null, false));
            }

            // 2. Handle Parent ID Change (Moving a comment)
            // If parent_id is in data AND it is different from existing parent
            if (data.parent_id !== undefined && data.parent_id != currentComment.parent_id) {

                const tasks = [];

                // A. Increment the NEW Parent (if it exists and is not 0)
                if (data.parent_id && data.parent_id != 0) {
                    // We add 1 to the new parent's count
                    tasks.push(CommentService.IncrementCommentCount(data.parent_id, 'total_comment', 1));
                }

                // B. Decrement the OLD Parent (if it existed and was not 0)
                if (currentComment.parent_id && currentComment.parent_id != 0) {
                    // We subtract 1 from the old parent's count
                    tasks.push(CommentService.IncrementCommentCount(currentComment.parent_id, 'total_comment', -1));
                }

                await Promise.all(tasks);
            }

            // 3. Standard Update
            await addMetaDataWhileCreateUpdate(data, req, res, true);
            const updatedRowsCount = await CommentService.updateService(id, data);

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
            const getAll = await CommentService.getAllService()

            // const fileStatus=await CommanJsonFunction.checkFileExistence(CITY_FOLDER,CITY_JSON)
            // // Store the data in JSON for future retrieval
            // if(fileStatus==false){
            //   const DataToSave=await CommentService.getAllService()
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
            const getDataByid = await CommentService.getServiceById(Id)

            // const fileStatus=await CommanJsonFunction.checkFileExistence(CITY_FOLDER,CITY_JSON)
            // // Store the data in JSON for future retrieval
            // if(fileStatus==false){
            //   const DataToSave=await CommentService.getAllService()
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

            // 1. Get the Comment Data (Fail Fast)
            // We need this to know the user_id, post_id, and parent_id
            const commentToDelete = await CommentService.getServiceById(id);

            if (!commentToDelete) {
                return res.status(responseCode.BAD_REQUEST).send(
                    commonResponse(responseCode.BAD_REQUEST, responseConst.DATA_NOT_FOUND, null, true)
                );
            }

            // 2. Prepare Parallel Tasks
            const tasks = [];

            // A. Handle Parent Comment (If this was a reply)
            // Simplified check: just checking if it exists and is > 0
            if (commentToDelete.parent_id && commentToDelete.parent_id > 0) {
                // Atomic Decrement (-1)
                tasks.push(CommentService.IncrementCommentCount(commentToDelete.parent_id, 'total_comment', -1));
            }

            // B. Decrement User Activity Stats
            if (commentToDelete.user_id) {
                tasks.push(UserActivtyService.UpdateUserDataCount(commentToDelete.user_id, 'total_comments_no', -1));
            }

            // C. Decrement Post Stats
            if (commentToDelete.post_id) {
                tasks.push(PostService.CountUpdatePost(commentToDelete.post_id, 'total_comments', -1));
            }

            // D. Delete the Comment Record
            // We push the delete operation into the same parallel queue
            tasks.push(CommentService.deleteByid(id, req, res));

            // 3. Execute All Operations Simultaneously

            await Promise.allSettled(tasks);

            // Note: verify deleteByid returns what you expect, 
            // usually standard Sequelize destroy returns 1 if deleted, 0 if not.

            return res.status(responseCode.CREATED).send(
                commonResponse(responseCode.CREATED, responseConst.SUCCESS_DELETING_RECORD)
            );

        } catch (error) {
            logger.error(`Error ---> ${error}`);
            return res.status(responseCode.INTERNAL_SERVER_ERROR).send(
                commonResponse(responseCode.INTERNAL_SERVER_ERROR, responseConst.INTERNAL_SERVER_ERROR, null, true)
            );
        }
    },
    getCommentByPostIdAndParentId: async (req, res) => {
        try {
            const post_id = req.query.post_id
            const parent_id = req.query.parent_id
            const limit = req.query.limit
            const offset = req.query.offset
            const getCommentData = await CommentService.getCommentByPostOrParentId(post_id, parent_id, limit, offset)
            if (getCommentData.length !== 0) {
                return res
                    .status(responseCode.OK)
                    .send(
                        commonResponse(
                            responseCode.OK,
                            responseConst.DATA_RETRIEVE_SUCCESS,
                            getCommentData
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
    }, getCommentByUserId: async (req, res) => {
        try {
            const user_id = req.query.user_id
            const getAllUserData = await CommentService.getCommentByUserId(user_id)
            if (getAllUserData.length !== 0) {
                return res
                    .status(responseCode.OK)
                    .send(
                        commonResponse(
                            responseCode.OK,
                            responseConst.DATA_RETRIEVE_SUCCESS,
                            getAllUserData
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

export default CommentsController
