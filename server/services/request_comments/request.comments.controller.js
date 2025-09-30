import RequestCommentService from "./request.comments.service.js";
import commonPath from "../../middleware/comman_path/comman.path.js";
import UserActivtyService from "../user_activity/user.activity.service.js";
import UserMasterService from "../user_master/user.master.service.js";
import notificationTemplates from "../../utils/helper/notification.templates.js";
import RequestMediaService from "../request_media/request.media.service.js";
import RequestService from "../requests/requests.service.js";
import UserTokenService from "../user_tokens/user.tokens.service.js";
import sendTemplateNotification from "../../utils/helper/firebase.push.notification.js";
const {commonResponse,responseCode,responseConst,logger,tokenData,currentTime,addMetaDataWhileCreateUpdate} = commonPath

const RequestCommentController = {
    // Create A new Record 
    create: async (req, res) => {
        try {
            const data = req.body;
            // Add metadata for creation (created by, created at)
            await addMetaDataWhileCreateUpdate(data, req, res, false);
            if(data.user_id==null ||data.user_id==undefined || data.user_id=="null" || data.user_id=="undefined" || data.user_id==0){
                data.user_id = tokenData(req,res)
            }
            if(data.parent_id!==null && data.parent_id!==undefined && data.parent_id!=="null" && data.parent_id!=="undefined" && data.parent_id!==0 && data.parent_id!=="0"){
                if(parseInt(data.parent_id)>0){
                    const getDataByIdByView = await RequestCommentService.getServiceById(data.parent_id)
                    const UpdateComment = await RequestCommentService.updateService(getDataByIdByView.comment_id,{total_comment:parseInt(getDataByIdByView.total_comment) + 1})
                }
            }
            const getUserActivityData = await UserActivtyService.getDataByUserId(data.user_id)
            if(getUserActivityData){
                const total_comment = parseInt(getUserActivityData[0].total_request_comment_no) + 1
                const userActivityUpdate = await UserActivtyService.updateService(getUserActivityData[0].user_activity_id,{total_request_comment_no:total_comment})
            }
            // data.created_by=1,
            // data.created_at = new Date()
            // Create the record using ORM
            const currentData = await UserMasterService.getServiceById(data.user_id);
            const template = notificationTemplates.requestComment({ username: currentData.user_name})
            const createData = await RequestCommentService.createService(data);
            const requestMediaData = await RequestMediaService.getDataByRequestIdByView(data.request_id)
            if (createData) {
                const requestData = await RequestService.getServiceById(data.request_id);
                const getUserToken = await UserTokenService.GetTokensByUserIds(requestData.request_user_id);

                if(requestData.request_user_id !== data.user_id && getUserToken.length!==0) {
                    await sendTemplateNotification({templateKey:"Requestcomment-notification",
                        templateData:template,
                        userIds:getUserToken,
                        metaData : {
                            comment_id:createData.dataValues.request_comment_id,
                            user_profile : currentData?.file_path,
                            request_media_url : requestMediaData.length!==0 ? requestMediaData[0]?.media_url : null,
                            created_by: tokenData(req,res)
                        }
                    })
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
            const getCommentById = await RequestCommentService.getServiceById(id)
            if( getCommentById.parent_id == null || getCommentById.parent_id==0){
                if(data.parent_id>0){
                    const updateComment = await RequestCommentService.updateService(data.parent_id,{total_comment:parseInt(getCommentById.total_comment) + 1})
                }
            }
            // Update the record using ORM
            const updatedRowsCount = await RequestCommentService.updateService(id, data);
            // if (updatedRowsCount > 0) {
            //     const newData = await RequestCommentService.getServiceById(id);
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
            const getAll = await RequestCommentService.getAllService()

            // const fileStatus=await CommanJsonFunction.checkFileExistence(CITY_FOLDER,CITY_JSON)
            // // Store the data in JSON for future retrieval
            // if(fileStatus==false){
            //   const DataToSave=await RequestCommentService.getAllService()
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
            const getDataByid = await RequestCommentService.getServiceById(Id)

            // const fileStatus=await CommanJsonFunction.checkFileExistence(CITY_FOLDER,CITY_JSON)
            // // Store the data in JSON for future retrieval
            // if(fileStatus==false){
            //   const DataToSave=await RequestCommentService.getAllService()
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
            const getDataByCommentId = await RequestCommentService.getServiceById(id)
            if(getDataByCommentId){
                if(getDataByCommentId.parent_id!=="" && getDataByCommentId.parent_id!==null && getDataByCommentId.parent_id!=="null" && getDataByCommentId.parent_id!=="undefined" && getDataByCommentId.parent_id!==0 && getDataByCommentId.parent_id>0){
                    const getParentData = await RequestCommentService.getServiceById(getDataByCommentId.parent_id)
                    const updateComment = await RequestCommentService.updateService(getParentData.comment_id,{total_comment:parseInt(getParentData.total_comment) - 1})
                }
            }
             const getUserActivityData = await UserActivtyService.getDataByUserId(getDataByCommentId.user_id)
            if(getUserActivityData){
                const total_comment = parseInt(getUserActivityData[0].total_request_comment_no) - 1
                const userActivityUpdate = await UserActivtyService.updateService(getUserActivityData[0].user_activity_id,{total_request_comment_no:total_comment})
            }
            // Delete data from the database
            const deleteData = await RequestCommentService.deleteByid(id, req, res)
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
    },getCommentByRequestAndParentId:async(req,res)=>{
        try{
            const request_id = req.query.request_id
            const parent_id = req.query.parent_id
            const limit = req.query.limit
            const offset = req.query.offset
            const getDataById = await RequestCommentService.getRequestCommentByRequestAndParentId(request_id,parent_id,limit,offset)
            if (getDataById.length !== 0) {
                return res
                    .status(responseCode.OK)
                    .send(
                        commonResponse(
                            responseCode.OK,
                            responseConst.DATA_RETRIEVE_SUCCESS,
                            getDataById
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
    },getCommentByUserIdByView:async(req,res)=>{
        try{
            const user_id = req.query.user_id
            const limit = req.query.limit
            const offset = req.query.offset
            const getDataById = await RequestCommentService.getRequestCommentByUserId(user_id,limit,offset)
            if (getDataById.length !== 0) {
                return res
                    .status(responseCode.OK)
                    .send(
                        commonResponse(
                            responseCode.OK,
                            responseConst.DATA_RETRIEVE_SUCCESS,
                            getDataById
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

export default RequestCommentController