import PostService from "./posts.service.js";
import commonPath from "../../middleware/comman_path/comman.path.js";
import PostMediaService from "../PostMedia/postmedia.service.js";
import UserFollowingService from "../user_following/user.following.service.js";
import uploadFileToS3Folder from "../../utils/helper/s3.common.code.js";
import PostTagService from "../post_tag/post.tag.service.js";
import UserActivtyService from "../user_activity/user.activity.service.js";

const { commonResponse, responseCode, responseConst, logger, tokenData, currentTime, addMetaDataWhileCreateUpdate } = commonPath;

const PostController = {
  // Create a new Record
  create: async (req, res) => {
    try {
      const data = req.body;

      // 1. Setup & Security
      // Always prefer the token's User ID over the body's User ID for security
      const userId = await tokenData(req, res);
      data.user_id = userId;

      // Add metadata (created_by, created_at)
      await addMetaDataWhileCreateUpdate(data, req, res, false);

      // 2. Create the Post FIRST (Fail Fast)
      // We do this before updating the counter. If this fails, the counter remains correct.
      const createdData = await PostService.createSerive(data);

      if (createdData) {
        // 3. Atomic Increment (Fire and Forget / Parallel)
        // Add +1 to the user's total posts count safely
        await UserActivtyService.UpdateUserDataCount(userId, 'total_user_posts_no', 1);

        return res.status(responseCode.CREATED).send(
          commonResponse(
            responseCode.CREATED,
            responseConst.SUCCESS_ADDING_RECORD,
            createdData
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
      console.log("error",error)
      logger.error(`Error --> ${error}`);
      return res.status(responseCode.INTERNAL_SERVER_ERROR).send(
        commonResponse(
          responseCode.INTERNAL_SERVER_ERROR,
          responseConst.INTERNAL_SERVER_ERROR, // Fixed: Use Generic Error const
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

      // Add metadata (modified_by, modified_at)
      await addMetaDataWhileCreateUpdate(data, req, res, true);

      // Update using ORM
      const updatedRowsCount = await PostService.updateService(id, data);

      if (updatedRowsCount === 0) {
        return res.status(responseCode.BAD_REQUEST).send(
          commonResponse(
            responseCode.BAD_REQUEST,
            responseConst.ERROR_UPDATING_RECORD,
            null,
            true
          )
        );
      }

      return res.status(responseCode.OK).send(
        commonResponse(responseCode.OK, responseConst.SUCCESS_UPDATING_RECORD)
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
      await Promise.all(getAll.map(async (post) => {
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

        // 1. Fetch Post Data (Fail Fast)
        const postData = await PostService.getServiceById(id);
        
        if (postData && postData.length==0) {
            return res.status(responseCode.BAD_REQUEST).send(
                commonResponse(responseCode.BAD_REQUEST, responseConst.DATA_NOT_FOUND, null, true)
            );
        }

        const tasks = [];

        // 2. Decrement User Post Count (Atomic)
        // No need to fetch UserActivity first. Just decrement.
        if (postData.user_id) {
            tasks.push(UserActivtyService.UpdateUserDataCount(postData.user_id, 'total_user_posts_no', -1));
        }

        // 3. Prepare Media & S3 Cleanup
        // We fetch media first to get S3 URLs, then delete them in parallel
        const postMediaList = await PostMediaService.getDatabyPostIdByView(id);
        
        if (postMediaList && postMediaList.length > 0) {
            // A. Delete from S3 (Parallelize all file deletions)
            const s3DeletePromises = postMediaList.map(media => {
                if (media.s3_url) {
                    return uploadFileToS3Folder.deleteVideoByUrl(media.s3_url);
                }
            });
            tasks.push(Promise.allSettled(s3DeletePromises));

            // B. Delete Media Records from DB
            tasks.push(PostMediaService.deletePostMediaByPostId(id, req, res));
        }

        // 4. Delete Post Tags (Parallel)
        tasks.push(PostTagService.deletePostTagByPostId(id, req, res));

        // 5. Delete Main Post Record (Parallel)
        tasks.push(PostService.deleteById(id, req, res));

        // 6. EXECUTE EVERYTHING
        // Stats update, S3 deletion, Tag deletion, and Post deletion happen simultaneously
        
        const results = await Promise.allSettled(tasks);

        // Check the result of the Main Post Delete (last task added)
        const mainDeleteResult = results[results.length - 1];

        if (mainDeleteResult.status === 'fulfilled' && mainDeleteResult.value !== 0) {
            return res.status(responseCode.CREATED).send(
                commonResponse(responseCode.CREATED, responseConst.SUCCESS_DELETING_RECORD)
            );
        } else {
             return res.status(responseCode.BAD_REQUEST).send(
                commonResponse(responseCode.BAD_REQUEST, responseConst.ERROR_DELETING_RECORD, null, true)
            );
        }
        
    } catch (error) {
        logger.error(`Error ---> ${error}`);
        return res.status(responseCode.INTERNAL_SERVER_ERROR).send(
            commonResponse(responseCode.INTERNAL_SERVER_ERROR, responseConst.INTERNAL_SERVER_ERROR, null, true)
        );
    }
},
  
  createOrUpdateUpdatePostDataAndMediaById: async (req, res) => {
    try {
      const data = req.body
      if (data.post_id) {
        const getDataByPostId = await PostService.getServiceById(data.post_id)
        const updatePostData = {
          user_id: tokenData(req, res),
          description: data.description,
          total_likes: getDataByPostId.total_likes,
          total_comments: getDataByPostId.total_comments
        }
        await addMetaDataWhileCreateUpdate(updatePostData, req, res, true);

        // update the record using ORM
        const updatedRowsCount = await PostService.updateService(data.post_id, updatePostData);

        if (updatedRowsCount > 0) {
          const getDataByPostIdAfter = await PostService.getServiceById(data.post_id)
          const mergedData = {
            post_id: data.post_id,
            user_id: getDataByPostIdAfter.user_id,
            description: getDataByPostIdAfter.description,
            user_name: getDataByPostIdAfter.user_name,
            full_name: getDataByPostIdAfter.full_name,
            role_name: getDataByPostIdAfter.role_name
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
        } else {
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
      } else {
        const updatePostData = {
          user_id: tokenData(req, res),
          description: data.description,
          total_likes: 0,
          total_comments: 0
        }
        await addMetaDataWhileCreateUpdate(updatePostData, req, res, false);
        const createdData = await PostService.createSerive(data);
        if (createdData) {
          const getDataByPostIdAfter = await PostService.getServiceById(createdData.dataValues.post_id)
          const mergedData = {
            post_id: createdData.dataValues.post_id,
            user_id: getDataByPostIdAfter.user_id,
            description: getDataByPostIdAfter.description,
            user_name: getDataByPostIdAfter.user_name,
            full_name: getDataByPostIdAfter.full_name,
            role_name: getDataByPostIdAfter.role_name
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
  }, getDatabyPostIdByViewAndMedia: async (req, res) => {
    try {
      const post_id = req.query.post_id
      const getDatabyPost = await PostService.getServiceById(post_id)
      if (getDatabyPost.length !== 0) {
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
  }, getAllPostbyUserIdAndFilter: async (req, res) => {
    try {
      const user_id = req.query.user_id
      const offset = req.query.offset
      const limit = req.query.limit
      if (!user_id || user_id == "" || user_id == "null" || user_id == "undefined") {
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
      if (getDataByPostId && getDataByPostId.length > 0) {
        for (let i = 0; i < getDataByPostId.length; i++) {
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
  getAllPostByUserIdForHomePage: async (req, res) => {
  try {
    const user_id = tokenData(req, res);
    const limit = req.query.limit;
    const already_viewed = req.query.already_viewed;

    // ✅ OPTIMIZATION 1: Define Environment Variable ONCE
    // We calculate the prefix string here so we don't do it 20 times in the loop.
    const RESOURCE_URL = `${process.env.GET_LIVE_CURRENT_URL}/resources/`;

    // 1. Fetch Posts
    const posts = await PostService.getPostByUserIdForHomePage(user_id, limit, already_viewed);

    // ✅ OPTIMIZATION 2: Early Exit
    // If no posts, return immediately. Do not run any media logic.
    if (!posts || posts.length === 0) {
      return res.status(responseCode.BAD_REQUEST).send(
        commonResponse(
          responseCode.BAD_REQUEST,
          responseConst.DATA_NOT_FOUND,
          null,
          true
        )
      );
    }

    // 2. Fetch Media (Only if posts exist)
    // Map creates a new array of IDs.
    const postIds = posts.map(p => p.post_id);
    
    // Fetch all media in one fast query
    const allMedia = await PostMediaService.getPostMediaByPostIdsByIn(postIds);

    // 3. Create Media Map (O(N) Complexity)
    // Using a simple object as a dictionary is very fast in V8
    const mediaMap = {};
    
    // ✅ OPTIMIZATION 3: Use for...of for side effects
    // `for...of` is cleaner and slightly faster than forEach for simple iteration
    for (const media of allMedia) {
      if (!mediaMap[media.post_id]) mediaMap[media.post_id] = [];
      mediaMap[media.post_id].push(media);
    }

    // 4. Merge Data
    // ✅ OPTIMIZATION 4: Use the HOISTED variable
    // We use the `RESOURCE_URL` const we defined at the top.
    const updatedPostData = posts.map(post => {
      // Fast string concatenation using the pre-calculated const
      post.file_path =
        post.file_path && post.file_path !== "null" && post.file_path !== ""
          ? `${RESOURCE_URL}${post.file_path}` // <--- FIXED HERE (Uses local const)
          : null;

      // O(1) Lookup from the map we built
      post.post_media = mediaMap[post.post_id] || [];

      return post;
    });

    // 5. Success Response
    return res.status(responseCode.OK).send(
      commonResponse(
        responseCode.OK,
        responseConst.DATA_RETRIEVE_SUCCESS,
        updatedPostData
      )
    );

  } catch (error) {
    console.error("Error in getAllPostByUserIdForHomePage:", error);
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
  
 getAllVideoPostByUserIdForHomePage: async (req, res) => {
  try {
    const user_id = tokenData(req, res);
    const limit = req.query.limit;
    const already_viewed = req.query.already_viewed;

    // ✅ OPTIMIZATION 1: Define Environment Variable ONCE (Hoist)
    const RESOURCE_URL = `${process.env.GET_LIVE_CURRENT_URL}/resources/`;

    // 1. Fetch Video Posts
    const getAllPostData = await PostService.getVideoPostByUserIdForHomePage(
      user_id,
      limit,
      already_viewed
    );

    // ✅ OPTIMIZATION 2: Early Exit
    // If no videos, stop immediately. Don't allocate memory for media logic.
    if (!getAllPostData || getAllPostData.length === 0) {
      return res.status(responseCode.BAD_REQUEST).send(
        commonResponse(
          responseCode.BAD_REQUEST,
          responseConst.DATA_NOT_FOUND,
          null,
          true
        )
      );
    }

    // 2. Fetch Media (Only runs if posts exist)
    const postIds = getAllPostData.map(p => p.post_id);
    
    // Fetch all video media in one query
    const allMedia = await PostMediaService.getVideoMediaByPostIdsByIns(postIds);

    // 3. Create Media Map
    const mediaMap = {};
    // ✅ OPTIMIZATION 3: Use for...of for side effects (Cleaner/Faster)
    for (const media of allMedia) {
      if (!mediaMap[media.post_id]) mediaMap[media.post_id] = [];
      mediaMap[media.post_id].push(media);
    }

    // 4. Merge Data
    // ✅ OPTIMIZATION 4: Flattened logic (No IIFE wrapper)
    const updatedPostData = getAllPostData.map(currentData => {
      // Fast string concatenation using the hoisted const
      currentData.file_path =
        currentData.file_path && currentData.file_path !== "null" && currentData.file_path !== ""
          ? `${RESOURCE_URL}${currentData.file_path}` // Uses local const
          : null;

      // O(1) Lookup
      currentData.post_media = mediaMap[currentData.post_id] || [];

      return currentData;
    });

    // 5. Success Response
    return res.status(responseCode.OK).send(
      commonResponse(
        responseCode.OK,
        responseConst.DATA_RETRIEVE_SUCCESS,
        updatedPostData
      )
    );

  } catch (error) {
    console.error("Error in getAllVideoPostByUserIdForHomePage:", error);
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

};

export default PostController;
