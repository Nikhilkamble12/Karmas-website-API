import RequestService from "./requests.service.js";
import commonPath from "../../middleware/comman_path/comman.path.js";
import NgoMasterService from "../ngo_master/ngo.master.service.js";
import NgoStateDistrictMappingService from "../ngo_state_district_mapping/ngo.state.district.mapping.service.js";
import RequestNgoService from "../request_ngo/request.ngo.service.js";
import { STATUS_MASTER } from "../../utils/constants/id_constant/id.constants.js";
import RequestMediaService from "../request_media/request.media.service.js";
import UserActivtyService from "../user_activity/user.activity.service.js";
import notificationTemplates from "../../utils/helper/notification.templates.js";
import UserTokenService from "../user_tokens/user.tokens.service.js";
import sendTemplateNotification from "../../utils/helper/firebase.push.notification.js";
import UserRequestStatsService from "../user_request_stats/user.request.stats.service.js";
import RequestTagService from "../request_tag/request.tag.service.js";
const {commonResponse,responseCode,responseConst,logger,tokenData,currentTime,addMetaDataWhileCreateUpdate} = commonPath

const RequestsController = {
    // Create A new Record 
    create: async (req, res) => {
        try {
            const data = req.body;
            // Add metadata for creation (created by, created at)
            await addMetaDataWhileCreateUpdate(data, req, res, false);
            // data.created_by=1,
            // data.created_at = new Date()
            // Create the record using ORM
            if(data.request_user_id == null  || data.request_user_id == "" || data.request_user_id == undefined || data.request_user_id == 0){
                data.request_user_id = tokenData(req,res)
                const getUserActivityData = await UserActivtyService.getDataByUserId(tokenData(req,res))
                const totalRequest = parseInt(getUserActivityData[0].total_requests_no) + 1
                const updateUserActivity = await UserActivtyService.updateService(getUserActivityData[0].user_activity_id,{total_requests_no:totalRequest})
            }
            // const template = notificationTemplates.requestReceivedForEvaluation({requestName:data.RequestName})
            data.status_id = STATUS_MASTER.REQUEST_DRAFT
            const createData = await RequestService.createService(data);

            if (createData) {
               const UserReqest = await UserRequestStatsService.CreateOrUpdateData(data.request_user_id)
                // const getUserById = await UserTokenService.GetTokensByUserIds(data.request_user_id)
                // const sendNotifiction = await sendTemplateNotification({templateKey:"Request-Notification",templateData:template,userIds:getUserById,metaData:{request_id:createData.dataValues.RequestId,created_by:tokenData(req,res)}})
                return res
                    .status(responseCode.CREATED)
                    .send(
                        commonResponse(
                            responseCode.CREATED,
                            responseConst.SUCCESS_ADDING_RECORD,
                            createData
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
            const getRequestById = await RequestService.getServiceById(id)
            if(getRequestById.status_id==STATUS_MASTER.REQUEST_DRAFT && getRequestById.request_user_id !== tokenData(req,res)){
                return res 
                .status(responseCode.BAD_REQUEST)
                .send(
                commonResponse(
                    responseCode.BAD_REQUEST,
                    responseConst.REQUEST_IS_INCOMPLETE,
                    null,
                    true
                )
            )
            }
            // Update the record using ORM
            const updatedRowsCount = await RequestService.updateService(id, data);
            // if (updatedRowsCount > 0) {
            //     const newData = await RequestService.getServiceById(id);
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
            const getAll = await RequestService.getAllService()

            // const fileStatus=await CommanJsonFunction.checkFileExistence(CITY_FOLDER,CITY_JSON)
            // // Store the data in JSON for future retrieval
            // if(fileStatus==false){
            //   const DataToSave=await RequestService.getAllService()
            //   if(DataToSave.length!==0){
            //     await CommanJsonFunction.storeData( CITY_FOLDER, CITY_JSON, DataToSave, null, CITY_VIEW_NAME)
            //   }
            // }
            // Return fetched data or handle case where no data is found
            // await Promise.all(getAll.map(async(currentData)=> {
            //     const getTaggedUsers = await RequestTagService.getAllTagByRequestd(currentData.RequestId)
            //     currentData.tagged_users = getTaggedUsers
            // }))

            // 1️⃣ Extract all RequestIds
            const requestIds = getAll.map(item => item.RequestId);

            // 2️⃣ Fetch all tags for these RequestIds in one go
            const allTags = await RequestTagService.getAllTagsByMultipleRequestIds(requestIds);

            // 3️⃣ Group tags by RequestId
            const tagsByRequest = allTags.reduce((acc, tag) => {
            if (!acc[tag.request_id]) acc[tag.request_id] = [];
            acc[tag.request_id].push(tag);
            return acc;
            }, {});

            // 4️⃣ Assign tags to each request
            for (const currentData of getAll) {
            currentData.tagged_users = tagsByRequest[currentData.RequestId] || [];
            }


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
            const getDataByid = await RequestService.getServiceById(Id)
            const getRequestMedia = await RequestMediaService.getDataByRequestIdByView(Id)
            getDataByid.request_media = getRequestMedia
            const getTagedUsers = await RequestTagService.getAllTagByRequestd(Id)
            getDataByid.tagged_users = getTagedUsers
            // const fileStatus=await CommanJsonFunction.checkFileExistence(CITY_FOLDER,CITY_JSON)
            // // Store the data in JSON for future retrieval
            // if(fileStatus==false){
            //   const DataToSave=await RequestService.getAllService()
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
    // Delete A Record 
    deleteData: async (req, res) => {
        try {
            const id = req.query.id
            // Delete data from the database
            const getDataById = await RequestService.getServiceById(id)
            if(getDataById.status_id == STATUS_MASTER.REQUEST_APPROVAL_PENDINNG || getDataById.status_id == STATUS_MASTER.REQUEST_REJECTED){
                return res
                    .status(responseCode.BAD_REQUEST)
                    .send(
                        commonResponse(
                            responseCode.BAD_REQUEST,
                            responseConst.CANNOT_DELETE_REQUEST_AT_THIS_STAGE,
                            null,
                            true
                        )
                    );
            }
            const getUserActivityData = await UserActivtyService.getDataByUserId(getDataById.request_user_id)
            const updateUserActivityData = await UserActivtyService.updateService(getUserActivityData[0].user_activity_id,{total_requests_no:parseInt(getUserActivityData[0].total_requests_no) - 1})
            const deleteData = await RequestService.deleteByid(id, req, res)

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
            if(getDataById.AssignedNGO && getDataById.AssignedNGO!==null && getDataById.AssignedNGO!==0){
                const recalculate = await RequestNgoService.getRequestNgoCountByNgo(getDataById.AssignedNGO)
                const updateNgo = await NgoMasterService.updateService(getDataById.AssignedNGO,{total_request_assigned:recalculate[0].total_ngo_request,total_request_completed:recalculate[0].total_request_approved_status,total_request_rejected:recalculate[0].total_request_rejected})
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
    },getRequestByUserId:async(req,res)=>{
        try{
            const user_id = req.query.id
            const limit = req.query.limit
            const offset = req.query.offset
            const getAllRequestByUserId = await RequestService.getAllRequestByUserId(user_id,limit,offset)
            if (getAllRequestByUserId.length !== 0) {
                for(let i = 0;i<getAllRequestByUserId.length;i++){
                    let currentData = getAllRequestByUserId[i]
                    const getRequestMedia = await RequestMediaService.getDataByRequestIdByView(currentData.RequestId)
                    currentData.request_media = getRequestMedia
                }
                return res
                    .status(responseCode.OK)
                    .send(
                        commonResponse(
                            responseCode.OK,
                            responseConst.DATA_RETRIEVE_SUCCESS,
                            getAllRequestByUserId
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
    },getNgoRequstDataForMapping:async(req,res)=>{
        try{
            const request_id = req.query.RequestId
            let fullData = []
            let ngoIds = []
            const getRequestData = await RequestService.getServiceById(request_id)
            let getDataByCityId = []
            let getDataByStateId = []
            let getAllDataByDistrictid = []

            if(getRequestData.CityId){
            getDataByCityId = await NgoStateDistrictMappingService.getAllNgoDataByCityId(getRequestData.CityId)
            if(getDataByCityId.length>0){
                for(let i=0;i<getDataByCityId.length;i++){
                    const CurrentData = getDataByCityId[i]
                    const NgoData = {
                        Request_Ngo_Id:null,
                        ngo_id:CurrentData.ngo_id,
                        ngo_name:CurrentData.ngo_name,
                        unique_id:CurrentData.unique_id,
                        ngo_type_name:CurrentData.ngo_type_name,
                        darpan_reg_date:CurrentData.darpan_reg_date,
                        registration_no:CurrentData.registration_no,
                        email:CurrentData.email,
                        mobile_no:CurrentData.mobile_no,
                        status_id:null
                    }
                    fullData.push(NgoData)
                    ngoIds.push(CurrentData.ngo_id)
                }
            }
            }
            if(getRequestData.districtId){
            getAllDataByDistrictid = await NgoStateDistrictMappingService.getAllNgoDataByDistrictId(getRequestData.districtId,ngoIds)
            if( getAllDataByDistrictid.length>0){
                for(let i=0;i<getAllDataByDistrictid.length;i++){
                    const CurrentData = getAllDataByDistrictid[i]
                    const NgoData = {
                        Request_Ngo_Id:null,
                        ngo_id:CurrentData.ngo_id,
                        ngo_name:CurrentData.ngo_name,
                        unique_id:CurrentData.unique_id,
                        ngo_type_name:CurrentData.ngo_type_name,
                        darpan_reg_date:CurrentData.darpan_reg_date,
                        registration_no:CurrentData.registration_no,
                        email:CurrentData.email,
                        mobile_no:CurrentData.mobile_no,
                        status_id:null
                    }
                    fullData.push(NgoData)
                    ngoIds.push(CurrentData.ngo_id)
                }
            }
            }
            if(getRequestData.StateId){
            getDataByStateId = await NgoStateDistrictMappingService.getAllNgoDataByStateId(getRequestData.StateId,ngoIds)
            if( getDataByStateId.length>0){
                for(let i=0;i<getDataByStateId.length;i++){
                    const CurrentData = getDataByStateId[i]
                    const NgoData = {
                        Request_Ngo_Id:null,
                        ngo_id:CurrentData.ngo_id,
                        ngo_name:CurrentData.ngo_name,
                        unique_id:CurrentData.unique_id,
                        ngo_type_name:CurrentData.ngo_type_name,
                        darpan_reg_date:CurrentData.darpan_reg_date,
                        registration_no:CurrentData.registration_no,
                        email:CurrentData.email,
                        mobile_no:CurrentData.mobile_no,
                        status_id:null
                    }
                    fullData.push(NgoData)
                    ngoIds.push(CurrentData.ngo_id)
                }
            }
            }
            const getDataByCountryId = await NgoStateDistrictMappingService.getAllRemainingNgo(ngoIds)
            if(getDataByCountryId.length>0){
                for(let i=0;i<getDataByCountryId.length;i++){
                    const CurrentData = getDataByCountryId[i]
                    const NgoData = {
                        Request_Ngo_Id:null,
                        ngo_id:CurrentData.ngo_id,
                        ngo_name:CurrentData.ngo_name,
                        unique_id:CurrentData.unique_id,
                        ngo_type_name:CurrentData.ngo_type_name,
                        darpan_reg_date:CurrentData.darpan_reg_date,
                        registration_no:CurrentData.registration_no,
                        email:CurrentData.email,
                        mobile_no:CurrentData.mobile_no,
                        status_id:null
                    }
                    fullData.push(NgoData)
                    ngoIds.push(CurrentData.ngo_id)
                }
            }
            const getFinalNgos = await NgoMasterService.getAllNgoWhichAreNotSelected(ngoIds)
            if(getFinalNgos.length>0){
                for(let i=0;i<getFinalNgos.length;i++){
                    const CurrentData = getFinalNgos[i]
                    const NgoData = {
                        Request_Ngo_Id:null,
                        ngo_id:CurrentData.ngo_id,
                        ngo_name:CurrentData.ngo_name,
                        unique_id:CurrentData.unique_id,
                        ngo_type_name:CurrentData.ngo_type_name,
                        darpan_reg_date:CurrentData.darpan_reg_date,
                        registration_no:CurrentData.registration_no,
                        email:CurrentData.email,
                        mobile_no:CurrentData.mobile_no,
                        status_id:null
                    }
                    fullData.push(NgoData)
                    ngoIds.push(CurrentData.ngo_id)
                }
            }
            const requestData = await RequestNgoService.getAllNgoByRequestIdOnly(request_id)
            if(requestData.length!==0){
            // Loop through fullData and update status_id if ngo_id matches
            fullData.forEach((ngo) => {
                const matchedRequest = requestData.find(req => req.ngo_id === ngo.ngo_id);
                if (matchedRequest) {
                    ngo.Request_Ngo_Id = matchedRequest.Request_Ngo_Id
                    ngo.Reason = matchedRequest.Reason
                    ngo.status_id = matchedRequest.status_id; // Update status_id if found
                    ngo.status_name = matchedRequest.status_name
                }else{
                    ngo.Reason = null
                    ngo.Request_Ngo_Id = null
                    ngo.status_name = null
                }
            });
            }

            if (fullData.length !== 0) {
                return res
                    .status(responseCode.OK)
                    .send(
                        commonResponse(
                            responseCode.OK,
                            responseConst.DATA_RETRIEVE_SUCCESS,
                            fullData
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
    },getRequestDataByDescUserWise:async(req,res)=>{
        try{
            const user_id = tokenData(req,res)
            const limit = req.query.limit
            const already_viewed = req.query.already_viewed
            const getAllRequest = await RequestService.getRequestsForUserFeed(user_id,limit,already_viewed)
            // Extract all request IDs first
            const requestIds = getAllRequest.map(r => r.RequestId);

            // Fetch all media at once
            const allRequestMedia = await RequestMediaService.getDataByMultipleRequestIds(requestIds);

            // Group media by RequestId
            const mediaByRequest = allRequestMedia.reduce((acc, media) => {
            if (!acc[media.RequestId]) acc[media.RequestId] = [];
            acc[media.RequestId].push(media);
            return acc;
            }, {});

            // Now enrich all requests in a single pass
        const updatedRequestData = getAllRequest.map(currentData => {
        // Normalize file path
        if (
            currentData.request_user_file_path &&
            currentData.request_user_file_path !== "null" &&
            currentData.request_user_file_path !== ""
        ) {
            currentData.request_user_file_path = `${process.env.GET_LIVE_CURRENT_URL}/resources/${currentData.request_user_file_path}`;
        } else {
            currentData.request_user_file_path = null;
        }

        // Attach grouped media
        currentData.request_media = mediaByRequest[currentData.RequestId] ?? [];

        return currentData;
        });

            if (getAllRequest.length !== 0) {
                return res
                    .status(responseCode.OK)
                    .send(
                        commonResponse(
                            responseCode.OK,
                            responseConst.DATA_RETRIEVE_SUCCESS,
                            updatedRequestData
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
    },getRequestByNgoId: async (req, res) => {
        try {
            const ngo_id = req.query.ngo_id;

            const getData = await RequestService.GetRequestByNgoId(ngo_id);

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

            
            const updatedData = await Promise.all(
            getData.map(async (request) => {
                const request_media = await RequestMediaService.getDataByRequestIdByView(request.RequestId);
                return {
                ...request,
                request_media: request_media ?? null,
                };
            })
            );

           
            return res
            .status(responseCode.OK)
            .send(
                commonResponse(
                responseCode.OK,
                responseConst.DATA_RETRIEVE_SUCCESS,
                updatedData
                )
            );

        } catch (error) {
            console.error("Error:", error);
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
    },getAllVideoRequestByUserIdForHome: async(req,res)=>{
        try {
            const user_id = tokenData(req, res);
            const limit = req.query.limit;
            const already_viewed = req.query.already_viewed;

            // 1️⃣ Fetch requests with only video media
            const getAllRequestVideos = await RequestService.getRequestVideosForUserFeed(user_id, limit, already_viewed);

            // 2️⃣ Extract all request IDs
            const requestIds = getAllRequestVideos.map(r => r.RequestId);

            // 3️⃣ Fetch all media at once (only videos)
            const allRequestMedia = await RequestMediaService.getVideoDataByMultipleRequestIds(requestIds);

            // 4️⃣ Group media by RequestId
            const mediaByRequest = allRequestMedia.reduce((acc, media) => {
            if (!acc[media.RequestId]) acc[media.RequestId] = [];
            acc[media.RequestId].push(media);
            return acc;
            }, {});

            // 5️⃣ Attach media & normalize user file path
            const updatedRequestData = getAllRequestVideos.map(currentData => {
            if (
                currentData.request_user_file_path &&
                currentData.request_user_file_path !== "null" &&
                currentData.request_user_file_path !== ""
            ) {
                currentData.request_user_file_path = `${process.env.GET_LIVE_CURRENT_URL}/resources/${currentData.request_user_file_path}`;
            } else {
                currentData.request_user_file_path = null;
            }

            currentData.request_media = mediaByRequest[currentData.RequestId] ?? [];
            return currentData;
            });

            // 6️⃣ Response
            if (getAllRequestVideos.length !== 0) {
            return res.status(responseCode.OK).send(
                commonResponse(
                responseCode.OK,
                responseConst.DATA_RETRIEVE_SUCCESS,
                updatedRequestData
                )
            );
            } else {
            return res.status(responseCode.BAD_REQUEST).send(
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
}

export default RequestsController