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
import UserRequestStatsService from "../user_request_stats/user.request.stats.service.js";
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
                    currentData.Request_Ngo_Id = requestNgoMapping[0].Request_Ngo_Id
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
                        const allToken = [...getAllUserToken,...getTokenByRole]
                        const getRequestMedia = await RequestMediaService.getDataByRequestAndSequence(getOlderData.RequestId,1)
                        const notification_template = {created_by:tokenData(req,res),ngo_id:getOlderData.ngo_id,request_id:getOlderData.RequestId}
                        await sendTemplateNotification({templateKey:"Request-Ngo", templateData:template, userIds:allToken, metaData:{...notification_template,request_media:getRequestMedia[0].media_url ?? null}})
                        request_saved = true
                    }else{
                        request_error = true
                    }
                }
            }

            if (request_saved && !request_error && data.requestNgoList.length > 0) {
            const requestId = data.requestNgoList[0].RequestId;
            await RequestService.updateService(requestId, {
                status_id: STATUS_MASTER.REQUEST_APPROVAL_PENDINNG
            });
            }
            const getRequestData = await RequestService.getServiceById(data.requestNgoList[0].RequestId)
            if(getRequestData && getRequestData.length!==0){
                const updateData = await UserRequestStatsService.CreateOrUpdateData(getRequestData.request_user_id)
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
    },


    // updateStatusRequestNgoMaster:async(req,res)=>{
    //     try{
    //         const Request_Ngo_Id = req.query.Request_Ngo_Id
    //         const RequestId = req.body.RequestId
    //         const data = req.body
    //         const requestDetails = await RequestService.getServiceById(RequestId)
    //         // if(requestDetails.status_id==STATUS_MASTER.REQUEST_DRAFT){
    //         //     return res 
    //         //     .status(responseCode.BAD_REQUEST)
    //         //     .send(
    //         //     commonResponse(
    //         //         responseCode.BAD_REQUEST,
    //         //         responseConst.REQUEST_IS_INCOMPLETE,
    //         //         null,
    //         //         true
    //         //     )
    //         //     )  
    //         // }
    //         if(requestDetails.status_id==STATUS_MASTER.REQUEST_APPROVED || requestDetails.status_id==STATUS_MASTER.REQUEST_REJECTED){
    //             return res 
    //             .status(responseCode.BAD_REQUEST)
    //             .send(
    //             commonResponse(
    //                 responseCode.BAD_REQUEST,
    //                 responseConst.CANNOT_UPDATE_STATUS_CHECK_REQUEST,
    //                 null,
    //                 true
    //             )
    //             )  
    //         }
    //         const getDataByNgoRequest = await RequestNgoService.getServiceById(Request_Ngo_Id)
    //         let dataToStore = {}
    //         dataToStore.status_id = req.body.status_id
    //         console.log("data",data)
    //         console.log("getDataByNgoRequest",getDataByNgoRequest)
    //         const getNgoData = await NgoMasterService.getServiceById(getDataByNgoRequest.ngo_id) 
    //         if(parseInt(requestDetails.status_id)!==STATUS_MASTER.REQUEST_APPROVED && parseInt(data.status_id)==STATUS_MASTER.REQUEST_APPROVED){
    //             console.log("requestDetails.status_id------->Approved---->",requestDetails.status_id)

    //             let userActivityData = {}
    //             let UserMasterData = {}
    //             const ngoRequestCompleted = parseInt(getNgoData.total_request_completed) ?? 0 
    //             const getUserDataByUserId = await UserActivtyService.getDataByUserId(requestDetails.request_user_id)
    //             await addMetaDataWhileCreateUpdate(dataToStore, req, res, true);
    //             let total_bonus = 0
    //             const getTotalBonsRate = await BonusMasterService.getBonusMasterDataByCategoryStatus(BONUS_MASTER.REQUEST_ACCEPTED_ID,STATUS_MASTER.ACTIVE)
    //             if(getTotalBonsRate.length!==0){
    //                 total_bonus = parseFloat(getTotalBonsRate[0].create_score)
    //                 userActivityData.total_rewards_no = parseInt(getUserDataByUserId[0].total_rewards_no) + 1
    //                 userActivityData.total_scores_no = parseFloat(getUserDataByUserId[0].total_scores_no) + parseFloat(total_bonus)
    //                 UserMasterData.total_score = parseFloat(getUserDataByUserId[0].total_scores_no) + parseFloat(total_bonus)
    //             }else{
    //                 userActivityData.total_scores_no = parseFloat(getUserDataByUserId[0].total_scores_no)
    //                 UserMasterData.total_score = parseFloat(getUserDataByUserId[0].total_scores_no)
    //             }
    //             await addMetaDataWhileCreateUpdate(userActivityData, req, res, true);
    //             if(parseInt(req.body.status_id)==STATUS_MASTER.REQUEST_APPROVED){
    //                 const updaterequest = await RequestService.updateService(RequestId,{status_id:STATUS_MASTER.REQUEST_APPROVED,AssignedNGO:getDataByNgoRequest.ngo_id})
    //                 const updateUserActivity = await UserActivtyService.updateService(getUserDataByUserId[0].user_activity_id,userActivityData)
    //                 const gitScoreHistory = {
    //                     user_id:requestDetails.request_user_id,
    //                     git_score:total_bonus,
    //                     request_id:RequestId,
    //                     score_category_id:getTotalBonsRate[0].score_category_id,
    //                     description:`${getDataByNgoRequest.ngo_name} Accepted Your Request`,
    //                     date:currentTime(),
    //                     status_id:parseInt(req.body.status_id)
    //                 }
    //                 await addMetaDataWhileCreateUpdate(userActivityData, req, res, false);
    //                 const createGitScore  = await ScoreHistoryService.createService(gitScoreHistory)
    //             }
    //             const updateData = await RequestNgoService.updateService(Request_Ngo_Id,dataToStore)
    //             if (updateData === 0) {
    //                 return res
    //                     .status(responseCode.BAD_REQUEST)
    //                     .send(
    //                         commonResponse(
    //                             responseCode.BAD_REQUEST,
    //                             responseConst.ERROR_UPDATING_RECORD,
    //                             null,
    //                             true
    //                         )
    //                     );
    //             }
    //             const NgoMasterData = {
    //                 total_request_completed:(parseInt(ngoRequestCompleted) + 1 )
    //             }
    //             const updateNgo = await NgoMasterService.updateService(getDataByNgoRequest.ngo_id,NgoMasterData)
    //             const getOlderData = await RequestNgoService.getServiceById(Request_Ngo_Id)
    //             const template = await notificationTemplates.requestApproved({ngoName:getOlderData.ngo_name, requestName:getOlderData.RequestName})
    //             const userToken = await UserTokenService.GetTokensByUserIds(requestDetails.request_user_id)
    //             const AdminUserToken = await UserTokenService.getTokenByRoleId(ROLE_MASTER.ADMIN)
    //             const allUserToken = [...userToken,...AdminUserToken]
    //             const getRequestImage = await RequestMediaService.getDataByRequestAndSequence(RequestId,1)
    //             await sendTemplateNotification({templateKey:"Request-Approved", templateData:template, userIds:allUserToken, metaData:{created_by:tokenData(req,res),ngo_id:getOlderData.ngo_id,request_id:getOlderData.RequestId,ngo_logo_image:getDataByNgoRequest?.ngo_logo_path ?? null,request_media_url:getRequestImage[0]?.media_url ?? null}})
    //             const RequestupdateData = await UserRequestStatsService.CreateOrUpdateData(requestDetails.request_user_id)
    //             return res
    //                 .status(responseCode.CREATED)
    //                 .send(
    //                     commonResponse(
    //                         responseCode.CREATED,
    //                         responseConst.SUCCESS_UPDATING_RECORD
    //                     )
    //                 );
    //         }else if(parseInt(requestDetails.status_id)!==STATUS_MASTER.REQUEST_APPROVED && parseInt(data.status_id)==STATUS_MASTER.REQUEST_REJECTED){
    //             console.log("requestDetails.status_id------->Rejected---->",data.status_id)
    //             let ngoRequestRejected = getNgoData.total_request_rejected
    //             let dataToStore = {}
    //             dataToStore.status_id = req.body.status_id
    //             await addMetaDataWhileCreateUpdate(dataToStore, req, res, true);
    //             const updateData = await RequestNgoService.updateService(Request_Ngo_Id,dataToStore)
    //             if (updateData === 0) {
    //                 return res
    //                     .status(responseCode.BAD_REQUEST)
    //                     .send(
    //                         commonResponse(
    //                             responseCode.BAD_REQUEST,
    //                             responseConst.ERROR_UPDATING_RECORD,
    //                             null,
    //                             true
    //                         )
    //                     );
    //             }
    //             const getOlderData = await RequestNgoService.getServiceById(Request_Ngo_Id)
    //             const NgoMasterData = {
    //                 total_request_rejected:(parseInt(ngoRequestRejected) + 1 )
    //             }
    //             const RequestupdateData = await UserRequestStatsService.CreateOrUpdateData(requestDetails.request_user_id)
    //             const updateNgo = await NgoMasterService.updateService(getDataByNgoRequest.ngo_id,NgoMasterData)
    //             const template = await notificationTemplates.requestRejected({ngoName:getOlderData.ngo_name, requestName:getOlderData.RequestName})
    //             const UserToken = await UserTokenService.getTokenByRoleId(ROLE_MASTER.ADMIN)
    //             const getRequestImage = await RequestMediaService.getDataByRequestAndSequence(RequestId,1)
    //             await sendTemplateNotification({templateKey:"Request-Rejected", templateData:template, userIds:UserToken, metaData:{created_by:tokenData(req,res),ngo_id:getOlderData.ngo_id,request_id:getOlderData.RequestId,ngo_logo_path:getDataByNgoRequest.ngo_logo_path ?? null,
    //             request_media_url:getRequestImage[0]?.media_url ?? null}})
    //             return res
    //                 .status(responseCode.CREATED)
    //                 .send(
    //                     commonResponse(
    //                         responseCode.CREATED,
    //                         responseConst.SUCCESS_UPDATING_RECORD
    //                     )
    //                 );
    //         }else{
    //             return res
    //                 .status(responseCode.BAD_REQUEST)
    //                 .send(
    //                     commonResponse(
    //                         responseCode.BAD_REQUEST,
    //                         responseConst.NGO_ALREDY_ASSIGNED_TO_REQUEST,
    //                         null,
    //                         true
    //                     )
    //                 );
    //         }
    //     }catch(error){
    //         console.log("error",error)
    //         logger.error(`Error ---> ${error}`);
    //         return res
    //             .status(responseCode.INTERNAL_SERVER_ERROR)
    //             .send(
    //                 commonResponse(
    //                     responseCode.INTERNAL_SERVER_ERROR,
    //                     responseConst.INTERNAL_SERVER_ERROR,
    //                     null,
    //                     true
    //                 )
    //             );
    //     }
    // },

