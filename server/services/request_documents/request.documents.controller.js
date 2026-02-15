import RequestDocumentService from "./request.documents.service.js";
import commonPath from "../../middleware/comman_path/comman.path.js";
import fs from 'fs/promises'; // ✅ Correct for async/await usage
import uploadFileToS3Folder from "../../utils/helper/s3.common.code.js";
import RequestService from "../requests/requests.service.js";
import { STATUS_MASTER } from "../../utils/constants/id_constant/id.constants.js";
import RequestNgoService from "../request_ngo/request.ngo.service.js";
import NgoRequestDocumentCategoryService from "../ngo_request_document_category/ngo.request.document.category.service.js";
const { commonResponse, responseCode, responseConst, logger, tokenData, currentTime, addMetaDataWhileCreateUpdate } = commonPath


const RequestDocumentsController = {
    // Create A new Record 
    create: async (req, res) => {
        try {
            const data = req.body;
            // Add metadata for creation (created by, created at)
            await addMetaDataWhileCreateUpdate(data, req, res, false);
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
            // Fetch data from the database if JSON is empty
            const getAll = await RequestDocumentService.getAllService()
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

            // If not found in JSON, fetch data from the database
            const getDataByid = await RequestDocumentService.getServiceById(Id)
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
            const deleteData = await RequestDocumentService.deleteByid(id, req, res)
            // Also delete data from the JSON file
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
        if (!req.file) {
                deleteFile(filePath)
                return res.status(400).send({ error: 'No file uploaded' });
        }
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
                    const createData = await RequestDocumentService.createService(dataToStore)
                    // 1. Get all NGOs associated with this Request ID
                        const getAllNgo = await RequestNgoService.getAllNgoByRequestIdOnly(data.RequestId);

                        // Check if we found any NGOs
                        if (getAllNgo && getAllNgo.length > 0) {
                            
                            // Extract just the 'ngo_id' values into an array (e.g., [1, 5, 12])
                            const ngoIdList = getAllNgo.map(ngo => ngo.ngo_id);

                            // 2. Get Document Categories using the list of NGO IDs
                            // This likely returns records linking the NGO to the specific category
                            const getDocumentById = await NgoRequestDocumentCategoryService.getByNgoIdUsingInAndCategoryId(
                                ngoIdList, 
                                RequestData.category_id
                            );

                            // Check if we found matching document categories
                            if (getDocumentById && getDocumentById.length > 0) {
                                
                                // Ensure you use the correct primary key column name from your model
                                // 3. FILTER the original list to get the Request_Ngo_Ids for only the valid NGOs
                                const requestNgoIdList = getAllNgo
                                    .filter(ngoItem => validNgoIds.includes(ngoItem.ngo_id)) // Keep only NGOs that have the document
                                    .map(ngoItem => ngoItem.Request_Ngo_Id); // Extract their specific Request_Ngo_Id
                                if (requestNgoIdList.length > 0) {
                                // 3. Update the count for all those Request_Ngo_Ids at once
                                const updateCount = await RequestNgoService.UpdateRequestCountByRequestNgoId(
                                    requestNgoIdList, 
                                    "ngo_document_uploaded", 
                                    1 // Increment by 1
                                );
                                 }
                            }
                        }
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
    },getDataByRequestId: async (req, res) => {
    try {
        const requestId = req.query.RequestId;

        // 1. Get Request Data to find the Category and NGO IDs
        const getRequestData = await RequestNgoService.getAllNgoByRequestIdOnly(requestId);

        if (!getRequestData || getRequestData.length === 0) {
            return res.status(responseCode.BAD_REQUEST).send(
                commonResponse(responseCode.BAD_REQUEST, responseConst.DATA_NOT_FOUND, null, true)
            );
        }

        const category_id = getRequestData[0]?.category_id;
        const AllNgoIds = getRequestData.map((data) => data.ngo_id);

        // 2. Get the REQUIRED documents for this Category
        const getRequiredDocuments = await NgoRequestDocumentCategoryService.getByNgoIdUsingInAndCategoryId(AllNgoIds, category_id);

        if (getRequiredDocuments.length !== 0) {
            
            // 3. Get the ACTUAL submitted documents
            const getSubmittedDocuments = await RequestDocumentService.getDataByRequestIdByView(requestId);

            // 4. Map and Merge
            const finalDocumentStatus = getRequiredDocuments.map((requiredDoc) => {
                
                // Find matching submitted doc
                const submittedDoc = getSubmittedDocuments.find(
                    (sub) => sub.document_type_id === requiredDoc.document_type_id
                );

                const isUploaded = !!submittedDoc; 
                let documentName = requiredDoc.document_type; 

                // If "Others" (ID 50) is uploaded, use the custom user-provided name if available
                if (requiredDoc.document_type_id === 50 && submittedDoc) {
                    documentName = submittedDoc.document_type_name || "Others";
                }

                return {
                    RequestId:requiredDoc.RequestId,
                    document_type_id: requiredDoc.document_type_id,
                    document_type_name: documentName,
                    is_mandatory: requiredDoc.is_mandatory, 
                    is_uploaded: isUploaded,
                    media_url: submittedDoc ? submittedDoc.media_url : null,
                    s3_url: submittedDoc ? submittedDoc.s3_url : null,
                    file_name: submittedDoc ? submittedDoc.file_name : null,
                    request_document_id: submittedDoc ? submittedDoc.request_document_id : null
                };
            });

            return res.status(responseCode.OK).send(
                commonResponse(
                    responseCode.OK,
                    responseConst.DATA_RETRIEVE_SUCCESS,
                    finalDocumentStatus 
                )
            );

        } else {
            return res.status(responseCode.BAD_REQUEST).send(
                commonResponse(responseCode.BAD_REQUEST, responseConst.DATA_NOT_FOUND, null, true)
            );
        }

    } catch (error) {
        console.log("error", error);
        logger.error(`Error ---> ${error}`);
        return res.status(responseCode.INTERNAL_SERVER_ERROR).send(
            commonResponse(responseCode.INTERNAL_SERVER_ERROR, responseConst.INTERNAL_SERVER_ERROR, null, true)
        );
    }
}

}
export default RequestDocumentsController