import NgolikesService from "./ngo.likes.service.js";
import commonPath from "../../middleware/comman_path/comman.path.js";
import NgoMasterService from "../ngo_master/ngo.master.service.js";
const {commonResponse,responseCode,responseConst,logger,tokenData,currentTime,addMetaDataWhileCreateUpdate} = commonPath

const NgoLikesController = {
    // Create A new Record 
    /* create: async (req, res) => {
        try {
            const data = req.body;
             data.user_id = await tokenData(req,res);
            const CheckWetherItisLiked = await NgolikesService.getDataByUserId(data.user_id,data.ngo_id)
            if(CheckWetherItisLiked && CheckWetherItisLiked.length>0){
                if(CheckWetherItisLiked && CheckWetherItisLiked[0].is_like==false){
                    if(data.is_like == true){
                        const getNgoData = await NgoMasterService.getServiceById(data.ngo_id)
                        const total_likesCount = parseInt(getNgoData.total_ngo_likes ?? 0) + 1 
                        const updateNgo = await NgoMasterService.updateService(data.ngo_id,{total_ngo_likes:total_likesCount})
                    }
                }else if(CheckWetherItisLiked && CheckWetherItisLiked[0].is_like==true){
                    if(data.is_like==false){
                       const getNgoData = await NgoMasterService.getServiceById(data.ngo_id)
                        const total_likesCount = parseInt(getNgoData.total_ngo_likes ?? 0) - 1 
                        const updateNgo = await NgoMasterService.updateService(data.ngo_id,{total_ngo_likes:total_likesCount}) 
                    }
                }
                const updateNgoLikes = await NgolikesService.updateService(CheckWetherItisLiked[0].like_id,data)
            }
            // Add metadata for creation (created by, created at)
            await addMetaDataWhileCreateUpdate(data, req, res, false);
            // data.created_by=1,
            // data.created_at = new Date()
            // Create the record using ORM
            
            const createData = await NgolikesService.createService(data);
            if (createData) {
                 if(data.is_like == true){
                    const getNgoData = await NgoMasterService.getServiceById(data.ngo_id)
                    const total_likesCount = parseInt(getNgoData.total_ngo_likes ?? 0) + 1 
                    const updateNgo = await NgoMasterService.updateService(data.ngo_id,{total_ngo_likes:total_likesCount})
                }
                return res
                    .status(responseCode.CREATED)
                    .send(
                        commonResponse(
                            responseCode.CREATED,
                            responseConst.SUCCESS_ADDING_RECORD
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
    }, */
    create: async (req, res) => {
    try {
        const data = req.body;
        
        // 1. Validation & Setup
        if (!data.ngo_id) {
             return res.status(responseCode.BAD_REQUEST).send(
                commonResponse(responseCode.BAD_REQUEST, responseConst.NGO_ID_REQUIRED, null, true)
            );
        }

        data.user_id = await tokenData(req, res); // Assuming tokenData is async based on your code

        // 2. Check Existing Interaction (Read Once)
        const existingLike = await NgolikesService.getDataByUserId(data.user_id, data.ngo_id);

        // ======================================================
        // SCENARIO A: UPDATE EXISTING
        // ======================================================
        if (existingLike && existingLike.length > 0) {
            const oldLike = existingLike[0];
            const tasks = [];

            // Case 1: Toggling from Dislike (false) -> Like (true)
            if (!oldLike.is_liked && data.is_liked) {
                // Atomic Increment (+1)
                tasks.push(NgoMasterService.UpdateDataCount(data.ngo_id, 'total_ngo_likes', 1));
            }
            // Case 2: Toggling from Like (true) -> Dislike (false)
            else if (oldLike.is_liked && !data.is_liked) {
                // Atomic Decrement (-1)
                tasks.push(NgoMasterService.UpdateDataCount(data.ngo_id, 'total_ngo_likes', -1));
            }

            // Update the Like record itself
            tasks.push(NgolikesService.updateService(oldLike.like_id, data));

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
            await addMetaDataWhileCreateUpdate(data, req, res, false);

            // 1. Create record
            const createData = await NgolikesService.createService(data);

            if (createData) {
                // 2. If it's a Like, Increment Counter (Fire and Forget / Parallel logic)
                if (data.is_liked) {
                    // We don't need to wait for this to finish to send response, 
                    // but usually safer to await to ensure DB consistency.
                    await NgoMasterService.UpdateDataCount(data.ngo_id, 'total_ngo_likes', 1);
                }

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
        const id = req.query.id;
        const data = req.body;

        await addMetaDataWhileCreateUpdate(data, req, res, true);

        // 1. Get current state (Required to know if we need to inc/dec)
        const oldLikeData = await NgolikesService.getServiceById(id);

        if (!oldLikeData) {
             return res.status(responseCode.BAD_REQUEST).send(
                commonResponse(responseCode.BAD_REQUEST, responseConst.DATA_NOT_FOUND, null, true)
            );
        }

        // 2. Logic Check: Did the status actually change?
        if (data.is_liked !== undefined && data.is_liked !== oldLikeData.is_liked) {
            const tasks = [];
            const isNowLiked = Boolean(data.is_liked);
            // Ensure we have the NGO ID (it might not be in req.body for an update)
            const ngoId = data.ngo_id || oldLikeData.ngo_id; 

            if (isNowLiked) {
                // Changed to Liked -> Add 1
                tasks.push(NgoMasterService.UpdateDataCount(ngoId, 'total_ngo_likes', 1));
            } else {
                // Changed to Unliked -> Subtract 1
                tasks.push(NgoMasterService.UpdateDataCount(ngoId, 'total_ngo_likes', -1));
            }
            
            // Add the main update to the task list
            tasks.push(NgolikesService.updateService(id, data));

            // Run DB updates in parallel
            await Promise.all(tasks);
        } else {
            // If status didn't change, just update the record (e.g. metadata)
            await NgolikesService.updateService(id, data);
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
            const getAll = await NgolikesService.getAllService()

            // const fileStatus=await CommanJsonFunction.checkFileExistence(CITY_FOLDER,CITY_JSON)
            // // Store the data in JSON for future retrieval
            // if(fileStatus==false){
            //   const DataToSave=await NgolikesService.getAllService()
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
            const getDataByid = await NgolikesService.getServiceById(Id)

            // const fileStatus=await CommanJsonFunction.checkFileExistence(CITY_FOLDER,CITY_JSON)
            // // Store the data in JSON for future retrieval
            // if(fileStatus==false){
            //   const DataToSave=await NgolikesService.getAllService()
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
        // We need to fetch the like record to know which NGO to update
        const likeData = await NgolikesService.getServiceById(id);

        if (likeData && likeData.length==0) {
            return res.status(responseCode.NOT_FOUND).send(
                commonResponse(
                    responseCode.NOT_FOUND,
                    responseConst.LIKE_RECORDS_NOT_FOUND,
                    null,
                    true
                )
            );
        }

        const tasks = [];

        // 2. Decrement Counter (Atomic)
        // Only decrement if the record was actually a "Like" (is_liked == true)
        if (likeData.is_liked) {
            // We use -1 to decrement. 
            // We do NOT need to fetch the NGO data first. The DB handles the math.
            tasks.push(NgoMasterService.UpdateDataCount(likeData.ngo_id, 'total_ngo_likes', -1));
        }

        // 3. Delete the Record
        // We push the delete operation into the same parallel queue
        tasks.push(NgolikesService.deleteByid(id, req, res));

        // 4. Execute Operations Simultaneously
        
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
}
    ,getDataByNgoIdlike:async(req,res)=>{
        try{
            const ngo_id = req.query.ngo_id
            const getData = await NgolikesService.getDataByNgoId(ngo_id)
            if (getData.length !== 0) {
                return res
                    .status(responseCode.OK)
                    .send(
                        commonResponse(
                            responseCode.OK,
                            responseConst.DATA_RETRIEVE_SUCCESS,
                            getData
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
    },getNgoDataByNgoIdAndUserId:async(req,res)=>{
        try{
            const ngo_id = req.query.ngo_id
            const user_id = await tokenData(req,res)
            const getData = await NgolikesService.getDataByUserId(user_id,ngo_id)
            if (getData.length !== 0) {
                return res
                    .status(responseCode.OK)
                    .send(
                        commonResponse(
                            responseCode.OK,
                            responseConst.DATA_RETRIEVE_SUCCESS,
                            getData
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

export default NgoLikesController