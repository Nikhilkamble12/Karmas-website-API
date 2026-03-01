import NgoMediaLikesService from "./ngo.media.likes.service.js";
import commonPath from "../../middleware/comman_path/comman.path.js";
import ngoMediaService from "../ngo_media/ngo.media.service.js";
const {commonResponse,responseCode,responseConst,logger,tokenData,currentTime,addMetaDataWhileCreateUpdate} = commonPath


const NgoMediaLikesController = {
    // Create A new Record 
   create: async (req, res) => {
    try {
        const data = req.body;
        
        // 1. Setup & Metadata
        if (!data.ngo_media_id) {
             return res.status(responseCode.BAD_REQUEST).send(
                commonResponse(responseCode.BAD_REQUEST, responseConst.NGO_MEDIA_ID_IS_REQUIRED, null, true)
            );
        }
        
        // Use tokenData to get user_id if not provided
        if (!data.user_id) data.user_id = await tokenData(req, res);
        
        await addMetaDataWhileCreateUpdate(data, req, res, false);

        // 2. Check for Existing Interaction (Read Once)
        const existingLike = await NgoMediaLikesService.getDataByNgoMediaIdAndUserId(data.ngo_media_id, data.user_id);

        // ======================================================
        // SCENARIO A: UPDATE EXISTING (Toggle Like/Dislike)
        // ======================================================
        if (existingLike && existingLike.length > 0) {
            const oldLike = existingLike[0];
            const tasks = [];

            // Case 1: Was Disliked (false) -> Now Liked (true)
            if (!oldLike.is_like && data.is_like) {
                // Atomic Increment (+1)
                tasks.push(ngoMediaService.UpdateDataCount(data.ngo_media_id, 'total_likes', 1));
            }
            // Case 2: Was Liked (true) -> Now Disliked (false)
            else if (oldLike.is_like && !data.is_like) {
                // Atomic Decrement (-1)
                tasks.push(ngoMediaService.UpdateDataCount(data.ngo_media_id, 'total_likes', -1));
            }

            // Update the Like record itself
            tasks.push(NgoMediaLikesService.updateService(oldLike.like_id, data));

            // Execute in Parallel
            await Promise.all(tasks);

            return res.status(responseCode.OK).send(
                commonResponse(responseCode.OK, responseConst.SUCCESS_UPDATING_RECORD)
            );
        } 
        
        // ======================================================
        // SCENARIO B: CREATE NEW (First Interaction)
        // ======================================================
        else {
            // 1. Create the record
            const createData = await NgoMediaLikesService.createService(data);

            if (createData) {
                // 2. If it is a Like, Increment Counter (Parallel/Fire-and-forget)
                if (data.is_like) {
                    await ngoMediaService.UpdateDataCount(data.ngo_media_id, 'total_likes', 1);
                }

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

        // 1. Get current state
        const oldLikeData = await NgoMediaLikesService.getServiceById(id);
        
        if (!oldLikeData) {
            return res.status(responseCode.BAD_REQUEST).send(
                commonResponse(responseCode.BAD_REQUEST, responseConst.DATA_NOT_FOUND, null, true)
            );
        }

        // 2. Logic Check: Did status change?
        if (data.is_like !== undefined && data.is_like !== oldLikeData.is_like) {
            const tasks = [];
            const isNowLiked = Boolean(data.is_like);
            // Ensure we have media ID
            const mediaId = data.ngo_media_id || oldLikeData.ngo_media_id;

            if (isNowLiked) {
                // Changed to Liked -> Add 1
                tasks.push(ngoMediaService.UpdateDataCount(mediaId, 'total_likes', 1));
            } else {
                // Changed to Unliked -> Subtract 1
                tasks.push(ngoMediaService.UpdateDataCount(mediaId, 'total_likes', -1));
            }

            // Add the record update to the task list
            tasks.push(NgoMediaLikesService.updateService(id, data));

            // Run updates in parallel
            await Promise.all(tasks);
        } else {
            // If status didn't change (e.g. just updating metadata), just update record
            await NgoMediaLikesService.updateService(id, data);
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
            const getAll = await NgoMediaLikesService.getAllService()

            // const fileStatus=await CommanJsonFunction.checkFileExistence(CITY_FOLDER,CITY_JSON)
            // // Store the data in JSON for future retrieval
            // if(fileStatus==false){
            //   const DataToSave=await NgoMediaLikesService.getAllService()
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
            const getDataByid = await NgoMediaLikesService.getServiceById(Id)

            // const fileStatus=await CommanJsonFunction.checkFileExistence(CITY_FOLDER,CITY_JSON)
            // // Store the data in JSON for future retrieval
            // if(fileStatus==false){
            //   const DataToSave=await NgoMediaLikesService.getAllService()
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

        // 1. Fetch First (CRITICAL FIX)
        // We must fetch the like data BEFORE deleting it to get the ngo_media_id
        const likeData = await NgoMediaLikesService.getServiceById(id);

        if (likeData && likeData.length == 0) {
            return res.status(responseCode.BAD_REQUEST).send(
                commonResponse(
                    responseCode.BAD_REQUEST,
                    responseConst.LIKE_RECORDS_NOT_FOUND, // Specific error message
                    null,
                    true
                )
            );
        }

        const tasks = [];

        // 2. Decrement Counter (Atomic)
        // Check if is_like (or is_liked) was true. 
        if (likeData.is_like || likeData.is_liked) {
            // Atomic Decrement (-1)
            tasks.push(
                ngoMediaService.UpdateDataCount(likeData.ngo_media_id, 'total_likes', -1)
            );
        }

        // 3. Delete the Record
        // Push delete task to parallel queue
        tasks.push(NgoMediaLikesService.deleteByid(id, req, res));

        // 4. Execute Simultaneously
        
        const results = await Promise.allSettled(tasks);

        // Check result of the delete operation (last task)
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
    getNGoMediaLikeByNgoMediaId:async(req,res)=>{
        try{
            const ngo_media_id = req.query.ngo_media_id
            const getAllData = await NgoMediaLikesService.getDataByNgoMediaId(ngo_media_id)
            // Return the fetched data or handle case where no data is found
            if (getAllData.length !== 0) {
                return res
                    .status(responseCode.OK)
                    .send(
                        commonResponse(
                            responseCode.OK,
                            responseConst.DATA_RETRIEVE_SUCCESS,
                            getAllData
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
    },
   createOrUpdateNgoMediaLike: async (req, res) => {
    try {
        const data = req.body;
        
        // 1. Validation & Setup
        if (!data.ngo_media_id) {
             return res.status(responseCode.BAD_REQUEST).send(
                commonResponse(responseCode.BAD_REQUEST, responseConst.NGO_MEDIA_ID_IS_REQUIRED, null, true)
            );
        }

        // Get User ID (Assuming tokenData is async)
        const user_id = await tokenData(req, res);
        data.user_id = user_id;

        // 2. Check for Existing Interaction (Read Once)
        const existingLike = await NgoMediaLikesService.getDataByNgoMediaIdAndUserId(data.ngo_media_id, user_id);

        // ======================================================
        // SCENARIO A: UPDATE EXISTING (Toggle Like/Dislike)
        // ======================================================
        if (existingLike && existingLike.length > 0) {
            const oldLike = existingLike[0];
            const tasks = [];

            // Case 1: Was Disliked (false) -> Now Liked (true)
            if (!oldLike.is_like && data.is_like) {
                // Atomic Increment (+1)
                tasks.push(ngoMediaService.UpdateDataCount(data.ngo_media_id, 'total_likes', 1));
            }
            // Case 2: Was Liked (true) -> Now Disliked (false)
            else if (oldLike.is_like && !data.is_like) {
                // Atomic Decrement (-1)
                tasks.push(ngoMediaService.UpdateDataCount(data.ngo_media_id, 'total_likes', -1));
            }

            // Only update metadata if status changed
            if (oldLike.is_like !== data.is_like) {
                await addMetaDataWhileCreateUpdate(data, req, res, true);
                
                // Update the Like record itself
                tasks.push(NgoMediaLikesService.updateService(oldLike.like_id, data));

                // Execute in Parallel
                await Promise.all(tasks);
            }

            return res.status(responseCode.CREATED).send(
                commonResponse(responseCode.CREATED, responseConst.SUCCESS_UPDATING_RECORD)
            );
        } 
        
        // ======================================================
        // SCENARIO B: CREATE NEW (First Interaction)
        // ======================================================
        else {
            await addMetaDataWhileCreateUpdate(data, req, res, false);

            // 1. Create the record
            const createData = await NgoMediaLikesService.createService(data);

            if (createData) {
                // 2. If it is a Like, Increment Counter (Parallel/Fire-and-forget)
                if (data.is_like) {
                    await ngoMediaService.UpdateDataCount(data.ngo_media_id, 'total_likes', 1);
                }

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
}
    ,getNgoMediaLikeByUserIdAndMediaId:async(req,res)=>{
        try{
            const ngo_media_id = req.query.ngo_media_id
            const user_id = await tokenData(req,res)
            const getDataByNgoMediaIdAndUserId = await NgoMediaLikesService.getDataByNgoMediaIdAndUserId(ngo_media_id,user_id)
             if (getDataByNgoMediaIdAndUserId.length !== 0) {
                return res
                    .status(responseCode.OK)
                    .send(
                        commonResponse(
                            responseCode.OK,
                            responseConst.DATA_RETRIEVE_SUCCESS,
                            getDataByNgoMediaIdAndUserId
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

export default NgoMediaLikesController