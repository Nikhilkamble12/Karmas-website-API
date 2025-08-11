import RequestNgoService from "./request.ngo.service.js";
import commonPath from "../../middleware/comman_path/comman.path.js";
import RequestService from "../requests/requests.service.js";
import BonusMasterService from "../bonus_master/bonus.master.service.js";
import { BONUS_MASTER, ROLE_MASTER, STATUS_MASTER } from "../../utils/constants/id_constant/id.constants.js";
import UserMasterService from "../user_master/user.master.service.js";
import UserActivtyService from "../user_activity/user.activity.service.js";
import ScoreHistoryService from "../score_history/score.history.service.js";
import RequestMediaService from "../request_media/request.media.service.js";
import notificationTemplates from "../../utils/helper/notification.templates.js";
import UserTokenService from "../user_tokens/user.tokens.service.js";
import sendTemplateNotification from "../../utils/helper/firebase.push.notification.js";
import NgoMasterService from "../ngo_master/ngo.master.service.js";
const {commonResponse,responseCode,responseConst,logger,tokenData,currentTime,addMetaDataWhileCreateUpdate} = commonPath

const RequestNgoController = {
    // Create A new Record 
    create: async (req, res) => {
        try {
            const data = req.body;
            // Add metadata for creation (created by, created at)
            await addMetaDataWhileCreateUpdate(data, req, res, false);
            // data.created_by=1,
            // data.created_at = new Date()
            // Create the record using ORM
            const createData = await RequestNgoService.createService(data);
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
            const updatedRowsCount = await RequestNgoService.updateService(id, data);
            // if (updatedRowsCount > 0) {
            //     const newData = await RequestNgoService.getServiceById(id);
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
            const getAll = await RequestNgoService.getAllService()

            // const fileStatus=await CommanJsonFunction.checkFileExistence(CITY_FOLDER,CITY_JSON)
            // // Store the data in JSON for future retrieval
            // if(fileStatus==false){
            //   const DataToSave=await RequestNgoService.getAllService()
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
            const getDataByid = await RequestNgoService.getServiceById(Id)

            // const fileStatus=await CommanJsonFunction.checkFileExistence(CITY_FOLDER,CITY_JSON)
            // // Store the data in JSON for future retrieval
            // if(fileStatus==false){
            //   const DataToSave=await RequestNgoService.getAllService()
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
            const deleteData = await RequestNgoService.deleteByid(id, req, res)
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
    },createUpdateRequestNgo :async(req,res)=>{
        try{
            const data = req.body
            let request_saved = false
            let request_error = false
            for(let i = 0 ;i<data.requestNgoList.length;i++){
                const currentData = data.requestNgoList[i]
                const requestNgoMapping = await RequestNgoService.getRequestAndNGoData(currentData.ngo_id,currentData.RequestId)
                const GetNgoDetails = await NgoMasterService.getServiceById(currentData.ngo_id)
                let Total_request_Assigned = parseInt(GetNgoDetails.total_request_assigned) ?? 0
                if(requestNgoMapping && requestNgoMapping.length>0){
                    await addMetaDataWhileCreateUpdate(currentData, req, res, true);
                    const updateRequestNgo = await RequestNgoService.updateService(requestNgoMapping[0].Request_Ngo_Id,currentData)
                    if(updateRequestNgo>0){
                        request_saved = true
                    }else{
                        request_error = true
                    }
                }else{
                    await addMetaDataWhileCreateUpdate(currentData, req, res, false);
                    currentData.status_id = STATUS_MASTER.REQUEST_APPROVAL_PENDINNG
                    
                    const createRequestNgo = await RequestNgoService.createService(currentData)
                    if(createRequestNgo){
                        Total_request_Assigned += 1
                        const NgoMasterData = {
                            total_request_assigned:Total_request_Assigned
                        }
                        const updateNgo = await NgoMasterService.updateService(currentData.ngo_id,NgoMasterData)
                        const getOlderData = await RequestNgoService.getServiceById(createRequestNgo.dataValues.Request_Ngo_Id) 
                        const template = await notificationTemplates.newRequestForNgo({requestName :getOlderData.RequestName,requesterName:getOlderData.user_name})
                        const getUserByNgoId = await UserMasterService.getUserByNgoId(getOlderData.ngo_id)
                        const userIds = getUserByNgoId.map(user => user.user_id);
                        console.log("userIds",userIds)
                        let getAllUserToken = []
                        if(userIds.length>0){
                          getAllUserToken = await UserTokenService.GetTokensByUserIds(userIds)
                        }
                        
                        const getTokenByRole = await UserTokenService.getTokenByRoleId(ROLE_MASTER.ADMIN)
                        const allToken =[...getAllUserToken,...getTokenByRole]
                        await sendTemplateNotification({templateKey:"Request-Ngo", templateData:template, userIds:allToken, metaData:{created_by:tokenData(req,res),ngo_id:getOlderData.ngo_id,request_id:getOlderData.RequestId}})
                        request_saved = true
                    }else{
                        request_error = true
                    }
                }
            }
            if (request_saved && !request_error) {
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
    },updateStatusRequestNgoMaster:async(req,res)=>{
        try{
            const Request_Ngo_Id = req.query.Request_Ngo_Id
            const RequestId = req.body.RequestId
            const requestDetails = await RequestService.getServiceById(RequestId)
            const getDataByNgoRequest = await RequestNgoService.getServiceById(Request_Ngo_Id)
            let dataToStore = {}
            dataToStore.status_id = req.body.status_id
            const getNgoData = await NgoMasterService.getServiceById(getDataByNgoRequest.ngo_id)
             total_request_assigned, total_request_completed, total_request_rejected    
            if(parseInt(requestDetails.status_id)==STATUS_MASTER.REQUEST_APPROVED){
                let userActivityData = {}
                const ngoRequestCompleted = parseInt(getNgoData.total_request_completed) ?? 0 
                const getUserDataByUserId = await UserActivtyService.getDataByUserId(requestDetails[0].request_user_id)
                await addMetaDataWhileCreateUpdate(dataToStore, req, res, true);
                let total_bonus = 0
                const getTotalBonsRate = await BonusMasterService.getBonusMasterDataByCategoryStatus(BONUS_MASTER.REQUEST_ACCEPTED_ID,STATUS_MASTER.ACTIVE)
                if(getTotalBonsRate.length!==0){
                    total_bonus = parseFloat(getTotalBonsRate[0].create_score)
                    userActivityData.total_rewards_no = parseInt(getUserDataByUserId[0].total_rewards_no) + 1
                    userActivityData.total_scores_no = parseFloat(getUserDataByUserId[0].total_scores_no) + parseFloat(total_bonus)
                }else{
                    userActivityData.total_scores_no = parseFloat(getUserDataByUserId[0].total_scores_no)
                }
                await addMetaDataWhileCreateUpdate(userActivityData, req, res, true);
                if(parseInt(req.body.status_id)==STATUS_MASTER.REQUEST_APPROVED){
                    const updaterequest = await RequestService.updateService(RequestId,{status_id:8,AssignedNGO:getDataByNgoRequest.ngo_id})
                    const updateUserActivity = await UserActivtyService.updateService(getUserDataByUserId[0].user_activity_id,userActivityData)
                    const gitScoreHistory = {
                        user_id:request_user_id,
                        git_score:total_bonus,
                        request_id:RequestId,
                        score_category_id:getTotalBonsRate[0].score_category_id,
                        description:`${getDataByNgoRequest[0].ngo_name} Accepted Your Request`,
                        date:currentTime(),
                        status_id:req.body.status_id
                    }
                    await addMetaDataWhileCreateUpdate(userActivityData, req, res, false);
                    const createGitScore  = await ScoreHistoryService.createService(gitScoreHistory)
                }
                const updateData = await RequestNgoService.updateService(Request_Ngo_Id,dataToStore)
                if (updateData === 0) {
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
                const NgoMasterData = {
                    total_request_completed:(parseInt(ngoRequestCompleted) + 1 )
                }
                const updateNgo = await NgoMasterService.updateService(currentData.ngo_id,NgoMasterData)
                const getOlderData = await RequestNgoService.getServiceById(Request_Ngo_Id)
                const template = await notificationTemplates.requestApproved({ngoName:getOlderData.ngo_name, requestName:getOlderData.RequestName})
                const userToken = await UserTokenService.GetTokensByUserIds(requestDetails.request_user_id)
                const AdminUserToken = await UserTokenService.getTokenByRoleId(ROLE_MASTER.ADMIN)
                const allUserToken = [...userToken,...AdminUserToken]
                await sendTemplateNotification({templateKey:"Request-Rejected", templateData:template, userIds:allUserToken, metaData:{created_by:tokenData(req,res),ngo_id:getOlderData.ngo_id,request_id:getOlderData.RequestId}})
                return res
                    .status(responseCode.CREATED)
                    .send(
                        commonResponse(
                            responseCode.CREATED,
                            responseConst.SUCCESS_UPDATING_RECORD
                        )
                    );
            }else if(requestDetails.status_id!==STATUS_MASTER.REQUEST_REJECTED){
                let ngoRequestRejected = getNgoData.total_request_rejected
                let dataToStore = {}
                dataToStore.status_id = req.body.status_id
                await addMetaDataWhileCreateUpdate(dataToStore, req, res, true);
                const updateData = await RequestNgoService.updateService(Request_Ngo_Id,dataToStore)
                if (updateData === 0) {
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
                const getOlderData = await RequestNgoService.getServiceById(Request_Ngo_Id)
                const NgoMasterData = {
                    total_request_rejected:(parseInt(ngoRequestRejected) + 1 )
                }
                const updateNgo = await NgoMasterService.updateService(currentData.ngo_id,NgoMasterData)
                const template = await notificationTemplates.requestRejected({ngoName:getOlderData.ngo_name, requestName:getOlderData.RequestName})
                const UserToken = await UserTokenService.getTokenByRoleId(ROLE_MASTER.ADMIN)
                await sendTemplateNotification({templateKey:"Request-Rejected", templateData:template, userIds:UserToken, metaData:{created_by:tokenData(req,res),ngo_id:getOlderData.ngo_id,request_id:getOlderData.RequestId}})
                return res
                    .status(responseCode.CREATED)
                    .send(
                        commonResponse(
                            responseCode.CREATED,
                            responseConst.SUCCESS_UPDATING_RECORD
                        )
                    );
            }else{
                return res
                    .status(responseCode.BAD_REQUEST)
                    .send(
                        commonResponse(
                            responseCode.BAD_REQUEST,
                            responseConst.NGO_ALREDY_ASSIGNED_TO_REQUEST,
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
    // Below is code to get all request for the Ngo Data
    getAllNgoRequestLiveStatusWise:async(req,res)=>{
        try{
            const ngo_id = req.query.ngo_id
            const offset = req.query.offset
            const limit = req.query.limit
            const status_id = req.query.status_id
            if(!ngo_id || ngo_id=="" || ngo_id=="null" || ngo_id=="undefined"){
                return res
                    .status(responseCode.BAD_REQUEST)
                    .send(
                        commonResponse(
                            responseCode.BAD_REQUEST,
                            responseConst.NGO_ID_REQUIRED,
                            null,
                            true
                        )
                    );
            }
            const getDataByNogId = await RequestNgoService.getAllByFilterByNgoId(ngo_id, offset, limit , status_id)
            if(getDataByNogId && getDataByNogId.length>0){
                for(let i = 0;i< getDataByNogId.length ;i++){
                    let currentData = await RequestService.getServiceById(getDataByNogId[i].RequestId)
                    if(currentData && currentData.length!==0){
                        getDataByNogId[i] = {
                            ...currentData, // assuming currentData is an array with one object
                            ...getDataByNogId[i],
                          }; 
                          getDataByNogId[i].request_media = await RequestMediaService.getDataByRequestIdByView(getDataByNogId[i].RequestId)
                    }
                }
                return res
                    .status(responseCode.OK)
                    .send(
                        commonResponse(
                            responseCode.OK,
                            responseConst.DATA_RETRIEVE_SUCCESS,
                            getDataByNogId
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
    } 
}
export default RequestNgoController