import RequestDocumentService from "./request.documents.service.js";
import commonPath from "../../middleware/comman_path/comman.path.js";
import fs from 'fs/promises'; // ✅ Correct for async/await usage
import uploadFileToS3Folder from "../../utils/helper/s3.common.code.js";
import RequestService from "../requests/requests.service.js";
import { STATUS_MASTER } from "../../utils/constants/id_constant/id.constants.js";
const { commonResponse, responseCode, responseConst, logger, tokenData, currentTime, addMetaDataWhileCreateUpdate } = commonPath


const RequestDocumentsController = {
    // Create A new Record 
    create: async (req, res) => {
        try {
            const data = req.body;
            // Add metadata for creation (created by, created at)
            await addMetaDataWhileCreateUpdate(data, req, res, false);
            // data.created_by=1,
            // data.created_at = new Date()
            // Create the record using ORM
            const createData = await RequestDocumentService.createService(data);
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
            console.log("error", error)
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
            const updatedRowsCount = await RequestDocumentService.updateService(id, data);
            // if (updatedRowsCount > 0) {
            //     const newData = await RequestDocumentService.getServiceById(id);
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
            const getAll = await RequestDocumentService.getAllService()

            // const fileStatus=await CommanJsonFunction.checkFileExistence(CITY_FOLDER,CITY_JSON)
            // // Store the data in JSON for future retrieval
            // if(fileStatus==false){
            //   const DataToSave=await RequestDocumentService.getAllService()
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
            const getDataByid = await RequestDocumentService.getServiceById(Id)

            // const fileStatus=await CommanJsonFunction.checkFileExistence(CITY_FOLDER,CITY_JSON)
            // // Store the data in JSON for future retrieval
            // if(fileStatus==false){
            //   const DataToSave=await RequestDocumentService.getAllService()
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
            const deleteData = await RequestDocumentService.deleteById(id, req, res)
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
    }, createOrUpdateMulitileRequestDocuments: async (req, res) => {
        const data = req.body
        const fileType = req.file.mimetype;
        const folderType = 'request_documents';
        const filePath = req.file.path;  // Multer stores the file temporarily here
        const fileName = req.file.filename;
        // Ensure a file is uploaded
        async function deleteFile(filePath) {
            console.log("Inside delete function:", filePath);
            try {
                await fs.access(filePath); // Check if file exists
                await fs.unlink(filePath); // Delete it
                console.log(`✅ File deleted: ${filePath}`);
            } catch (err) {
                console.error(`❌ Failed to delete file: ${filePath}`, err.message);
            }
        }
        try {

            if (!req.file) {
                deleteFile(filePath)
                return res.status(400).send({ error: 'No file uploaded' });
            }

            if (data.RequestId == "" || data.RequestId == "undefined" || data.RequestId == '0' || data.RequestId == 0 || data.RequestId == undefined) {
                deleteFile(filePath)

                return res
                    .status(responseCode.BAD_REQUEST)
                    .send(
                        commonResponse(
                            responseCode.BAD_REQUEST,
                            responseConst.REQUEST_ID_IS_REQUIRED,
                            null,
                            true
                        )
                    )
            }
            const RequestData = await RequestService.getServiceById(data.RequestId)


            if (RequestData && RequestData.length > 0) {
                deleteFile(filePath)
                return res
                    .status(responseCode.BAD_REQUEST)
                    .send(
                        commonResponse(
                            responseCode.BAD_REQUEST,
                            responseConst.REQUEST_ID_IS_REQUIRED,
                            null,
                            true
                        )
                    )
            }
            // File name on the server
            if (data.request_media_id && data.request_media_id !== "" && data.request_media_id !== 0 && data.request_media_id !== "null") {
                // You can dynamically decide where to store the file, for example, 'post' or 'request'
                // For example, 'post', 'request', etc.
                const s3BucketFileDynamic = `${folderType}/${data.RequestId}/${data.document_type_id}/${fileName}`
                // Upload the file to S3
                const fileUrl = await uploadFileToS3Folder.uploadFileToS3(s3BucketFileDynamic, filePath, fileType);
                if (fileUrl.success) {

                    // If the upload was successful, return the file URL or save it to the database
                    const fileUrlData = fileUrl.url;
                    const dataToStore = {
                        media_url: fileUrlData,
                        s3_url: fileUrl.s3_url,
                        file_name:fileName,
                        document_type_id: data.document_type_id,
                        document_type_name: data.document_type_name,
                        RequestId: data.RequestId,
                    }
                    await addMetaDataWhileCreateUpdate(dataToStore, req, res, true);
                    const update = await RequestDocumentService.updateService(data.request_media_id, dataToStore)
                    // if(parseInt(RequestData.status_id) == STATUS_MASTER.REQUEST_DRAFT){
                    //   const getUserById = await UserTokenService.GetTokensByUserIds(RequestData.request_user_id)
                    //   const template = notificationTemplates.requestReceivedForEvaluation({requestName:RequestData.RequestName})
                    //   const sendNotifiction = await sendTemplateNotification({templateKey:"Request-Notification",templateData:template,userIds:getUserById,metaData:{request_id:data.RequestId,created_by:tokenData(req,res),request_media_url:fileUrlData}})
                    //   const updateRequestStatus = await RequestService.updateService(data.RequestId,{status_id:STATUS_MASTER.REQUEST_PENDING})
                    // }
                    // Save to DB or perform further actions as needed
                    // Example: await saveMediaToDatabase(fileUrl, data);  // This is a placeholder function
                    deleteFile(filePath)
                    if (update === 0) {
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
                    } else {
                        return res
                            .status(responseCode.OK)
                            .send(
                                commonResponse(
                                    responseCode.OK,
                                    responseConst.SUCCESS_UPDATING_RECORD,

                                )
                            );
                    }
                } else {
                    deleteFile(filePath)
                    // If the upload failed
                    return res.status(500).send({
                        error: 'File upload failed!'
                    });
                }
            } else {
                const s3BucketFileDynamic = `${folderType}/${data.RequestId}/${data.document_type_id}/${fileName}`
                // Upload the file to S3
                const fileUrl = await uploadFileToS3Folder.uploadFileToS3(s3BucketFileDynamic, filePath, fileType);
                console.log("fileUrl", fileUrl)
                if (fileUrl.success) {
                    const fileUrlData = fileUrl.url;
                    const dataToStore = {
                        media_url: fileUrlData,
                        s3_url: fileUrl.s3_url,
                        file_name:fileName,
                        document_type_id: data.document_type_id,
                        document_type_name: data.document_type_name,
                        RequestId: data.RequestId,
                    }
                    await addMetaDataWhileCreateUpdate(dataToStore, req, res, false);
                    console.log("dataToStore", dataToStore)
                    const createData = await RequestDocumentService.createService(dataToStore)
                    //   if(parseInt(RequestData.status_id) == STATUS_MASTER.REQUEST_DRAFT){
                    //       const getUserById = await UserTokenService.GetTokensByUserIds(RequestData.request_user_id)
                    //       const template = notificationTemplates.requestReceivedForEvaluation({requestName:RequestData.RequestName})
                    //       const sendNotifiction = await sendTemplateNotification({templateKey:"Request-Notification",templateData:template,userIds:getUserById,metaData:{request_id:data.RequestId,created_by:tokenData(req,res),request_media_url:fileUrlData}})
                    //       const updateRequestStatus = await RequestService.updateService(data.RequestId,{status_id:STATUS_MASTER.REQUEST_PENDING})
                    //     }
                    deleteFile(filePath)
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
                            )
                    }
                } else {
                    deleteFile(filePath)
                    return res.status(500).send({
                        error: 'File upload failed!'
                    });
                }

            }
        } catch (error) {
            console.log("error", error)
            deleteFile(filePath)
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
    },getDataByRequestId:async(req,res)=>{
        try{
            const requestIds = req.query.RequestId 
            const getData = await RequestDocumentService.getDataByRequestIdByView(requestIds)
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
            console.log("error", error)
            deleteFile(filePath)
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
export default RequestDocumentsController