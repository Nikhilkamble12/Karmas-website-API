import UserFollowingService from "./user.following.service.js";
import commonPath from "../../middleware/comman_path/comman.path.js";
import UserActivtyService from "../user_activity/user.activity.service.js";
const {commonResponse,responseCode,responseConst,logger,tokenData,currentTime,addMetaDataWhileCreateUpdate} = commonPath

const UserFollowingController = {
    // Create A new Record 
    create: async (req, res) => {
        try {
            const data = req.body;

            const getUserActivityByUser = await UserActivtyService.getDataByUserId(data.user_id)
            const getUserActivityByFollowingId = await UserActivtyService.getDataByUserId(data.following_user_id)
            let total_following_count = parseInt(getUserActivityByUser[0].following_no) ?? 0
            let total_followed_count = parseInt(getUserActivityByFollowingId[0].follower_no) ?? 0
            const checkWetherItIsPresent = await UserFollowingService.getDataByUserIdAndFollowId(data.user_id,data.following_user_id)
            if(checkWetherItIsPresent && checkWetherItIsPresent.length>0){
                if(checkWetherItIsPresent[0].is_following==false){
                    if(data.is_following){
                        total_following_count =  total_following_count + 1
                        total_followed_count = total_followed_count  + 1
                    }
                }else if(checkWetherItIsPresent[0].is_following==true){
                    if(data.is_following && data.is_following == false){
                        total_following_count = total_following_count - 1
                        total_followed_count = total_followed_count - 1
                    }
                }
                await addMetaDataWhileCreateUpdate(data, req, res, true);
                const updateUserActivity = await UserActivtyService.updateService(getUserActivityByUser[0].user_activity_id,{following_no:total_following_count})
                const updateUserActivityFollowed = await UserActivtyService.updateService(getUserActivityByFollowingId[0].user_activity_id,{follower_no:total_followed_count})
                const updateUserFollowing = await UserFollowingService.updateService(checkWetherItIsPresent[0].follow_id,data)
                if(updateUserFollowing>0){
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
                
            }
            // Add metadata for creation (created by, created at)
            await addMetaDataWhileCreateUpdate(data, req, res, false);
            if(data.is_following){
            total_following_count =  total_following_count + 1
            total_followed_count = total_followed_count  + 1
            }
            const updateUserActivity = await UserActivtyService.updateService(getUserActivityByUser[0].user_activity_id,{following_no:total_following_count})
            const updateUserActivityFollowed = await UserActivtyService.updateService(getUserActivityByFollowingId[0].user_activity_id,{follower_no:total_followed_count})
            // data.created_by=1,
            // data.created_at = new Date()
            // Create the record using ORM
            const createData = await UserFollowingService.createService(data);
            if (createData) {
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
    }, 
    // update Record Into Db
    update: async (req, res) => {
        try {
            const id = req.query.id
            const data = req.body
            // Add metadata for modification (modified by, modified at)
            await addMetaDataWhileCreateUpdate(data, req, res, true);
            const getOlderDatabyId = await UserFollowingService.getServiceById(id)
            const getUserActivityByUser = await UserActivtyService.getDataByUserId(data.user_id)
            const getUserActivityByFollowingId = await UserActivtyService.getDataByUserId(data.following_user_id)
            let total_following_count = parseInt(getUserActivityByUser[0].following_no) ?? 0
            let total_followed_count = parseInt(getUserActivityByFollowingId[0].follower_no) ?? 0
            if(getOlderDatabyId.is_following==false){
                    if(data.is_following){
                        total_following_count =  total_following_count + 1
                        total_followed_count = total_followed_count  + 1
                    }
                }else if(getOlderDatabyId.is_following==true){
                    if(data.is_following && data.is_following==false){
                        total_following_count = total_following_count - 1
                        total_followed_count = total_followed_count - 1
                    }
                }
            const updateUserActivity = await UserActivtyService.updateService(getUserActivityByUser[0].user_activity_id,{following_no:total_following_count})
            const updateUserActivityFollowed = await UserActivtyService.updateService(getUserActivityByFollowingId[0].user_activity_id,{follower_no:total_followed_count})

            // Update the record using ORM
            const updatedRowsCount = await UserFollowingService.updateService(id, data);
            // if (updatedRowsCount > 0) {
            //     const newData = await UserFollowingService.getServiceById(id);
            //     // Update the JSON data in the file
            //     await CommanJsonFunction.updateDataByField(CITY_FOLDER, CITY_JSON, "table_id", id, newData, CITY_VIEW_NAME);
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
                .status(responseCode.CREATED)
                .send(
                    commonResponse(
                        responseCode.CREATED,
                        responseConst.SUCCESS_UPDATING_RECORD
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
            const getAll = await UserFollowingService.getAllService()

            // const fileStatus=await CommanJsonFunction.checkFileExistence(CITY_FOLDER,CITY_JSON)
            // // Store the data in JSON for future retrieval
            // if(fileStatus==false){
            //   const DataToSave=await UserFollowingService.getAllService()
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
            // const getJsonDatabyId=await CommanJsonFunction.getFirstDataByField(CITY_FOLDER,CITY_JSON,"table_id",Id)
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
            const getDataByid = await UserFollowingService.getServiceById(Id)

            // const fileStatus=await CommanJsonFunction.checkFileExistence(CITY_FOLDER,CITY_JSON)
            // // Store the data in JSON for future retrieval
            // if(fileStatus==false){
            //   const DataToSave=await UserFollowingService.getAllService()
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
            const id = req.query.id
            // Delete data from the database
            const getOlderData = await UserFollowingService.getServiceById(id)
            if(getOlderData.is_following){
            const getUserActivityByUser = await UserActivtyService.getDataByUserId(data.user_id)
            const getUserActivityByFollowingId = await UserActivtyService.getDataByUserId(data.following_user_id)
            let total_following_count = parseInt(getUserActivityByUser[0].following_no) ?? 0
            let total_followed_count = parseInt(getUserActivityByFollowingId[0].follower_no) ?? 0
            total_following_count = total_following_count - 1
            total_followed_count = total_followed_count - 1
            const updateUserActivity = await UserActivtyService.updateService(getUserActivityByUser[0].user_activity_id,{following_no:total_following_count})
            const updateUserActivityFollowed = await UserActivtyService.updateService(getUserActivityByFollowingId[0].user_activity_id,{follower_no:total_followed_count})
            }
            const deleteData = await UserFollowingService.deleteByid(id, req, res)
            // Also delete data from the JSON file
            // const deleteSatus=await CommanJsonFunction.deleteDataByField(CITY_FOLDER,CITY_JSON,"table_id",id)
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
    },getDataByUserIdByview:async(req,res)=>{
        try{
            const user_id = req.query.user_id
            const getDatabyuserId = await UserFollowingService.getByUserId(user_id)
            if (getDatabyuserId.length !== 0) {
                return res
                    .status(responseCode.OK)
                    .send(
                        commonResponse(
                            responseCode.OK,
                            responseConst.DATA_RETRIEVE_SUCCESS,
                            getDatabyuserId
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
    },getDatabyFollowingUserId:async(req,res)=>{
        try{
            const following_user_id = req.query.following_user_id
            const getDataByFollowingUserId = await UserFollowingService.getDataByFollowingUserId(following_user_id)
            if (getDataByFollowingUserId.length !== 0) {
                return res
                    .status(responseCode.OK)
                    .send(
                        commonResponse(
                            responseCode.OK,
                            responseConst.DATA_RETRIEVE_SUCCESS,
                            getDataByFollowingUserId
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

export default UserFollowingController