import TicketMediaService from "./ticket.media.service.js";
import commonPath from "../../middleware/comman_path/comman.path.js";
import uploadFileToS3 from "../../utils/helper/s3.common.code.js";
const { commonResponse, responseCode, responseConst, logger, tokenData, currentTime, addMetaDataWhileCreateUpdate, fs } = commonPath


const TicketMediaController = {
    // Create A new Record 
    create: async (req, res) => {
        try {
            const data = req.body;
            // Add metadata for creation (created by, created at)
            await addMetaDataWhileCreateUpdate(data, req, res, false);
            // Create the record using ORM
            const createData = await TicketMediaService.createService(data);
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
            const updatedRowsCount = await TicketMediaService.updateService(id, data);

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
            // Fetch data from the database
            const getAll = await TicketMediaService.getAllService()

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

            // Fetch data from the database
            const getDataByid = await TicketMediaService.getServiceById(Id)

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
            const deleteData = await TicketMediaService.deleteByid(id, req, res)

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
    },
    
    BulkCreateOrUpdateTicketMedia: async (req, res) => {
        try {
            function deleteFile(filePath) {
                // Use fs.unlink to remove the file at the specified file path
                fs.unlink(filePath, (err) => {
                    if (err) {
                        console.log("error while deleting file --->", err)
                        // If an error occurs while deleting the file, log it
                        console.error(`Error deleting file: ${filePath}`, err);
                    } else {
                        // If the file is successfully deleted, log the success
                        console.log(`Local file deleted: ${filePath}`);
                    }
                });
            }

            const data = req.body
            const fileType = req.file.mimetype;
            const folderType = 'ticket_media';
            const filePath = req.file.path;  // Multer stores the file temporarily here
            const fileName = req.file.filename;
            
            if (!req.file) {
                return res.status(400).send({ error: 'No file uploaded' });
            }

            if (data.ticket_id == "" || data.ticket_id == "undefined" || data.ticket_id == '0' || data.ticket_id == 0 || data.ticket_id == undefined) {
                deleteFile(filePath)
                return res
                    .status(responseCode.BAD_REQUEST)
                    .send(
                        commonResponse(
                            responseCode.BAD_REQUEST,
                            responseConst.TICKET_ID_REQUIRED,
                            null,
                            true
                        )
                    )
            }
            
            if (data.sequence == "" || data.sequence == "undefined" || data.sequence == "0" || data.sequence == 0 || data.sequence == undefined) {
                deleteFile(filePath)
                return res
                    .status(responseCode.BAD_REQUEST)
                    .send(
                        commonResponse(
                            responseCode.BAD_REQUEST,
                            responseConst.SEQUENCE_ID_IS_REQUIRED,
                            null,
                            true
                        )
                    )
            }

            if (data.ticket_media_id) {
                // Update existing ticket media
                const s3BucketFileDynamic = `${folderType}/${data.ticket_id}/${data.sequence}/${fileName}`
                
                // Upload the file to S3
                const fileUrl = await uploadFileToS3(s3BucketFileDynamic, filePath, fileType);
                
                if (fileUrl.success) {
                    // If the upload was successful, return the file URL or save it to the database
                    const fileUrlData = fileUrl.url;
                    const dataToStore = {
                        media_url: fileUrlData,
                        media_type: data.media_type,
                        sequence: data.sequence,
                        ticket_id: data.ticket_id,
                    }
                    await addMetaDataWhileCreateUpdate(dataToStore, req, res, true);
                    const update = await TicketMediaService.updateService(data.ticket_media_id, dataToStore)
                    
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
                // Create new ticket media
                const s3BucketFileDynamic = `${folderType}/${data.ticket_id}/${data.sequence}/${fileName}`
                
                // Upload the file to S3
                const fileUrl = await uploadFileToS3(s3BucketFileDynamic, filePath, fileType);
                console.log("fileUrl", fileUrl)
                
                if (fileUrl.success) {
                    const fileUrlData = fileUrl.url;
                    const dataToStore = {
                        media_url: fileUrlData,
                        media_type: data.media_type,
                        sequence: data.sequence,
                        ticket_id: data.ticket_id,
                    }
                    await addMetaDataWhileCreateUpdate(dataToStore, req, res, false);
                    const createData = await TicketMediaService.createService(dataToStore)
                    
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
    
    getDataByTicketId: async (req, res) => {
        try {
            const getMediaByTicketId = req.query.ticket_id
            const getData = await TicketMediaService.getDataByTicketId(getMediaByTicketId)
            
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
    }
}

export default TicketMediaController