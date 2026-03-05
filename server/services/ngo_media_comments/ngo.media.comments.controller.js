import NgoMediaCommentsService from "./ngo.media.comments.service.js";
import commonPath from "../../middleware/comman_path/comman.path.js";
const { commonResponse, responseCode, responseConst, logger, tokenData, currentTime, addMetaDataWhileCreateUpdate } = commonPath

const NgoMediaCommentsController = {
    // Create A new Record 
    create: async (req, res) => {
        try {
            const data = req.body;

            // 1. Prepare Data
            await addMetaDataWhileCreateUpdate(data, req, res, false);

            // 2. Create the Comment FIRST (Fail Fast)
            // We create it first to ensure valid ID and constraints before updating counters
            const createData = await NgoMediaCommentsService.createService(data);

            if (createData) {
                // 3. Update Parent Counter (Atomic & Async)
                // If this is a reply (has parent_id), atomically add +1 to the parent
                if (data.parent_id && data.parent_id > 0) {
                    await NgoMediaCommentsService.UpdateDataCount(data.parent_id, 'total_comment', 1);
                }

                return res.status(responseCode.CREATED).send(
                    commonResponse(responseCode.CREATED, responseConst.SUCCESS_ADDING_RECORD)
                );
            } else {
                return res.status(responseCode.BAD_REQUEST).send(
                    commonResponse(responseCode.BAD_REQUEST, responseConst.ERROR_ADDING_RECORD, null, true)
                );
            }

        } catch (error) {
            logger.error(`Error ---> ${error}`);
            return res.status(responseCode.INTERNAL_SERVER_ERROR).send(
                commonResponse(responseCode.INTERNAL_SERVER_ERROR, responseConst.INTERNAL_SERVER_ERROR, null, true)
            );
        }
    },

    update: async (req, res) => {
        try {
            const id = req.query.id;
            const data = req.body;

            await addMetaDataWhileCreateUpdate(data, req, res, true);

            // 1. Fetch current state to compare parent_ids
            const currentComment = await NgoMediaCommentsService.getServiceById(id);

            if (!currentComment) {
                return res.status(responseCode.BAD_REQUEST).send(
                    commonResponse(responseCode.BAD_REQUEST, responseConst.DATA_NOT_FOUND, null, true)
                );
            }

            // 2. Handle Moving Comments (Changing Parent ID)
            // We check if parent_id exists in payload AND if it is different from the DB
            if (data.parent_id !== undefined && data.parent_id != currentComment.parent_id) {
                const tasks = [];

                // A. Increment New Parent (If valid)
                if (data.parent_id && data.parent_id != 0) {
                    tasks.push(NgoMediaCommentsService.UpdateDataCount(data.parent_id, 'total_comment', 1));
                }

                // B. Decrement Old Parent (If valid)
                if (currentComment.parent_id && currentComment.parent_id != 0) {
                    tasks.push(NgoMediaCommentsService.UpdateDataCount(currentComment.parent_id, 'total_comment', -1));
                }

                // Execute both counter updates in parallel
                await Promise.all(tasks);
            }

            // 3. Update the Record
            const updatedRowsCount = await NgoMediaCommentsService.updateService(id, data);

            if (updatedRowsCount === 0) {
                return res.status(responseCode.BAD_REQUEST).send(
                    commonResponse(responseCode.BAD_REQUEST, responseConst.ERROR_UPDATING_RECORD, null, true)
                );
            }

            return res.status(responseCode.CREATED).send(
                commonResponse(responseCode.CREATED, responseConst.SUCCESS_UPDATING_RECORD)
            );

        } catch (error) {
            logger.error(`Error ---> ${error}`);
            return res.status(responseCode.INTERNAL_SERVER_ERROR).send(
                commonResponse(responseCode.INTERNAL_SERVER_ERROR, responseConst.INTERNAL_SERVER_ERROR, null, true)
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
            const getAll = await NgoMediaCommentsService.getAllService()

            // const fileStatus=await CommanJsonFunction.checkFileExistence(CITY_FOLDER,CITY_JSON)
            // // Store the data in JSON for future retrieval
            // if(fileStatus==false){
            //   const DataToSave=await NgoMediaCommentsService.getAllService()
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
            const getDataByid = await NgoMediaCommentsService.getServiceById(Id)

            // const fileStatus=await CommanJsonFunction.checkFileExistence(CITY_FOLDER,CITY_JSON)
            // // Store the data in JSON for future retrieval
            // if(fileStatus==false){
            //   const DataToSave=await NgoMediaCommentsService.getAllService()
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
            const id = req.query.id;

            // 1. Fetch Data (Fail Fast)
            // We need to know if this comment is a reply (has a parent)
            const commentToDelete = await NgoMediaCommentsService.getServiceById(id);

            if (commentToDelete && commentToDelete.length == 0 ) {
                return res.status(responseCode.BAD_REQUEST).send(
                    commonResponse(
                        responseCode.BAD_REQUEST,
                        responseConst.DATA_NOT_FOUND,
                        null,
                        true
                    )
                );
            }

            const tasks = [];

            // 2. Decrement Parent Counter (Atomic)
            // Logic Fix: We only decrement the parent's count if this was a REPLY (parent_id > 0).
            if (commentToDelete.parent_id && parseInt(commentToDelete.parent_id) > 0) {
                // We do NOT need to fetch the parent first. Just send the decrement command.
                tasks.push(
                    NgoMediaCommentsService.UpdateDataCount(commentToDelete.parent_id, 'total_comment', -1)
                );
            }

            // 3. Delete the Comment Record
            tasks.push(NgoMediaCommentsService.deleteByid(id, req, res));

            // 4. Execute Simultaneously

            const results = await Promise.allSettled(tasks);

            // Check the result of the Delete operation (last task)
            const deleteResult = results[results.length - 1];

            if (deleteResult.status === 'fulfilled' && deleteResult.value !== 0) {
                return res.status(responseCode.CREATED).send(
                    commonResponse(
                        responseCode.CREATED,
                        responseConst.SUCCESS_DELETING_RECORD
                    )
                );
            } else {
                return res.status(responseCode.BAD_REQUEST).send(
                    commonResponse(
                        responseCode.BAD_REQUEST,
                        responseConst.ERROR_DELETING_RECORD,
                        null,
                        true
                    )
                );
            }

        } catch (error) {
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
    },
    getByNgoMediaOnlyParentId: async (req, res) => {
        try {
            const ngo_media_id = req.query.ngo_media_id
            const getAllData = await NgoMediaCommentsService.getDataByMediaIdOnlyParent(ngo_media_id)
            if (getAllData.length !== 0) {
                return res
                    .status(responseCode.OK)
                    .send(
                        commonResponse(
                            responseCode.OK,
                            responseConst.DATA_RETRIEVE_SUCCESS,
                            getAllData
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
    }, getNgoMediaByNgoMediaIdAndParentId: async (req, res) => {
        try {
            const ngo_media_id = req.query.ngo_media_id
            const parent_id = req.query.parent_id
            const getData = await NgoMediaCommentsService.getDataByMediaAndParentId(ngo_media_id, parent_id)
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

export default NgoMediaCommentsController