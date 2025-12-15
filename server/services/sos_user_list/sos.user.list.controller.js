import SosUserListService from "./sos.user.list.service.js";
import commonPath from "../../middleware/comman_path/comman.path.js";
import getSosUserJsonFileName from "../../utils/helper/sos_user_file_helper.js";
import LocalJsonHelper from "../../utils/helper/local.json.helper.js";
const {commonResponse,responseCode,responseConst,logger,tokenData,currentTime,addMetaDataWhileCreateUpdate,TABLE_VIEW_FOLDER_MAP} = commonPath

const SosUserListController = {
    // Create A new Record 
    create: async (req, res) => {
        try {
            const data = req.body;
            // Add metadata for creation (created by, created at)
            await addMetaDataWhileCreateUpdate(data, req, res, false);
            // data.created_by=1,
            // data.created_at = new Date()
            // Create the record using ORM
            const createData = await SosUserListService.createService(data);
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
            const updatedRowsCount = await SosUserListService.updateService(id, data);
            // if (updatedRowsCount > 0) {
            //     const newData = await SosUserListService.getServiceById(id);
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
            const getAll = await SosUserListService.getAllService()

            // const fileStatus=await CommanJsonFunction.checkFileExistence(CITY_FOLDER,CITY_JSON)
            // // Store the data in JSON for future retrieval
            // if(fileStatus==false){
            //   const DataToSave=await SosUserListService.getAllService()
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
            const getDataByid = await SosUserListService.getServiceById(Id)

            // const fileStatus=await CommanJsonFunction.checkFileExistence(CITY_FOLDER,CITY_JSON)
            // // Store the data in JSON for future retrieval
            // if(fileStatus==false){
            //   const DataToSave=await SosUserListService.getAllService()
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
            const deleteData = await SosUserListService.deleteByid(id, req, res)
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
    },getDatabyUserId:async(req,res)=>{
        try{
            const user_id = req.query.user_id
            const fileDetails2 = {
                view_name: null,
                folder_name: "sos_user",
                json_file_name:getSosUserJsonFileName(createData.dataValues.sos_user_id)
                }
            const getDataById = await LocalJsonHelper.getAll(fileDetails2,"15d","user_id",user_id)
            console.log("getDataById",getDataById)
            if(getDataById && getDataById.length!==0 && getDataById.length>0){
                getDataById.forEach(entry => {
                // Format user_file_path
                    if (
                        entry.user_file_path &&
                        entry.user_file_path !== "null"
                    ) {
                        entry.user_file_path = `${process.env.GET_LIVE_CURRENT_URL}/resources/${entry.user_file_path}`;
                    } else {
                        entry.user_file_path = null;
                    }

                    // Format contact_file_path
                    if (
                        entry.contact_file_path &&
                        entry.contact_file_path !== "null"
                    ) {
                        entry.contact_file_path = `${process.env.GET_LIVE_CURRENT_URL}/resources/${entry.contact_file_path}`;
                    } else {
                        entry.contact_file_path = null;
                    }
                });
                return res
                    .status(responseCode.OK)
                    .send(
                        commonResponse(
                            responseCode.OK,
                            responseConst.DATA_RETRIEVE_SUCCESS,
                            getDataById.values
                        )
                    );
            }
            const getData = await SosUserListService.getDataByUserIdByView(user_id)
            if (getData.length !== 0) {
                 for(let i = 0;i<getData.length;i++){
                    const currentData = getData[i]
                    if(currentData.user_file_path!==null && currentData.user_file_path!=="" && currentData.user_file_path!==undefined && currentData.user_file_path!=="null"){
                    currentData.user_file_path = `${process.env.GET_LIVE_CURRENT_URL}/resources/${currentData.user_file_path}`
                    }else{
                        currentData.user_file_path = null
                    }
                    if(currentData.contact_file_path!==null && currentData.contact_file_path!=="" && currentData.contact_file_path!==undefined && currentData.contact_file_path!=="null"){
                    currentData.contact_file_path = `${process.env.GET_LIVE_CURRENT_URL}/resources/${currentData.contact_file_path}`
                    }else{
                        currentData.contact_file_path= null
                    }
                }
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
    },createOrUpdateSosUserList:async(req,res)=>{
        try{
            const data = req.body
            // const getAllData = await SosUserListService.getAllCountByView()
            // const getWetherFilePresent = await LocalJsonHelper.checkDataStatus(json_fileName)
            // if(!getWetherFilePresent.exists || getWetherFilePresent.totalCount!==getAllData[0].total_count){
            //     const getAllFileData = await SosUserListService.getAllService()
            //     for(let i = 0;i<getAllFileData.length;i++){
            //         const current_data = getAllFileData[i]
            //         await LocalJsonHelper.set(getSosUserJsonFileName(current_data.user_id), null, current_data, null);
            //     }
            // }
            const maxUserIdResult = await SosUserListService.getMaxUserIdByView();
            const maxUserId = maxUserIdResult[0].max_user_id;
            const batchSize = 500;
            const totalBatches = Math.ceil(maxUserId / batchSize);

            for (let batchNumber = 1; batchNumber <= totalBatches; batchNumber++) {
                const lowerLimit = (batchNumber - 1) * batchSize + 1;
                const upperLimit = batchNumber * batchSize;

                // const fileName = `sos_user/user_${lowerLimit}_${upperLimit}.json`;
                const fileDetails = {
                view_name: null,
                folder_name: "sos_user",
                json_file_name:`user_${lowerLimit}_${upperLimit}.json`
                }
                const fileStatus = await LocalJsonHelper.getFileStatus(fileDetails,"15d");
                const currentBatchCount = await SosUserListService.getCountForUserIdRange(lowerLimit, upperLimit);

                if (!fileStatus.exists || fileStatus.totalCount !== currentBatchCount[0].total_count) {
                    const offset = lowerLimit - 1;
                    const limit = batchSize;

                    const batchData = await SosUserListService.getAllServiceWithLimitOffset(limit, offset);

                    await LocalJsonHelper.save(fileDetails,batchData,null,null,true,"15d");
                }
            }
            const checkWetherDataIsPresent = await SosUserListService.getDataByUserIdAndContactUserId(data.user_id,data.contact_user_id)
            if(checkWetherDataIsPresent && checkWetherDataIsPresent.length>0){
                await addMetaDataWhileCreateUpdate(data, req, res, true);
                if(checkWetherDataIsPresent && checkWetherDataIsPresent[0].is_currently_active==false && data.is_currently_active == true){
                const checkCountOfContact = await SosUserListService.getuserCountByUserId(data.user_id)
                if(!checkCountOfContact[0].total_sos_count>=5){
                    return res
                    .status(responseCode.BAD_REQUEST)
                    .send(
                        commonResponse(
                            responseCode.BAD_REQUEST,
                            responseConst.SOS_USER_LIMIT_EXCEEDED,
                            null,
                            true
                        )
                    );
                }
                }
                
            // Update the record using ORM
            const updatedRowsCount = await SosUserListService.updateService(checkWetherDataIsPresent[0].sos_user_id, data);
            const getByIdAfterUpdate = await SosUserListService.getServiceById(checkWetherDataIsPresent[0].sos_user_id)
            
            const fileDetails2 = {
                view_name: null,
                folder_name: "sos_user",
                json_file_name:getSosUserJsonFileName(checkWetherDataIsPresent[0].sos_user_id)
                }
            await LocalJsonHelper.save(fileDetails2,getByIdAfterUpdate, "sos_user_id", checkWetherDataIsPresent[0].sos_user_id, false,"15d");
            // if (updatedRowsCount > 0) {
            //     const newData = await SosUserListService.getServiceById(id);
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
            }else{
                const checkCountOfContact = await SosUserListService.getuserCountByUserId(data.user_id)
                if(checkCountOfContact[0].total_sos_count<5){
                await addMetaDataWhileCreateUpdate(data, req, res, false);
                const createData = await SosUserListService.createService(data);
                                
                if (createData) {
                const getByIdAfterCreate = await SosUserListService.getServiceById(createData.dataValues.sos_user_id)
                const fileDetails2 = {
                view_name: null,
                folder_name: "sos_user",
                json_file_name:getSosUserJsonFileName(createData.dataValues.sos_user_id)
                }
            await LocalJsonHelper.save(fileDetails2, getByIdAfterCreate,"sos_user_id",createData.dataValues.sos_user_id , null,"15d");
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
                }else{
                   return res
                    .status(responseCode.BAD_REQUEST)
                    .send(
                        commonResponse(
                            responseCode.BAD_REQUEST,
                            responseConst.SOS_USER_LIMIT_EXCEEDED,
                            null,
                            true
                        )
                    ); 
                }
            }
        }catch(error){
            console.log("error in controller",error)
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

export default SosUserListController