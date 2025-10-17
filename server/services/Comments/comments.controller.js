import CommentService from "./comments.service.js";
import commonPath from "../../middleware/comman_path/comman.path.js";
import UserMasterService from "../user_master/user.master.service.js";
import UserActivtyService from "../user_activity/user.activity.service.js";
import notificationTemplates from "../../utils/helper/notification.templates.js";
import PostService from "../Posts/posts.service.js";
import UserTokenService from "../user_tokens/user.tokens.service.js";
import sendTemplateNotification from "../../utils/helper/firebase.push.notification.js";
import PostMediaService from "../PostMedia/postmedia.service.js";
const {commonResponse,responseCode,responseConst,logger,tokenData,currentTime,addMetaDataWhileCreateUpdate} = commonPath

const CommentsController = {
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
                    const getDataByIdByView = await CommentService.getServiceById(data.parent_id)
                    const UpdateComment = await CommentService.updateService(getDataByIdByView.comment_id,{total_comment:parseInt(getDataByIdByView.total_comment) + 1})
                }
            }
            const getUserActivityData = await UserActivtyService.getDataByUserId(data.user_id)
            if(getUserActivityData){
                const total_comment = parseInt(getUserActivityData[0].total_comments_no) + 1
                const userActivityUpdate = await UserActivtyService.updateService(getUserActivityData[0].user_activity_id,{total_comments_no:total_comment})
            }
            // data.created_by=1,
            // data.created_at = new Date()
            // Create the record using ORM
            const postData = await PostService.getServiceById(data.post_id);
            if(postData) {
                await PostService.updateService(postData.post_id,{total_comments:parseInt(postData.total_comments || 0) + 1})
            }
            const currentUser = await UserMasterService.getServiceById(data.user_id);
            const template = notificationTemplates.postComment({ username : currentUser.user_name });
            const createData = await CommentService.createService(data);
            const postMediaData = await PostMediaService.getDatabyPostIdByView(data.post_id);
            if(currentUser.file_path && currentUser.file_path!=="null" && currentUser.file_path!==""){
                currentUser.file_path = `${process.env.GET_LIVE_CURRENT_URL}/resources/${currentUser.file_path}`;
            } else {
                currentUser.file_path = null;
            }
            if (createData) {
                const getUserToken = await UserTokenService.GetTokensByUserIds(postData.user_id);
                if(getUserToken.length!==0 && data.user_id !== postData.user_id){
                    await sendTemplateNotification({templateKey:"PostComment-Notification",templateData:template,userIds:getUserToken,metaData:{comment_id:createData.dataValues.post_id,
                    post_image: postMediaData.length!==0 ? postMediaData[0]?.media_url : null,
                    user_profile : currentUser?.file_path,
                    created_by:tokenData(req,res)}})
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
            const getCommentById = await CommentService.getServiceById(id)
            if(getCommentById.parent_id==0){
                if(data.parent_id>0){
                    const updateComment = await CommentService.updateService(data.parent_id,{total_comment:parseInt(getCommentById.total_comment) + 1})
                }
            }
            // Add metadata for modification (modified by, modified at)
            await addMetaDataWhileCreateUpdate(data, req, res, true);

            // Update the record using ORM
            const updatedRowsCount = await CommentService.updateService(id, data);
            // if (updatedRowsCount > 0) {
            //     const newData = await CommentService.getServiceById(id);
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
            const getAll = await CommentService.getAllService()

            // const fileStatus=await CommanJsonFunction.checkFileExistence(CITY_FOLDER,CITY_JSON)
            // // Store the data in JSON for future retrieval
            // if(fileStatus==false){
            //   const DataToSave=await CommentService.getAllService()
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
            const getDataByid = await CommentService.getServiceById(Id)

            // const fileStatus=await CommanJsonFunction.checkFileExistence(CITY_FOLDER,CITY_JSON)
            // // Store the data in JSON for future retrieval
            // if(fileStatus==false){
            //   const DataToSave=await CommentService.getAllService()
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
            const getDataByCommentId = await CommentService.getServiceById(id)
            if(getDataByCommentId){
                if(getDataByCommentId.parent_id!=="" && getDataByCommentId.parent_id!==null && getDataByCommentId.parent_id!=="null" && getDataByCommentId.parent_id!=="undefined" && getDataByCommentId.parent_id!==0 && getDataByCommentId.parent_id>0){
                    const getParentData = await CommentService.getServiceById(getDataByCommentId.parent_id)
                    const updateComment = await CommentService.updateService(getParentData.comment_id,{total_comment:parseInt(getParentData.total_comment) - 1})
                }
            }
             const getUserActivityData = await UserActivtyService.getDataByUserId(getDataByCommentId.user_id)
            if(getUserActivityData){
                const total_comment = parseInt(getUserActivityData[0].total_comments_no) - 1
                const userActivityUpdate = await UserActivtyService.updateService(getUserActivityData[0].user_activity_id,{total_comments_no:total_comment})
            }
            const postData = await PostService.getServiceById(getDataByCommentId.post_id);
            if(postData) {
            await PostService.updateService(getDataByCommentId.post_id, {
                total_comments: Math.max(0, parseInt(postData.total_comments || 0) - 1)
            });
        }
            const deleteData = await CommentService.deleteByid(id, req, res)
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
    },getCommentByPostIdAndParentId:async(req,res)=>{
        try{
            const post_id = req.query.post_id
            const parent_id = req.query.parent_id
            const limit = req.query.limit
            const offset = req.query.offset
            const getCommentData = await CommentService.getCommentByPostOrParentId(post_id,parent_id,limit,offset)
            await Promise.all(getCommentData.map( async (comment) => {
                const user = await UserMasterService.getServiceById(comment.user_id);
                comment.user_name = user.user_name;
                if(user.file_path && user.file_path!=="null" && user.file_path!==""){
                    comment.user_profile = `${process.env.GET_LIVE_CURRENT_URL}/resources/${user.file_path}`;
                } else {
                    comment.user_profile = null;
                }
            }))
            if (getCommentData.length !== 0) {
                return res
                    .status(responseCode.OK)
                    .send(
                        commonResponse(
                            responseCode.OK,
                            responseConst.DATA_RETRIEVE_SUCCESS,
                            getCommentData
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
    },getCommentByUserId:async(req,res)=>{
        try{
            const user_id = req.query.user_id
            const getAllUserData = await CommentService.getCommentByUserIdByView(user_id)
            if (getAllUserData.length !== 0) {
                return res
                    .status(responseCode.OK)
                    .send(
                        commonResponse(
                            responseCode.OK,
                            responseConst.DATA_RETRIEVE_SUCCESS,
                            getAllUserData
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

export default CommentsController
