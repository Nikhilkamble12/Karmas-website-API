import PostService from "./posts.service.js";
import commonPath from "../../middleware/comman_path/comman.path.js";
import PostMediaService from "../PostMedia/postmedia.service.js";
import UserFollowingService from "../user_following/user.following.service.js";
import PostTagService from "../post_tag/post.tag.service.js";
import UserActivtyService from "../user_activity/user.activity.service.js";

const { commonResponse,responseCode, responseConst, logger,tokenData, currentTime,addMetaDataWhileCreateUpdate } = commonPath;

const PostController = {
  // Create a new Record
  create: async (req, res) => {
    try {
      const data = req.body;
      // Add metadata to creation (created_by, created_at,)
      await addMetaDataWhileCreateUpdate(data, req, res, false);
      // data.created_by=1,
      // data.created_at = new Date()
      // Create the record using ORM
      if(data.user_id !==null || data.user_id !=="" || data.user_id !=="null" || data.user_id !=="undefined"){
        const getUserActivityData = await UserActivtyService.getDataByUserId(data.user_id);
        const totalPosts = parseInt(getUserActivityData[0].total_user_posts_no ?? 0) + 1;
        const updateUserActivity = await UserActivtyService.updateService(getUserActivityData[0].user_activity_id, { total_user_posts_no: totalPosts  });
      }
      
      const createdData = await PostService.createSerive(data);
      const user_id = tokenData(req, res);
      // const getFollowerUserIdOnly = await UserFollowingService.getOnlyUserIdOfFollowAndBlocked(user_id)
      // const getUserFollower = await UserFollowingService.getDataByFollowingUserId(user_id)
      if (createdData) {
        return res
          .status(responseCode.CREATED)
          .send(
            commonResponse(
              responseCode.CREATED,
              responseConst.SUCCESS_ADDING_RECORD,
              createdData,
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
      console.log("error", error);
      logger.error(`Error --> ${error}`);
      return res
        .status(responseCode.INTERNAL_SERVER_ERROR)
        .send(
          commonResponse(
            responseCode.INTERNAL_SERVER_ERROR,
            responseConst.ERROR_ADDING_RECORD,
            null,
            true
          )
        );
    }
  },
  //  update Record Into Db
  update: async (req, res) => {
    try {
      const id = req.query.id;
      const data = req.body;
      // Add metadata to creation (modified_by, modified_at,)
      await addMetaDataWhileCreateUpdate(data, req, res, true);

      // update the record using ORM
      const updatedRowsCount = await PostService.updateService(id, data);
      // if (updatedRowsCount > 0) {
      //     const newData = await PostService.getServiceById(id);
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
          commonResponse(
            responseCode.OK,
            responseConst.SUCCESS_UPDATING_RECORD,

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
      const getAll = await PostService.getAllService();
          // const fileStatus=await CommanJsonFunction.checkFileExistence(CITY_FOLDER,CITY_JSON)
          // // Store the data in JSON for future retrieval
          // if(fileStatus==false){
          //   const DataToSave=await PostService.getAllService()
          //   if(DataToSave.length!==0){
          //     await CommanJsonFunction.storeData( CITY_FOLDER, CITY_JSON, DataToSave, null, CITY_VIEW_NAME)
          //   }
          // }
          // Return fetched data or handle case where no data is found
      await Promise.all(getAll.map(async(post) => {
        const getTaggedUsers = await PostTagService.getDataByPostId(post.post_id);
        post.tagged_users = getTaggedUsers
      }))
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
      const Id = req.query.id;
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
      const getDataByid = await PostService.getServiceById(Id);

      // const fileStatus=await CommanJsonFunction.checkFileExistence(CITY_FOLDER,CITY_JSON)
      // // Store the data in JSON for future retrieval
      // if(fileStatus==false){
      //   const DataToSave=await PostService.getAllService()
      //   if(DataToSave.length!==0){
      //     await CommanJsonFunction.storeData( CITY_FOLDER, CITY_JSON, DataToSave, null, CITY_VIEW_NAME)
      //   }
      // }
      // Return the fetched data or handle case where no data is found
      const getTaggedUsers = await PostTagService.getDataByPostId(Id);
      getDataByid.tagged_users = getTaggedUsers; 
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
      const getDataById = await PostService.getServiceById(id);
      // Also delete data from the JSON file
      // const deleteSatus=await CommanJsonFunction.deleteDataByField(CITY_FOLDER,CITY_JSON,"city_id",id)
      const getUserActivityData = await UserActivtyService.getDataByUserId(getDataById.user_id)
      const [updateUserActivity, deleteData] = await Promise.all(
         await UserActivtyService.updateService(getUserActivityData[0].user_activity_id,{total_user_posts_no:parseInt(getUserActivityData[0].total_user_posts_no) - 1}),
         await PostService.deleteById(id, req, res)
      )
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
      const deletePostMedia = await PostMediaService.deletePostMediaByPostId(id,req,res)
      const deletePostTag = await PostTagService.deletePostTagByPostId(id,req,res)
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
  },createOrUpdateUpdatePostDataAndMediaById:async(req,res)=>{
    try{
      const data = req.body
      if(data.post_id){
        const getDataByPostId = await PostService.getServiceById(data.post_id)
        const updatePostData = {
          user_id:tokenData(req,res),
          description:data.description,
          total_likes:getDataByPostId.total_likes,
          total_comments:getDataByPostId.total_comments
        }
        await addMetaDataWhileCreateUpdate(updatePostData, req, res, true);

        // update the record using ORM
        const updatedRowsCount = await PostService.updateService(data.post_id, updatePostData);
        
        if(updatedRowsCount>0){
        const getDataByPostIdAfter = await PostService.getServiceById(data.post_id)
        const mergedData = {
          post_id:data.post_id,
          user_id:getDataByPostIdAfter.user_id,
          description:getDataByPostIdAfter.description,
          user_name:getDataByPostIdAfter.user_name,
          full_name:getDataByPostIdAfter.full_name,
          role_name:getDataByPostIdAfter.role_name
        }
        return res
        .status(responseCode.OK)
        .send(
          commonResponse(
            responseCode.OK,
            responseConst.SUCCESS_UPDATING_RECORD,
            mergedData
          )
        );
        }else{
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
      }else{
        const updatePostData = {
          user_id:tokenData(req,res),
          description:data.description,
          total_likes:0,
          total_comments:0
        }
        await addMetaDataWhileCreateUpdate(updatePostData, req, res, false);
        const createdData = await PostService.createSerive(data);
        if(createdData){
          const getDataByPostIdAfter = await PostService.getServiceById(createdData.dataValues.post_id)
          const mergedData = {
            post_id:createdData.dataValues.post_id,
            user_id:getDataByPostIdAfter.user_id,
            description:getDataByPostIdAfter.description,
            user_name:getDataByPostIdAfter.user_name,
            full_name:getDataByPostIdAfter.full_name,
            role_name:getDataByPostIdAfter.role_name
          }
          return res
          .status(responseCode.CREATED)
          .send(
            commonResponse(
              responseCode.CREATED,
              responseConst.SUCCESS_ADDING_RECORD,
              mergedData,
            )
          );
        }else{
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
  },getDatabyPostIdByViewAndMedia:async(req,res)=>{
    try{
      const post_id = req.query.post_id
      const getDatabyPost = await PostService.getServiceById(post_id)
      if(getDatabyPost.length!==0){
        const getMediaByPostId = await PostMediaService.getDatabyPostIdByView(post_id)
        getDatabyPost.mediaData = getMediaByPostId
        return res
          .status(responseCode.OK)
          .send(
            commonResponse(
              responseCode.OK,
              responseConst.DATA_RETRIEVE_SUCCESS,
              getDatabyPost
            )
          );
      }else{
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
  },getAllPostbyUserIdAndFilter:async(req,res)=>{
    try{
      const user_id = req.query.user_id
      const offset = req.query.offset
      const limit = req.query.limit
      if(!user_id || user_id=="" || user_id=="null" || user_id=="undefined"){
          return res
              .status(responseCode.BAD_REQUEST)
              .send(
                  commonResponse(
                      responseCode.BAD_REQUEST,
                      responseConst.USER_ID_IS_REQUIRED,
                      null,
                      true
                  )
              );
      }
      const getDataByPostId = await PostService.getPostByUserIdByFilterData(user_id, offset, limit)
      if(getDataByPostId && getDataByPostId.length>0){
          for(let i = 0;i< getDataByPostId.length ;i++){
            getDataByPostId[i].post_media = await PostMediaService.getDatabyPostIdByView(getDataByPostId[i].post_id)
          }
          return res
              .status(responseCode.OK)
              .send(
                  commonResponse(
                      responseCode.OK,
                      responseConst.DATA_RETRIEVE_SUCCESS,
                      getDataByPostId
                  )
              );
      }else{
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
      console.log("error",error)
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
  },getAllPostByUserIdForHomePage:async(req,res)=>{
    try{
      const user_id = tokenData(req,res)
      const limit = req.query.limit
      const already_viewed = req.query.already_viewed
      console.log(typeof("already_viewed",already_viewed))
      const getAllPostData = await PostService.getPostByUserIdForHomePage(user_id,limit,already_viewed)
      // for(let i = 0; i<getAllPostData.length;i++){
      //   const currentData = getAllPostData[i]
      //   if(currentData.file_path!==null && currentData.file_path!=="" && currentData.file_path!==undefined && currentData.file_path!=="null"){
      //   currentData.file_path = `${process.env.GET_LIVE_CURRENT_URL}/resources/${currentData.file_path}`
      //   }else{
      //       currentData.file_path= null
      //   }
      //   const getAllPostMedia = await PostMediaService.getDatabyPostIdByView(currentData.post_id)
      //   currentData.post_media = getAllPostMedia ?? []
      // }
      // const updatedPostData = await Promise.all(getAllPostData.map(async (currentData) => {
      //       // Normalize file path
      //       if (
      //         currentData.file_path &&
      //         currentData.file_path !== "null" &&
      //         currentData.file_path !== ""
      //       ) {
      //         currentData.file_path = `${process.env.GET_LIVE_CURRENT_URL}/resources/${currentData.file_path}`;
      //       } else {
      //         currentData.file_path = null;
      //       }

      //       // Fetch post media in parallel
      //       const getAllPostMedia = await PostMediaService.getDatabyPostIdByView(currentData.post_id);
      //       currentData.post_media = getAllPostMedia ?? [];

      //       return currentData;
      //       }));

      // ✅ Optimized parallel media loading
      const updatedPostData = await (async () => {
        if (!getAllPostData || getAllPostData.length === 0) return [];

        // Step 1: Extract all post IDs
        const postIds = getAllPostData.map(p => p.post_id);

        // Step 2: Fetch all media for these posts in ONE query
        const allMedia = await PostMediaService.getPostMediaByPostIdsByIn(postIds);

        // Step 3: Create a map { post_id: [media...] }
        const mediaMap = {};
        for (const media of allMedia) {
          if (!mediaMap[media.post_id]) mediaMap[media.post_id] = [];
          mediaMap[media.post_id].push(media);
        }

        // Step 4: Process posts + attach media
        return getAllPostData.map(currentData => {
          // Normalize file path
          currentData.file_path =
            currentData.file_path && currentData.file_path !== "null" && currentData.file_path !== ""
              ? `${process.env.GET_LIVE_CURRENT_URL}/resources/${currentData.file_path}`
              : null;

          // Attach related media
          currentData.post_media = mediaMap[currentData.post_id] || [];

          return currentData;
        });
      })();


      if (getAllPostData.length !== 0) {
        return res
          .status(responseCode.OK)
          .send(
            commonResponse(
              responseCode.OK,
              responseConst.DATA_RETRIEVE_SUCCESS,
              updatedPostData
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
      console.log("error",error)
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
  }, getAllVideoPostByUserIdForHomePage: async (req, res) => {
  try {
    const user_id = tokenData(req, res);
    const limit = req.query.limit;
    const already_viewed = req.query.already_viewed;

    const getAllPostData = await PostService.getVideoPostByUserIdForHomePage(
      user_id,
      limit,
      already_viewed
    );

    const updatedPostData = await (async () => {
      if (!getAllPostData || getAllPostData.length === 0) return [];

      const postIds = getAllPostData.map(p => p.post_id);

      // Fetch all related media for these posts (only videos)
      const allMedia = await PostMediaService.getVideoMediaByPostIdsByIns(postIds);

      // Map { post_id: [media...] }
      const mediaMap = {};
      for (const media of allMedia) {
        if (!mediaMap[media.post_id]) mediaMap[media.post_id] = [];
        mediaMap[media.post_id].push(media);
      }

      // Attach media + normalize file paths
      return getAllPostData.map(currentData => {
        currentData.file_path =
          currentData.file_path &&
          currentData.file_path !== "null" &&
          currentData.file_path !== ""
            ? `${process.env.GET_LIVE_CURRENT_URL}/resources/${currentData.file_path}`
            : null;

        currentData.post_media = mediaMap[currentData.post_id] || [];
        return currentData;
      });
    })();

    if (getAllPostData.length !== 0) {
      return res
        .status(responseCode.OK)
        .send(
          commonResponse(
            responseCode.OK,
            responseConst.DATA_RETRIEVE_SUCCESS,
            updatedPostData
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

};

export default PostController;
