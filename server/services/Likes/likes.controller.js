import LikesService from "./likes.service.js";
import commonPath from "../../middleware/comman_path/comman.path.js";
import UserActivtyService from "../user_activity/user.activity.service.js";
import notificationTemplates from "../../utils/helper/notification.templates.js";
import UserMasterService from "../user_master/user.master.service.js"
import sendTemplateNotification from "../../utils/helper/firebase.push.notification.js";
import PostService from "../Posts/posts.service.js";
import UserTokenService from "../user_tokens/user.tokens.service.js";
import PostMediaService from "../PostMedia/postmedia.service.js";
const {
  commonResponse,
  responseCode,
  responseConst,
  logger,
  tokenData,
  currentTime,
  addMetaDataWhileCreateUpdate,
} = commonPath;

const LikesController = {
  // Create a new Record
  // create: async (req, res) => {
  //   try {
  //     const data = req.body;
  //     // Validate required fields
  //     if (!data.post_id) {
  //       return res
  //         .status(responseCode.BAD_REQUEST)
  //         .send(
  //           commonResponse(
  //             responseCode.BAD_REQUEST,
  //             "post_id is required",
  //             null,
  //             true
  //           )
  //         );
  //     }
  //     // Set user_id from token if not provided
  //     if (!data.user_id || data.user_id === "null" || data.user_id === "undefined" || data.user_id === 0) {
  //       data.user_id = tokenData(req, res);
  //     }
  //     // Add metadata to creation (created_by, created_at,)
  //     await addMetaDataWhileCreateUpdate(data, req, res, false);
  //     // data.created_by=1,
  //     // data.created_at = new Date()
  //     // Create the record using ORM
  //     const postData = await PostService.getServiceById(data.post_id)

  //     if(data.is_liked){
  //       const getUserActivityData = await UserActivtyService.getDataByUserId(tokenData(req,res))
  //       const total_likes = parseInt(getUserActivityData[0].total_likes_no) + 1
  //       const updateUserActivity = await UserActivtyService.updateService(getUserActivityData[0].user_activity_id,{total_likes_no:total_likes})

  //       if(postData) {
  //         await PostService.updateService(data.post_id,
  //           {
  //             total_likes: parseInt(postData.total_likes || 0) + 1           
  //           }
  //         )
  //       }
  //     }
  //     const currentUser = await UserMasterService.getServiceById(data.user_id);
  //     const template = notificationTemplates.postLiked({ username : currentUser.user_name })
  //     const createdData = await LikesService.createSerive(data);
  //     const likeData = await LikesService.getServiceById(createdData.like_id);
  //     if (likeData.file_path && likeData.file_path !== "null" && likeData.file_path !== "") {
  //           likeData.file_path = `${process.env.GET_LIVE_CURRENT_URL}/resources/${likeData.file_path}`;
  //         } else {
  //           likeData.file_path = null;
  //         }
  //     const postMediaData = await PostMediaService.getDatabyPostIdByView(data.post_id);

  //     if (createdData) {
  //       // get user tokens
  //       const getUserToken = await UserTokenService.GetTokensByUserIds(postData.user_id)
  //       // send notification
  //       if(getUserToken.length!==0 && data.user_id !== postData.user_id){
  //         await sendTemplateNotification({templateKey:"Postliked-Notification",templateData:template,userIds:getUserToken,metaData:{like_id:createdData.dataValues.like_id,
  //           user_profile : likeData?.file_path,
  //           post_image:  postMediaData.length!==0 ? postMediaData[0]?.media_url : null,
  //           created_by: tokenData(req,res)}})
  //       }
  //       return res
  //         .status(responseCode.CREATED)
  //         .send(
  //           commonResponse(
  //             responseCode.CREATED,
  //             responseConst.SUCCESS_ADDING_RECORD,
  //             createdData
  //           )
  //         );
  //     } else {
  //       return res
  //         .status(responseCode.BAD_REQUEST)
  //         .send(
  //           commonResponse(
  //             responseCode.BAD_REQUEST,
  //             responseConst.ERROR_ADDING_RECORD,
  //             null,
  //             true
  //           )
  //         );
  //     }
  //   } catch (error) {
  //     console.log("error", error);
  //     logger.error(`Error --> ${error}`);
  //     return res
  //       .status(responseCode.INTERNAL_SERVER_ERROR)
  //       .send(
  //         commonResponse(
  //           responseCode.INTERNAL_SERVER_ERROR,
  //           responseConst.ERROR_ADDING_RECORD,
  //           null,
  //           true
  //         )
  //       );
  //   }
  // },
  create: async (req, res) => {
    try {
      const data = req.body;

      // 1. Validation
      if (!data.post_id) {
        return res.status(responseCode.BAD_REQUEST).send(
          commonResponse(responseCode.BAD_REQUEST, responseConst.POST_ID_IS_REQUIRED, null, true)
        );
      }

      // Helper for ID validation
      const isValidId = (id) => id && id !== "null" && id !== "undefined" && id !== 0;

      if (!isValidId(data.user_id)) {
        data.user_id = tokenData(req, res);
      }

      await addMetaDataWhileCreateUpdate(data, req, res, false);

      // 2. Check for existing interaction (Read Once)
      const existingLike = await LikesService.getDataByUserIdAndPostId(data.user_id, data.post_id);

      // ======================================================
      // SCENARIO A: UPDATE EXISTING (User clicked Like/Dislike again)
      // ======================================================
      if (existingLike && existingLike.length > 0) {
        const oldLike = existingLike[0];
        const tasks = [];

        // Case 1: Changing from Disliked (false) to Liked (true)
        if (!oldLike.is_liked && data.is_liked) {
          // Increment counters in parallel
          tasks.push(UserActivtyService.UpdateUserDataCount(data.user_id, 'total_likes_no', 1));
          tasks.push(PostService.CountUpdatePost(data.post_id, 'total_likes', 1));
        }
        // Case 2: Changing from Liked (true) to Disliked (false)
        else if (oldLike.is_liked && !data.is_liked) {
          // Decrement counters in parallel
          tasks.push(UserActivtyService.UpdateUserDataCount(data.user_id, 'total_likes_no', -1));
          tasks.push(PostService.CountUpdatePost(data.post_id, 'total_likes', -1));
        }

        // Update the actual Like record
        tasks.push(LikesService.updateService(oldLike.like_id, data));

        // Execute all DB ops at once
        await Promise.all(tasks);

        return res.status(responseCode.OK).send(
          commonResponse(responseCode.OK, responseConst.SUCCESS_UPDATING_RECORD)
        );
      }

      // ======================================================
      // SCENARIO B: CREATE NEW (First time interaction)
      // ======================================================
      else {
        // 1. Create the record first
        const createData = await LikesService.createSerive(data);

        if (createData) {
          const tasks = [];

          // 2. If it is a "Like", increment counters
          if (data.is_liked) {
            tasks.push(UserActivtyService.UpdateUserDataCount(data.user_id, 'total_likes_no', 1));
            tasks.push(PostService.CountUpdatePost(data.post_id, 'total_likes', 1));
          }

          // 3. Handle Notification (Async - Fire and Forget logic within Promise.all)
          if (data.is_liked) {
            tasks.push((async () => {
              const [postData, currentUser] = await Promise.all([
                PostService.getServiceById(data.post_id),
                UserMasterService.getServiceById(data.user_id)
              ]);

              // Only notify if liking someone else's post
              if (postData && postData.user_id !== data.user_id) {
                const getUserToken = await UserTokenService.GetTokensByUserIds(postData.user_id);

                if (getUserToken.length > 0) {
                  const postMediaData = await PostMediaService.getDatabyPostIdByView(data.post_id);

                  // Clean Profile URL
                  const profileUrl = (currentUser.file_path && currentUser.file_path !== "null")
                    ? `${process.env.GET_LIVE_CURRENT_URL}/resources/${currentUser.file_path}`
                    : null;

                  const template = notificationTemplates.postLiked({ username: currentUser.user_name });

                  await sendTemplateNotification({
                    templateKey: "Postliked-notification",
                    templateData: template,
                    userIds: getUserToken,
                    metaData: {
                      post_id: createData.post_id,
                      like_id: createData.like_id || createData.dataValues?.like_id,
                      user_profile: profileUrl,
                      media_url: postMediaData[0]?.media_url || null,
                      created_by: data.user_id
                    }
                  });
                }
              }
            })());
          }

          // Execute Counter updates + Notification logic simultaneously
          await Promise.allSettled(tasks);

          return res.status(responseCode.CREATED).send(
            commonResponse(responseCode.CREATED, responseConst.SUCCESS_ADDING_RECORD)
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
      const data = req.body;
      const id = req.query.id;

      await addMetaDataWhileCreateUpdate(data, req, res, true);

      // 1. Get current state to compare
      const oldLikeData = await LikesService.getServiceById(id);

      if (!oldLikeData) {
        return res.status(responseCode.BAD_REQUEST).send(
          commonResponse(responseCode.BAD_REQUEST, responseConst.DATA_NOT_FOUND, null, true)
        );
      }

      // 2. Check if status changed (True <-> False)
      // We only touch the counters if the status actually flipped
      if (data.is_liked !== undefined && data.is_liked !== oldLikeData.is_liked) {
        const tasks = [];

        // Assuming data.is_liked is boolean. If string "0"/"1", cast it first.
        const isNowLiked = Boolean(data.is_liked);

        if (isNowLiked) {
          // Changed to Liked -> Increment
          tasks.push(UserActivtyService.UpdateUserDataCount(tokenData(req, res), 'total_likes_no', 1));
          tasks.push(PostService.CountUpdatePost(oldLikeData.post_id, 'total_likes', 1));
        } else {
          // Changed to Unliked -> Decrement
          tasks.push(UserActivtyService.UpdateUserDataCount(tokenData(req, res), 'total_likes_no', -1));
          tasks.push(PostService.CountUpdatePost(oldLikeData.post_id, 'total_likes', -1));
        }

        // Execute counter updates in parallel
        await Promise.all(tasks);
      }

      // 3. Update the record
      const updatedRowsCount = await LikesService.updateService(id, data);

      if (updatedRowsCount === 0) {
        return res.status(responseCode.BAD_REQUEST).send(
          commonResponse(responseCode.BAD_REQUEST, responseConst.ERROR_UPDATING_RECORD, null, true)
        );
      }

      return res.status(responseCode.OK).send(
        commonResponse(responseCode.OK, responseConst.SUCCESS_UPDATING_RECORD)
      );

    } catch (error) {
      logger.error(`Error --> ${error}`);
      return res.status(responseCode.INTERNAL_SERVER_ERROR).send(
        commonResponse(responseCode.INTERNAL_SERVER_ERROR, responseConst.ERROR_UPDATING_RECORD, null, true)
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
      const getAll = await LikesService.getAllService();
      // const fileStatus=await CommanJsonFunction.checkFileExistence(CITY_FOLDER,CITY_JSON)
      // // Store the data in JSON for future retrieval
      // if(fileStatus==false){
      //   const DataToSave=await LikeService.getAllService()
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
  // Retrieve a specific record by its ID
  getByIdByView: async (req, res) => {
    try {
      const id = req.query.id;
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
      const getDataById = await LikesService.getServiceById(id);
      // const fileStatus=await CommanJsonFunction.checkFileExistence(CITY_FOLDER,CITY_JSON)
      // // Store the data in JSON for future retrieval
      // if(fileStatus==false){
      //   const DataToSave=await LikeService.getAllService()
      //   if(DataToSave.length!==0){
      //     await CommanJsonFunction.storeData( CITY_FOLDER, CITY_JSON, DataToSave, null, CITY_VIEW_NAME)
      //   }
      // }
      // Return the fetched data or handle case where no data is found

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
  // delete a record 
  deleteData: async (req, res) => {
    try {
      const id = req.query.id;

      // 1. Fetch First (CRITICAL FIX)
      // We must fetch the like data BEFORE deleting it, otherwise we don't know 
      // which post_id or user_id to update.
      const likeData = await LikesService.getServiceById(id);

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

      // 2. Decrement Counters (Only if it was a "Like")
      // If is_liked was false (Dislike), we shouldn't decrement the "Total Likes" count.
      if (likeData.is_liked) {

        // A. Atomic Decrement Post Likes
        if (likeData.post_id) {
          tasks.push(PostService.CountUpdatePost(likeData.post_id, 'total_likes', -1));
        }

        // B. Atomic Decrement User Activity Likes
        if (likeData.user_id) {
          tasks.push(UserActivtyService.UpdateUserDataCount(likeData.user_id, 'total_likes_no', -1));
        }
      }

      // 3. Delete the Record
      // We run the delete in parallel with the counter updates
      tasks.push(LikesService.deleteById(id, req, res));

      // 4. Execute All Simultaneously

      const results = await Promise.allSettled(tasks);

      // Check if the Delete task (last one) succeeded
      // Assuming deleteById returns > 0 on success
      const deleteResult = results[results.length - 1];

      // Note: Promise.allSettled wraps result in { status: 'fulfilled', value: ... }
      if (deleteResult.status === 'fulfilled' && deleteResult.value !== 0) {
        return res.status(responseCode.OK).send(
          commonResponse(responseCode.OK, responseConst.SUCCESS_DELETING_RECORD)
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
  getLikesbyPostId: async (req, res) => {
    try {
      const post_id = req.query.post_id
      const limit = req.query.limit
      const offset = req.query.offset
      const getAllLikesByPostId = await LikesService.getLikesByPostId(post_id, limit, offset)
      if (getAllLikesByPostId.length !== 0) {
        return res
          .status(responseCode.OK)
          .send(
            commonResponse(
              responseCode.OK,
              responseConst.DATA_RETRIEVE_SUCCESS,
              getAllLikesByPostId
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
  }, getAllLikesByUserId: async (req, res) => {
    try {
      const user_id = req.query.user_id
      const limit = req.query.limit
      const offset = req.query.offset
      const getLikesByUserId = await LikesService.getLikesByUserId(user_id, limit, offset)
      if (getLikesByUserId.length !== 0) {
        return res
          .status(responseCode.OK)
          .send(
            commonResponse(
              responseCode.OK,
              responseConst.DATA_RETRIEVE_SUCCESS,
              getLikesByUserId
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
};

export default LikesController;