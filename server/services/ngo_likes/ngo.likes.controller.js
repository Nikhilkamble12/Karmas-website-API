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
            data.user_id = await tokenData(req, res);

            const existingLike = await NgolikesService.getDataByUserId(data.user_id, data.ngo_id);

            if (existingLike && existingLike.length > 0) {
                const oldLike = existingLike[0];

                // ---- Case 1: Toggling from dislike -> like ----
                if (!oldLike.is_liked && data.is_liked) {
                    const getNgoData = await NgoMasterService.getServiceById(data.ngo_id);
                    const totalLikes = parseInt(getNgoData.total_ngo_likes ?? 0) + 1;
                    await NgoMasterService.updateService(data.ngo_id, { total_ngo_likes: totalLikes });
                }

                // ---- Case 2: Toggling from like -> dislike ----
                if (oldLike.is_liked && !data.is_liked) {
                    const getNgoData = await NgoMasterService.getServiceById(data.ngo_id);
                    const totalLikes = Math.max(0, parseInt(getNgoData.total_ngo_likes ?? 0) - 1);
                    await NgoMasterService.updateService(data.ngo_id, { total_ngo_likes: totalLikes });
                }

                // ---- Update the like record itself ----
                await NgolikesService.updateService(oldLike.like_id, data);

                return res
                    .status(responseCode.OK)
                    .send(
                        commonResponse(
                            responseCode.OK, 
                            responseConst.SUCCESS_UPDATING_RECORD
                        )
                );
            } 
            // ---- New like entry ----
            else {
                await addMetaDataWhileCreateUpdate(data, req, res, false);

                const createData = await NgolikesService.createService(data);

                // Increment total likes if this is a like
                if (createData && data.is_liked) {
                    const getNgoData = await NgoMasterService.getServiceById(data.ngo_id);
                    const totalLikes = parseInt(getNgoData.total_ngo_likes ?? 0) + 1;
                    await NgoMasterService.updateService(data.ngo_id, { total_ngo_likes: totalLikes });
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

    // update Record Into Db
    /* update: async (req, res) => {
        try {
            const id = req.query.id
            const data = req.body
            // Add metadata for modification (modified by, modified at)
            await addMetaDataWhileCreateUpdate(data, req, res, true);
            const getOlderData = await NgolikesService.getServiceById(id)
            if(getOlderData && getOlderData.is_like==false){
                if(data.is_like == true){
                    const getNgoData = await NgoMasterService.getServiceById(data.ngo_id)
                    const total_likesCount = parseInt(getNgoData.total_ngo_likes ?? 0) + 1 
                    const updateNgo = await NgoMasterService.updateService(data.ngo_id,{total_ngo_likes:total_likesCount})
                }
            }else if(getOlderData && getOlderData.is_like==true){
                if(data.is_like==false){
                    const getNgoData = await NgoMasterService.getServiceById(data.ngo_id)
                    const total_likesCount = parseInt(getNgoData.total_ngo_likes ?? 0) - 1 
                    const updateNgo = await NgoMasterService.updateService(data.ngo_id,{total_ngo_likes:total_likesCount}) 
                }
            }
            // Update the record using ORM
            const updatedRowsCount = await NgolikesService.updateService(id, data);
            // if (updatedRowsCount > 0) {
            //     const newData = await NgolikesService.getServiceById(id);
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
    }, */
    update: async (req, res) => {
        try {
            const id = req.query.id;
            const data = req.body;

            // Add metadata for modification (modified by, modified at)
            await addMetaDataWhileCreateUpdate(data, req, res, true);

            const getOlderData = await NgolikesService.getServiceById(id);

            if (getOlderData && !getOlderData.is_liked) {
                // ---- Case: dislike -> like ----
                if (data.is_liked) {
                    const getNgoData = await NgoMasterService.getServiceById(data.ngo_id);
                    const total_likesCount = parseInt(getNgoData.total_ngo_likes ?? 0) + 1;
                    await NgoMasterService.updateService(data.ngo_id, { total_ngo_likes: total_likesCount });
                }
            } else if (getOlderData && getOlderData.is_liked) {
                // ---- Case: like -> dislike ----
                if (!data.is_liked) {
                    const getNgoData = await NgoMasterService.getServiceById(data.ngo_id);
                    const total_likesCount = Math.max(0, parseInt(getNgoData.total_ngo_likes ?? 0) - 1);
                    await NgoMasterService.updateService(data.ngo_id, { total_ngo_likes: total_likesCount });
                }
            }

            // ---- Update the like record itself ----
            const updatedRowsCount = await NgolikesService.updateService(id, data);

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
            const id = req.query.id
            // Delete data from the database
            const likeData = await NgolikesService.getServiceById(id);
            if (!likeData) {
                return res
                    .status(responseCode.NOT_FOUND)
                    .send(
                        commonResponse(
                            responseCode.NOT_FOUND,
                            "Like record not found.",
                            null,
                            true
                        )
                    );
            }
            const deleteData = await NgolikesService.deleteByid(id, req, res)
            
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
            if(likeData && likeData.is_liked == true){
            const getNgoData = await NgoMasterService.getServiceById(likeData.ngo_id)
            const total_likesCount = Math.max(parseInt(getNgoData.total_ngo_likes ?? 0) - 1)
            const updateNgo = await NgoMasterService.updateService(likeData.ngo_id,{total_ngo_likes:total_likesCount}) 
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
    },getDataByNgoIdlike:async(req,res)=>{
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