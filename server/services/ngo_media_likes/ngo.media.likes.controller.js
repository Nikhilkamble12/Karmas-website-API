import NgoMediaLikesService from "./ngo.media.likes.service.js";
import commonPath from "../../middleware/comman_path/comman.path.js";
import ngoMediaService from "../ngo_media/ngo.media.service.js";
const {commonResponse,responseCode,responseConst,logger,tokenData,currentTime,addMetaDataWhileCreateUpdate} = commonPath


const NgoMediaLikesController = {
    // Create A new Record 
    create: async (req, res) => {
        try {
            const data = req.body;
            // Add metadata for creation (created by, created at)
            await addMetaDataWhileCreateUpdate(data, req, res, false);
            const user_id = await tokenData(req,res)
            const getDataByNgoMediaAndUserId = await NgoMediaLikesService.getDataByNgoMediaIdAndUserId(data.ngo_media_id,user_id)
            if(getDataByNgoMediaAndUserId && getDataByNgoMediaAndUserId.length>0){
                if(getDataByNgoMediaAndUserId && getDataByNgoMediaAndUserId[0].is_like==false){
                    if(data.is_like == true){
                        const getNgoData = await ngoMediaService.getServiceById(data.ngo_media_id)
                        const total_likesCount = parseInt(getNgoData.total_likes ?? 0) + 1
                        const updateNgo = await ngoMediaService.updateService(data.ngo_media_id,{total_likes:total_likesCount})
                    }
                }else if(getDataByNgoMediaAndUserId && getDataByNgoMediaAndUserId[0].is_like==true){
                    if(data.is_like==false){
                        const getNgoData = await ngoMediaService.getServiceById(data.ngo_media_id)
                        const total_likesCount = parseInt(getNgoData.total_likes ?? 0) - 1
                        const updateNgo = await ngoMediaService.updateService(data.ngo_media_id,{total_likes:total_likesCount}) 
                    }
                }
                const updateNgoLikes = await NgoMediaLikesService.updateService(getDataByNgoMediaAndUserId[0].like_id,data)
            }
            // data.created_by=1,
            // data.created_at = new Date()
            // Create the record using ORM
            const createData = await NgoMediaLikesService.createService(data);
            if (createData) {
                if(data.is_like == true){
                    const getNgoMediaData = await ngoMediaService.getServiceById(data.ngo_media_id)
                    const total_likesCount = parseInt(getNgoMediaData.total_likes ?? 0) + 1
                    const updateNgo = await ngoMediaService.updateService(data.ngo_media_id,{total_likes:total_likesCount})
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
    }, 
    // update Record Into Db
    update: async (req, res) => {
        try {
            const id = req.query.id
            const data = req.body
            // Add metadata for modification (modified by, modified at)
            await addMetaDataWhileCreateUpdate(data, req, res, true);
            const getOlderData = await NgoMediaLikesService.getServiceById(id)
            if(getOlderData && getOlderData.is_like==false){
                    if(data.is_like == true){
                        const getNgoData = await ngoMediaService.getServiceById(data.ngo_media_id)
                        const total_likesCount = parseInt(getNgoData.total_likes ?? 0) + 1
                        const updateNgo = await ngoMediaService.updateService(data.ngo_media_id,{total_likes:total_likesCount})
                    }
                }else if(getOlderData && getOlderData.is_like==true){
                    if(data.is_like==false){
                        const getNgoData = await ngoMediaService.getServiceById(data.ngo_media_id)
                        const total_likesCount = parseInt(getNgoData.total_likes ?? 0) - 1
                        const updateNgo = await ngoMediaService.updateService(data.ngo_media_id,{total_likes:total_likesCount}) 
                    }
                }
            // Update the record using ORM
            const updatedRowsCount = await NgoMediaLikesService.updateService(id, data);
            // if (updatedRowsCount > 0) {
            //     const newData = await NgoMediaLikesService.getServiceById(id);
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
            const id = req.query.id
            // Delete data from the database
            const deleteData = await NgoMediaLikesService.deleteByid(id, req, res)
            // Also delete data from the JSON file
            // const deleteSatus=await CommanJsonFunction.deleteDataByField(CITY_FOLDER,CITY_JSON,"city_id",id)
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
            const getNgoData = await ngoMediaService.getServiceById(data.ngo_media_id)
            const total_likesCount = parseInt(getNgoData.total_likes ?? 0) - 1
            const updateNgo = await ngoMediaService.updateService(data.ngo_media_id,{total_likes:total_likesCount})
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
    },getNGoMediaLikeByNgoMediaId:async(req,res)=>{
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
    },createOrUpdateNgoMediaLike:async(req,res)=>{
        try{
            const data = req.body
            const user_id = await tokenData(req,res)
            const checkWetherDataIsPresent = await NgoMediaLikesService.getDataByNgoMediaIdAndUserId(data.ngo_media_id,user_id)
            const getDataByNgoMediaId = await ngoMediaService.getServiceById(data.ngo_media_id)
            let media_total_likes = parseInt(getDataByNgoMediaId.total_likes) ?? 0
            if(checkWetherDataIsPresent && checkWetherDataIsPresent.length>0){
                if(checkWetherDataIsPresent[0].is_liked==false){
                    if(data.is_like == true){
                       media_total_likes += 1 
                    }
                }else if(checkWetherDataIsPresent[0].is_liked==false){
                    if(data.is_like == false){
                        media_total_likes -= 1 
                    }
                }
            await addMetaDataWhileCreateUpdate(data, req, res, true);
                const UpdateData = await NgoMediaLikesService.updateService(checkWetherDataIsPresent[0].like_id,data)
                if (UpdateData === 0) {
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
            const updateNgoMedia = await ngoMediaService.updateService(data.ngo_media_id,{total_likes:media_total_likes})
            return res
                .status(responseCode.CREATED)
                .send(
                    commonResponse(
                        responseCode.CREATED,
                        responseConst.SUCCESS_UPDATING_RECORD
                    )
                );
            }else{
            await addMetaDataWhileCreateUpdate(data, req, res, false);
                const createData = await NgoMediaLikesService.createService(data)
                if (createData) {
                if(data.is_like == true){
                    media_total_likes += 1 
                }
                const updateNgoMedia = await ngoMediaService.updateService(data.ngo_media_id,{total_likes:media_total_likes})
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
    },getNgoMediaLikeByUserIdAndMediaId:async(req,res)=>{
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