updateStatusRequestNgoMaster: async (req, res) => {
    try {
        const { Request_Ngo_Id } = req.query;
        const { RequestId, status_id } = req.body;
        const newStatus = parseInt(status_id);
        const currentUserId = tokenData(req, res);
        const metaDataUpdate = { modified_by: currentUserId, modified_at: new Date() };

        // 1. Checkpoint: Initial Data Fetch
        const [requestDetails, requestNgoDetails] = await Promise.all([
            RequestService.getServiceById(RequestId),
            RequestNgoService.getServiceById(Request_Ngo_Id)
        ]);

        if (!requestDetails || !requestNgoDetails) {
            return res.status(responseCode.NOT_FOUND).send(
                commonResponse(responseCode.NOT_FOUND, responseConst.NOT_FOUND, null, true)
            );
        }

        // Validation (Fail Fast)
        if (requestDetails.status_id == STATUS_MASTER.REQUEST_APPROVED || 
            requestDetails.status_id == STATUS_MASTER.REQUEST_REJECTED ||
            requestNgoDetails.status_id == STATUS_MASTER.REQUEST_REJECTED) {
            return res.status(responseCode.BAD_REQUEST).send(
                commonResponse(responseCode.BAD_REQUEST, responseConst.CANNOT_UPDATE_STATUS_CHECK_REQUEST, null, true)
            );
        }

        // 2. Checkpoint: Core Database Updates (Critical Records)
        const coreDbTasks = [];
        
        if (newStatus === STATUS_MASTER.REQUEST_APPROVED) {
            const [bonusRate, userActivity] = await Promise.all([
                BonusMasterService.getBonusMasterDataByCategoryStatus(BONUS_MASTER.REQUEST_ACCEPTED_ID, STATUS_MASTER.ACTIVE),
                UserActivtyService.getDataByUserId(requestDetails.request_user_id)
            ]);

            const bonusAmount = bonusRate.length > 0 ? parseFloat(bonusRate[0].create_score) : 0;
            const activity = userActivity[0];

            // User Score & Reward Updates
            if (activity) {
                coreDbTasks.push(UserActivtyService.UpdateUserDataCount(activity.user_id, 'total_rewards_no', 1));
                if (bonusAmount > 0) {
                    coreDbTasks.push(UserActivtyService.UpdateUserDataCount(activity.user_id, 'total_scores_no', bonusAmount));
                }
            }

            // NGO & Request Status Updates
            coreDbTasks.push(NgoMasterService.UpdateDataCount(requestNgoDetails.ngo_id, 'total_request_completed', 1));
            coreDbTasks.push(RequestService.updateService(RequestId, { 
                status_id: STATUS_MASTER.REQUEST_APPROVED, 
                AssignedNGO: requestNgoDetails.ngo_id,
                ...metaDataUpdate 
            }));

            // Score History
            coreDbTasks.push(ScoreHistoryService.createService({
                user_id: requestDetails.request_user_id,
                git_score: bonusAmount,
                request_id: RequestId,
                score_category_id: bonusRate[0]?.score_category_id || 0,
                description: `${requestNgoDetails.ngo_name} Accepted Your Request`,
                date: currentTime(),
                status_id: newStatus,
                created_by: currentUserId
            }));

        } else if (newStatus === STATUS_MASTER.REQUEST_REJECTED) {
            coreDbTasks.push(NgoMasterService.UpdateDataCount(requestNgoDetails.ngo_id, 'total_request_rejected', 1));
        }

        // Always update the specific Request-NGO link
        coreDbTasks.push(RequestNgoService.updateService(Request_Ngo_Id, { status_id: newStatus, ...metaDataUpdate }));

        // Execute Phase 1: Core Database Writes
        await Promise.all(coreDbTasks);

        // 3. Checkpoint: Secondary Updates (Stats & Counters)
        await UserRequestStatsService.CreateOrUpdateData(requestDetails.request_user_id);

        // 4. Checkpoint: Non-blocking Side Effects (Notifications)
        // We trigger this without 'await' if we want immediate response, or 'await' to be safe.
        (async () => {
            try {
                const isApproved = newStatus === STATUS_MASTER.REQUEST_APPROVED;
                
                const [userTokens, adminTokens, ngoTokens, requestMedia, freshUser] = await Promise.all([
                    UserTokenService.GetTokensByUserIds(requestDetails.request_user_id),
                    UserTokenService.getTokenByRoleId(ROLE_MASTER.ADMIN),
                    UserTokenService.getTokenByRoleIdInList([ROLE_MASTER.NGO, ROLE_MASTER.NGO_USER]),
                    RequestMediaService.getDataByRequestAndSequence(RequestId, 1),
                    UserActivtyService.getDataByUserId(requestDetails.request_user_id)
                ]);

                if (isApproved) {
                    const template = await notificationTemplates.requestApproved({ 
                        ngoName: requestNgoDetails.ngo_name, 
                        requestName: requestNgoDetails.RequestName 
                    });
                    const scoreTemplate = await notificationTemplates.RequestApprovedScoreUpdate({
                        username: freshUser[0]?.user_name || "User", 
                        total_score: freshUser[0]?.total_scores_no || 0
                    });
                    console.log("scoreTemplate",scoreTemplate)

                    await Promise.all([
                        sendTemplateNotification({
                            templateKey: "Request-Approved",
                            templateData: template,
                            userIds: [...userTokens, ...adminTokens, ...ngoTokens],
                            metaData:  {
                        created_by: currentUserId,
                        ngo_id: requestNgoDetails.ngo_id,
                        request_id: RequestId,
                        ngo_logo_image: requestNgoDetails.ngo_logo_path || null,
                        request_media_url: requestMedia[0]?.media_url || null
                    }
                        }),
                        sendTemplateNotification({
                            templateKey: "User Score Update",
                            templateData: scoreTemplate,
                            userIds: userTokens,
                            metaData: {
                        created_by: currentUserId,
                        ngo_id: requestNgoDetails.ngo_id,
                        request_id: RequestId,
                        ngo_logo_image: requestNgoDetails.ngo_logo_path || null,
                        request_media_url: requestMedia[0]?.media_url || null
                    }
                        })
                    ]);
                } 
            } catch (notifyErr) {
                logger.error(`Notification Error: ${notifyErr}`);
            }
        })();

        return res.status(responseCode.CREATED).send(
            commonResponse(responseCode.CREATED, responseConst.SUCCESS_UPDATING_RECORD)
        );

    } catch (error) {
        logger.error(`UpdateStatusRequestNgoMaster Error: ${error}`);
        return res.status(responseCode.INTERNAL_SERVER_ERROR).send(
            commonResponse(responseCode.INTERNAL_SERVER_ERROR, responseConst.INTERNAL_SERVER_ERROR, null, true)
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
                    if(getDataByNogId[i].status_id==STATUS_MASTER.REQUEST_REJECTED){
                        getDataByNogId[i] = {
                            ...currentData,
                            ...getDataByNogId[i],
                          }; 
                          getDataByNogId[i].request_media = await RequestMediaService.getDataByRequestIdByView(getDataByNogId[i].RequestId)
                    }else{
                    if(currentData && currentData.length!==0){
                        getDataByNogId[i] = {
                            ...getDataByNogId[i],
                            ...currentData,
                          }; 
                          getDataByNogId[i].request_media = await RequestMediaService.getDataByRequestIdByView(getDataByNogId[i].RequestId)
                    }
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