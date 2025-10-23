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
       // Validate required fields
        if (!data.post_id) {
          return res
            .status(responseCode.BAD_REQUEST)
            .send(
              commonResponse(
                responseCode.BAD_REQUEST,
                "post_id is required",
                null,
                true
              )
            );
        }

        if (!data.user_id || data.user_id === "null" || data.user_id === "undefined" || data.user_id === 0) {
          data.user_id = tokenData(req, res);
        }

        // Add metadata (created_by, updated_by, etc.)
        await addMetaDataWhileCreateUpdate(data, req, res, false);

        // Check if the user already liked/disliked this post
        const existingLike = await LikesService.getDataByUserIdAndPostId(data.user_id, data.post_id);

        if (existingLike && existingLike.length > 0) {
            const oldLike = existingLike[0];

            // ---- Case 1.1: dislike → like ----
            if (!oldLike.is_liked && data.is_liked) {
                // Increment user total post likes
                const getUserActivityData = await UserActivtyService.getDataByUserId(data.user_id);
                const total_post_like_no = parseInt(getUserActivityData[0].total_post_like_no ?? 0) + 1;
                await UserActivtyService.updateService(getUserActivityData[0].user_activity_id, { total_likes_no : total_post_like_no });

                // Increment post total likes
                const getPostData = await PostService.getServiceById(data.post_id);
                const total_likes = parseInt(getPostData.total_likes ?? 0) + 1;
                await PostService.updateService(data.post_id, { total_likes });
            }

            // ---- Case 1.2: like → dislike ----
            if (oldLike.is_liked && !data.is_liked) {
                const getUserActivityData = await UserActivtyService.getDataByUserId(data.user_id);
                const total_post_like_no = Math.max(0, parseInt(getUserActivityData[0].total_post_like_no ?? 0) - 1);
                await UserActivtyService.updateService(getUserActivityData[0].user_activity_id, { total_likes_no : total_post_like_no });

                const getPostData = await PostService.getServiceById(data.post_id);
                const total_likes = Math.max(0, parseInt(getPostData.total_likes ?? 0) - 1);
                await PostService.updateService(data.post_id, { total_likes });
            }

            // Update existing like record
            await LikesService.updateService(oldLike.like_id, data);

            return res
                .status(responseCode.OK)
                .send(
                    commonResponse(
                        responseCode.OK,
                        responseConst.SUCCESS_UPDATING_RECORD
                    )
                );
        } else {
            if (data.is_liked) {
                // Increment user total post likes
                const getUserActivityData = await UserActivtyService.getDataByUserId(data.user_id);
                const total_post_like_no = parseInt(getUserActivityData[0].total_post_like_no ?? 0) + 1;
                await UserActivtyService.updateService(getUserActivityData[0].user_activity_id, { total_likes_no : total_post_like_no });

                // Increment post total likes
                const getPostData = await PostService.getServiceById(data.post_id);
                const total_likes = parseInt(getPostData.total_likes ?? 0) + 1;
                await PostService.updateService(data.post_id, { total_likes });
            }

            // Create new like record
            const createData = await LikesService.createSerive(data);

            // ---- Send notification only for new likes ----
            if (createData && data.is_liked) {
                const currentUser = await UserMasterService.getServiceById(data.user_id);
                const postData = await PostService.getServiceById(data.post_id);
                const postMediaData = await PostMediaService.getDatabyPostIdByView(data.post_id);
                const getUserToken = await UserTokenService.GetTokensByUserIds(postData.user_id);

                // Format user profile image
                if (currentUser.file_path && currentUser.file_path !== "null" && currentUser.file_path !== "") {
                    currentUser.file_path = `${process.env.GET_LIVE_CURRENT_URL}/resources/${currentUser.file_path}`;
                } else {
                    currentUser.file_path = null;
                }

                const template = notificationTemplates.postLiked({ username: currentUser.user_name });

                if (postData.user_id !== data.user_id && getUserToken.length !== 0) {
                    await sendTemplateNotification({
                        templateKey: "Postliked-notification",
                        templateData: template,
                        userIds: getUserToken,
                        metaData: {
                            like_id: createData.dataValues.like_id,
                            user_profile: currentUser?.file_path,
                            post_media_url: postMediaData.length !== 0 ? postMediaData[0]?.media_url : null,
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

  // Update an existing record by its ID
  update: async (req, res) => {
    try {
      const data = req.body;
      const id = req.query.id;
      // Add metadata to update (updated_by, updated_at,)
      await addMetaDataWhileCreateUpdate(data, req, res, true);
      const getOlderData = await LikesService.getServiceById(id)
      if(data.is_liked !== getOlderData.is_liked){
        const getUserActivityData = await UserActivtyService.getDataByUserId(tokenData(req,res))
        const postData = await PostService.getServiceById(data.post_id)
        if(data.is_liked){
          const total_likes = parseInt(getUserActivityData[0].total_likes_no) + 1
          const updateUserActivity = await UserActivtyService.updateService(getUserActivityData[0].user_activity_id,{total_likes_no:total_likes})
          if(postData) {
          await PostService.updateService(data.post_id,
            {
              total_likes: parseInt(postData.total_likes || 0) + 1           
            }
          )
        }
        }else{
          const total_likes = parseInt(getUserActivityData[0].total_likes_no) - 1
          const updateUserActivity = await UserActivtyService.updateService(getUserActivityData[0].user_activity_id,{total_likes_no:total_likes})

           if(postData) {
            await PostService.updateService(getOlderData.post_id, {
              total_likes: Math.max(0, parseInt(post.total_likes || 0) - 1) // Ensure count doesn't go below 0
            });
          }
        }
      }
      // data.updated_by=1,
      // data.updated_at = new Date()
      // Update the record using ORM
      const updatedRowsCount = await LikesService.updateService(id, data);
      // if (updatedRowsCount > 0) {
      //     const newData = await LikeService.getServiceById(id);
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
        .status(responseCode.OK)
        .send(
          commonResponse(responseCode.OK, responseConst.SUCCESS_UPDATING_RECORD)
        );
    } catch (error) {
      console.log("error", error);
      logger.error(`Error --> ${error}`);
      return res
        .status(responseCode.INTERNAL_SERVER_ERROR)
        .send(
          commonResponse(
            responseCode.INTERNAL_SERVER_ERROR,
            responseConst.ERROR_UPDATING_RECORD,
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
      // Delete data from the database
      const deleteData = await LikesService.deleteById(id, req, res);

      const likeData = await LikesService.getServiceById(id);
      // Also delete data from the JSON file
      // const deleteSatus=await CommanJsonFunction.deleteDataByField(CITY_FOLDER,CITY_JSON,"city_id",id)
      if (deleteData !== 0 && likeData && likeData.is_liked) {
        // Update post total likes
        const post = await PostService.getServiceById(likeData.post_id);
        if(post) {
          await PostService.updateService(likeData.post_id, {
            total_likes: Math.max(0, parseInt(post.total_likes || 0) - 1)
          });
        }
      }
      
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
        .status(responseCode.OK)
        .send(
          commonResponse(
            responseCode.OK,
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
  },getLikesbyPostId:async(req,res)=>{
    try{
      const post_id = req.query.post_id
      const limit = req.query.limit
      const offset = req.query.offset
      const getAllLikesByPostId = await LikesService.getLikesByPostId(post_id,limit,offset)
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
  },getAllLikesByUserId:async(req,res)=>{
    try{
      const user_id = req.query.user_id
      const limit = req.query.limit
      const offset = req.query.offset
      const getLikesByUserId = await LikesService.getLikesByUserId(user_id,limit,offset)
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
};

export default LikesController;