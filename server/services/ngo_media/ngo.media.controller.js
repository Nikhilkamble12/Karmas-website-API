import ngoMediaService from "./ngo.media.service.js";
import commonPath from "../../middleware/comman_path/comman.path.js";
import uploadFileToS3 from "../../utils/helper/s3.common.code.js";
const { commonResponse, responseCode, responseConst, logger, tokenData, currentTime, addMetaDataWhileCreateUpdate, fs } = commonPath


const NgoMediaController = {
    // Create A new Record 
    create: async (req, res) => {
        try {
            const data = req.body;
            // Add metadata for creation (created by, created at)
            await addMetaDataWhileCreateUpdate(data, req, res, false);
            // data.created_by=1,
            // data.created_at = new Date()
            // Create the record using ORM
            const createData = await ngoMediaService.createService(data);
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
            const updatedRowsCount = await ngoMediaService.updateService(id, data);
            // if (updatedRowsCount > 0) {
            //     const newData = await ngoMediaService.getServiceById(id);
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
            const getAll = await ngoMediaService.getAllService()

            // const fileStatus=await CommanJsonFunction.checkFileExistence(CITY_FOLDER,CITY_JSON)
            // // Store the data in JSON for future retrieval
            // if(fileStatus==false){
            //   const DataToSave=await ngoMediaService.getAllService()
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
            const getDataByid = await ngoMediaService.getServiceById(Id)

            // const fileStatus=await CommanJsonFunction.checkFileExistence(CITY_FOLDER,CITY_JSON)
            // // Store the data in JSON for future retrieval
            // if(fileStatus==false){
            //   const DataToSave=await ngoMediaService.getAllService()
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
            const deleteData = await ngoMediaService.deleteByid(id, req, res)
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
    }, BulkCreateorUpdatengoMedia: async (req, res) => {
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
            const folderType = 'ngo_media';
            const filePath = req.file.path;  // Multer stores the file temporarily here
            const fileName = req.file.filename;
            if (!req.file) {
                return res.status(400).send({ error: 'No file uploaded' });
            }

            if (data.ngo_id == "" || data.ngo_id == "undefined" || data.ngo_id == '0' || data.ngo_id == 0 || data.ngo_id == undefined) {
                deleteFile(filePath)
                return res
                    .status(responseCode.BAD_REQUEST)
                    .send(
                        commonResponse(
                            responseCode.BAD_REQUEST,
                            responseConst.NGO_ID_REQUIRED,
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
            // File name on the server
            // console.log("fileType", fileType)
            // console.log("folderType", folderType)
            // console.log("fileName", fileName)
            if (data.ngo_media_id) {
                // You can dynamically decide where to store the file, for example, 'post' or 'request'
                // For example, 'post', 'request', etc.
                const s3BucketFileDynamic = `${folderType}/${data.ngo_id}/${data.sequence}/${fileName}`
                // Upload the file to S3
                const fileUrl = await uploadFileToS3(s3BucketFileDynamic, filePath, fileType);
                if (fileUrl.success) {

                    // If the upload was successful, return the file URL or save it to the database
                    const fileUrlData = fileUrl.url;
                    const dataToStore = {
                        media_url: fileUrlData,
                        media_type: data.media_type,
                        sequence: data.sequence,
                        ngo_id: data.ngo_id,
                    }
                    await addMetaDataWhileCreateUpdate(dataToStore, req, res, true);
                    const update = await ngoMediaService.updateService(data.ngo_media_id, dataToStore)
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
                const s3BucketFileDynamic = `${folderType}/${data.ngo_id}/${data.sequence}/${fileName}`
                // Upload the file to S3
                const fileUrl = await uploadFileToS3(s3BucketFileDynamic, filePath, fileType);
                console.log("fileUrl", fileUrl)
                if (fileUrl.success) {
                    const fileUrlData = fileUrl.url;
                    const dataToStore = {
                        media_url: fileUrlData,
                        media_type: data.media_type,
                        sequence: data.sequence,
                        ngo_id: data.ngo_id,
                    }
                    await addMetaDataWhileCreateUpdate(dataToStore, req, res, false);
                    const createData = await ngoMediaService.createService(dataToStore)
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
    }, getDataByNgoId: async (req, res) => {
        try {
            const getMediaByNgoId = req.query.ngo_id
            const getData = await ngoMediaService.getDataByNgoId(getMediaByNgoId)
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

export default NgoMediaController