import ScoreHistoryService from "./score.history.service.js";
import commonPath from "../../middleware/comman_path/comman.path.js";
import LocalJsonHelper from "../../utils/helper/local.json.helper.js";
import RequestMediaService from "../request_media/request.media.service.js";
const {commonResponse,responseCode,responseConst,logger,tokenData,currentTime,addMetaDataWhileCreateUpdate,TABLE_VIEW_FOLDER_MAP} = commonPath

const ScoreHistoryController = {
    // Create A new Record 
    create: async (req, res) => {
        try {
            const data = req.body;
            // Add metadata for creation (created by, created at)
            await addMetaDataWhileCreateUpdate(data, req, res, false);
            // data.created_by=1,
            // data.created_at = new Date()
            // Create the record using ORM
            const createData = await ScoreHistoryService.createService(data);
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

            // Update the record using ORM
            const updatedRowsCount = await ScoreHistoryService.updateService(id, data);
            // if (updatedRowsCount > 0) {
            //     const newData = await ScoreHistoryService.getServiceById(id);
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
            const getAll = await ScoreHistoryService.getAllService()

            // const fileStatus=await CommanJsonFunction.checkFileExistence(CITY_FOLDER,CITY_JSON)
            // // Store the data in JSON for future retrieval
            // if(fileStatus==false){
            //   const DataToSave=await ScoreHistoryService.getAllService()
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
            const getDataByid = await ScoreHistoryService.getServiceById(Id)

            // const fileStatus=await CommanJsonFunction.checkFileExistence(CITY_FOLDER,CITY_JSON)
            // // Store the data in JSON for future retrieval
            // if(fileStatus==false){
            //   const DataToSave=await ScoreHistoryService.getAllService()
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
            const deleteData = await ScoreHistoryService.deleteByid(id, req, res)
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
    },getDatabyuserId:async(req,res)=>{
        try{
            const user_id = req.query.id
            const getGitScoreHistory = await ScoreHistoryService.getSimpleScoreHistoryByUserId(user_id)
            if (getGitScoreHistory.length !== 0) {
                return res
                    .status(responseCode.OK)
                    .send(
                        commonResponse(
                            responseCode.OK,
                            responseConst.DATA_RETRIEVE_SUCCESS,
                            getGitScoreHistory
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
    },getScoreDashBordData:async(req,res)=>{
        try{
            const user_id = tokenData(req, res)
            const limit = req.query.limit
            // const fileName = `score/score_${limit}.json`;

             const jsonFileDetails = {
                view_name: null,
                folder_name: "score",
                json_file_name:`score_${limit}.json`
            };
            
            const localData = await LocalJsonHelper.getAll(jsonFileDetails,"60m");
            console.log("localData.length",localData.length)
            console.log("localData",localData)
            const cachedData = localData
            const getUserrank = await ScoreHistoryService.getUserRankByUserId(user_id)
            if (cachedData && cachedData.length!==0) {
                cachedData[0].topScorers.sort((a, b) => a.rank - b.rank);
                cachedData[0].user_rank = getUserrank
                return res
                    .status(responseCode.OK)
                    .send(
                        commonResponse(
                            responseCode.OK,
                            responseConst.DATA_RETRIEVE_SUCCESS,
                            cachedData
                        )
                    );
            }
            const getData = await ScoreHistoryService.getScoreDasHBoardDataByLimit(limit)
            if (getData.length !== 0) {
                 // Step 3: Save the data to local file cache
            // await LocalJsonHelper.set(fileName, null, getData, ttlMs);
             await LocalJsonHelper.save(jsonFileDetails,getData,null,null,true,null,"15d")
             getData.user_rank = getUserrank
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
    },getDataByUserIdScoreHistory:async(req,res)=>{
        try{
            const user_id = tokenData(req, res)
            const limit = req.query.limit
            const offset = req.query.offset
            const getScoreHistory = await ScoreHistoryService.getScoreHistoryByUserIdByView(user_id,limit,offset)
            for(let i = 0;i<getScoreHistory.length;i++){
                let currentData = getScoreHistory[i]
                if(currentData.request_id!==null && currentData.request_id!=="" && currentData.request_id!=="null" && currentData.request_id!==undefined && currentData.request_id!==0){
                    const getAnyOneRequestImage = await RequestMediaService.getAnyOneRequestMediaLink(currentData.request_id)
                    if(getAnyOneRequestImage && getAnyOneRequestImage!==null && getAnyOneRequestImage.length>0){
                        currentData.request_url = getAnyOneRequestImage[0].media_url
                    }else{
                        currentData.request_url = null
                    }
                }else{
                    currentData.request_url = null
                }
            }
            if (getScoreHistory.length !== 0) {
                const getUserrank = await ScoreHistoryService.getUserRankByUserId(user_id)
                for(let i = 0;i<getUserrank.length;i++){
                    const currentData = getUserrank[i]
                    if(currentData.file_path!==null && currentData.file_path!=="" && currentData.file_path!==undefined && currentData.file_path!=="null"){
                    currentData.file_path = `${process.env.GET_LIVE_CURRENT_URL}/resources/${currentData.file_path}`
                    }else{
                        currentData.file_path= null
                    }
                }
                const getApprovedRequestCount = await ScoreHistoryService.getCountofTotalRequestAcceptedByUserId(user_id);
                getUserrank[0].total_request_accepted = getApprovedRequestCount[0].total_accepted_requests || 0;
                 // Step 3: Save the data to local file cache
                 const mergedData = {
                    user_score_history : getScoreHistory,
                    user_rank :getUserrank
                 }
                return res
                    .status(responseCode.OK)
                    .send(
                        commonResponse(
                            responseCode.OK,
                            responseConst.DATA_RETRIEVE_SUCCESS,
                            mergedData
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
    },SearchUserScoreByUserName:async(req,res)=>{
        try{
            const user_name = req.query.user_name
            const limit = req.query.limit
            const offset = req.query.offset
            const getScoreHistory = await ScoreHistoryService.findScoreHistoryByUsername(user_name,limit,offset)
            //console.log("getScoreHistory",getScoreHistory)
            if (getScoreHistory && getScoreHistory.length > 0) {
           
            const rankDataList = await Promise.all(
                getScoreHistory.map(async (score) => {
                const getUserRank = await ScoreHistoryService.getUserRankByUserId(score.user_id);

                if (getUserRank && getUserRank.length > 0) {
                    const r = getUserRank[0]; 
                    return {
                        user_id: r.user_id,
                        user_name: r.user_name,
                        file_name: r.file_name,
                        file_path: r.file_path,
                        total_score: r.total_score,
                        rank: r.rank
                    };
                } else {
                    return null;
                }
                })
            );

            const uniqueRanks = Array.from(
                new Map(
                rankDataList.filter(Boolean).map((item) => [item.user_id, item])
                ).values()
            );

            return res
                .status(responseCode.OK)
                .send(
                commonResponse(
                    responseCode.OK,
                    responseConst.DATA_RETRIEVE_SUCCESS,
                    uniqueRanks
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
    },getScoreHistoryByName:async(req,res)=>{
        try{
            const user_name = req.query.user_name
            const getData = await ScoreHistoryService.SearchUserByName(user_name)
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
    }, getTopScorersFromCache: async (req, res) => {
    try {
        const limit = 10;

        // Validate limit
        if (isNaN(limit) || limit < 1 || limit > 100) {
            return res
                .status(responseCode.BAD_REQUEST)
                .send(
                    commonResponse(
                        responseCode.BAD_REQUEST,
                        "Limit must be between 1 and 100",
                        null,
                        true
                    )
                );
        }

        // Define JSON file details
        const jsonFileDetails = {
            view_name: null,
            folder_name: "score",
            json_file_name: `score_${limit}.json`
        };

        // Try to get data from local cache
        const cachedData = await LocalJsonHelper.getAll(jsonFileDetails, "60m");

        if (cachedData && cachedData.topScorers && cachedData.topScorers.length > 0) {
            // Sort by rank
            const sortedScorers = cachedData.topScorers.sort((a, b) => a.rank - b.rank);

            // Format file paths
            const baseUrl = process.env.GET_LIVE_CURRENT_URL;
            const formattedScorers = sortedScorers.map(scorer => ({
                ...scorer,
                file_path: scorer.file_path && 
                          scorer.file_path !== "" && 
                          scorer.file_path !== "null"
                    ? `${baseUrl}/resources/${scorer.file_path}`
                    : null
            }));

            const response = {
                topScorers: formattedScorers,
                cached: true,
                total: formattedScorers.length
            };

            return res
                .status(responseCode.OK)
                .send(
                    commonResponse(
                        responseCode.OK,
                        responseConst.DATA_RETRIEVE_SUCCESS,
                        response
                    )
                );
        }

        // If cache miss, fetch from database
        const getData = await ScoreHistoryService.getScoreDasHBoardDataByLimit(limit);

        if (!getData || getData.length === 0) {
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

        // Save to cache for future requests
        await LocalJsonHelper.save(
            jsonFileDetails,
            getData,
            null,
            null,
            true,
            null,
            "15d"
        );

        const response = {
            topScorers: getData.topScorers || getData,
            cached: false,
            total: getData.topScorers ? getData.topScorers.length : getData.length
        };

        return res
            .status(responseCode.OK)
            .send(
                commonResponse(
                    responseCode.OK,
                    responseConst.DATA_RETRIEVE_SUCCESS,
                    response
                )
            );

    } catch (error) {
        console.log("error", error);
        logger.error(`Error in getTopScorersFromCache: ${error}`);
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

export default ScoreHistoryController