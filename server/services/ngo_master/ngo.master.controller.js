import NgoMasterService from "./ngo.master.service.js";
import commonPath from "../../middleware/comman_path/comman.path.js";
import NgoFundSDetailsService from "../ngo_funds_details/ngo.funds.details.service.js";
import NgoOfficeBearersService from "../ngo_office_bearers/ngo.office.bearers.service.js";
import NgoStateDistrictMappingService from "../ngo_state_district_mapping/ngo.state.district.mapping.service.js";
import NgoFieldsMappingService from "../ngo_field_mapping/ngo.field.mapping.service.js";
import { ROLE_MASTER } from "../../utils/constants/id_constant/id.constants.js";
import UserMasterService from "../user_master/user.master.service.js";
import ngoMediaService from "../ngo_media/ngo.media.service.js";
const {commonResponse,responseCode,responseConst,logger,tokenData,currentTime,addMetaDataWhileCreateUpdate} = commonPath

const NgoMasterController = {
     // Create A new Record 
     create: async (req, res) => {
        try {
            const data = req.body;
            // Add metadata for creation (created by, created at)
            await addMetaDataWhileCreateUpdate(data, req, res, false);
            // data.created_by=1,
            // data.created_at = new Date()
            // Create the record using ORM
            const createData = await NgoMasterService.createService(data);
            if(createData){
                const ngo_id = createData.dataValues.ngo_id
                let pan_file_path_name = null , ngo_logo_path_name = null , crs_regis_path_name = null ;
                if(data.pan_file!==null && data.pan_file!=="" && data.pan_file!==0 && data.pan_file!==undefined){
                await saveBase64ToFile(
                    data.pan_file,
                    "ngo_master/" + ngo_id + `/"pan"`,
                    currentTime().replace(/ /g, "_").replace(/:/g, "-") +
                      "_" +
                      data.pan_cad_file_name
                  );
                  const upload_page_1 = data.pan_cad_file_name
                  ? `ngo_master/${ngo_id}/"pan"/${currentTime()
                      .replace(/ /g, "_")
                      .replace(/:/g, "-")}_${data.pan_cad_file_name}`
                  : null;
                  pan_file_path_name = upload_page_1
                }

                if(data.ngo_logo_file!==null && data.ngo_logo_file!=="" && data.ngo_logo_file!==0 && data.ngo_logo_file!==undefined){
                    await saveBase64ToFile(
                        data.ngo_logo_file,
                        "ngo_master/" + ngo_id + `/"logo"`,
                        currentTime().replace(/ /g, "_").replace(/:/g, "-") +
                          "_" +
                          data.ngo_logo
                      );
                      const upload_page_1 = data.ngo_logo
                      ? `ngo_master/${ngo_id}/"logo"/${currentTime()
                          .replace(/ /g, "_")
                          .replace(/:/g, "-")}_${data.ngo_logo}`
                      : null;
                      ngo_logo_path_name = upload_page_1
                    }

                    if(data.crs_regis_file!==null && data.crs_regis_file!=="" && data.crs_regis_file!==0 && data.crs_regis_file!==undefined){
                        await saveBase64ToFile(
                            data.crs_regis_file,
                            "ngo_master/" + ngo_id + `/"logo"`,
                            currentTime().replace(/ /g, "_").replace(/:/g, "-") +
                              "_" +
                              data.crs_regis_file_name
                          );
                          const upload_page_1 = data.crs_regis_file_name
                          ? `ngo_master/${ngo_id}/"logo"/${currentTime()
                              .replace(/ /g, "_")
                              .replace(/:/g, "-")}_${data.crs_regis_file_name}`
                          : null;
                          crs_regis_path_name = upload_page_1
                        }
                        const updateData  ={
                            ngo_logo:data.ngo_logo,
                            ngo_logo_path:ngo_logo_path_name,
                            pan_cad_file_name:data.pan_cad_file_name,
                            pan_card_file_url:pan_file_path_name,
                            crs_regis_file_name:data.crs_regis_file_name,
                            crs_regis_file_path:crs_regis_path_name,
                        } 
                        const updateNgomaster = await NgoMasterService.updateService(ngo_id,updateData)
            }
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
            const updatedRowsCount = await NgoMasterService.updateService(id, data);

            if(updatedRowsCount > 0){
                const ngo_id = id
                let pan_file_path_name = null , ngo_logo_path_name = null , crs_regis_path_name = null ;
                if(data.pan_file!==null && data.pan_file!=="" && data.pan_file!==0 && data.pan_file!==undefined){
                await saveBase64ToFile(
                    data.pan_file,
                    "ngo_master/" + ngo_id + `/"pan"`,
                    currentTime().replace(/ /g, "_").replace(/:/g, "-") +
                      "_" +
                      data.pan_cad_file_name
                  );
                  const upload_page_1 = data.pan_cad_file_name
                  ? `ngo_master/${ngo_id}/"pan"/${currentTime()
                      .replace(/ /g, "_")
                      .replace(/:/g, "-")}_${data.pan_cad_file_name}`
                  : null;
                  pan_file_path_name = upload_page_1
                }

                if(data.ngo_logo_file!==null && data.ngo_logo_file!=="" && data.ngo_logo_file!==0 && data.ngo_logo_file!==undefined){
                    await saveBase64ToFile(
                        data.ngo_logo_file,
                        "ngo_master/" + ngo_id + `/"logo"`,
                        currentTime().replace(/ /g, "_").replace(/:/g, "-") +
                          "_" +
                          data.ngo_logo
                      );
                      const upload_page_1 = data.ngo_logo
                      ? `ngo_master/${ngo_id}/"logo"/${currentTime()
                          .replace(/ /g, "_")
                          .replace(/:/g, "-")}_${data.ngo_logo}`
                      : null;
                      ngo_logo_path_name = upload_page_1
                    }

                    if(data.crs_regis_file!==null && data.crs_regis_file!=="" && data.crs_regis_file!==0 && data.crs_regis_file!==undefined){
                        await saveBase64ToFile(
                            data.crs_regis_file,
                            "ngo_master/" + ngo_id + `/"logo"`,
                            currentTime().replace(/ /g, "_").replace(/:/g, "-") +
                              "_" +
                              data.crs_regis_file_name
                          );
                          const upload_page_1 = data.crs_regis_file_name
                          ? `ngo_master/${ngo_id}/"logo"/${currentTime()
                              .replace(/ /g, "_")
                              .replace(/:/g, "-")}_${data.crs_regis_file_name}`
                          : null;
                          crs_regis_path_name = upload_page_1
                        }
                        const updateData  ={
                            ngo_logo:data.ngo_logo,
                            ngo_logo_path:ngo_logo_path_name,
                            pan_cad_file_name:data.pan_cad_file_name,
                            pan_card_file_url:pan_file_path_name,
                            crs_regis_file_name:data.crs_regis_file_name,
                            crs_regis_file_path:crs_regis_path_name,
                        } 
                        const updateNgomaster = await NgoMasterService.updateService(ngo_id,updateData)

            }
            // if (updatedRowsCount > 0) {
            //     const newData = await NgoMasterService.getServiceById(id);
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
            const getAll = await NgoMasterService.getAllService()

            // const fileStatus=await CommanJsonFunction.checkFileExistence(CITY_FOLDER,CITY_JSON)
            // // Store the data in JSON for future retrieval
            // if(fileStatus==false){
            //   const DataToSave=await NgoMasterService.getAllService()
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
    // Retrive all records with Limit
    getAllByViewWithLimit: async (req, res) => {
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
            const limit = req.query.limit;
            const offset = req.query.offset;
            // Fetch data from the database if JSON is empty
            const getAll = await NgoMasterService.getAllServiceWithLimit(limit, offset)
            // const fileStatus=await CommanJsonFunction.checkFileExistence(CITY_FOLDER,CITY_JSON)
            // // Store the data in JSON for future retrieval
            // if(fileStatus==false){
            //   const DataToSave=await NgoMasterService.getAllService()
            //   if(DataToSave.length!==0){
            //     await CommanJsonFunction.storeData( CITY_FOLDER, CITY_JSON, DataToSave, null, CITY_VIEW_NAME)
            //   }
            // }
            // Return fetched data or handle case where no data is found
            if(getAll.length !== 0){
                for(let i = 0; i < getAll.length; i++) {
                    let currentData = getAll[i];
                    const getNgoMedia = await ngoMediaService.getDataByNgoId(currentData.ngo_id);
                    currentData.ngo_media = getNgoMedia;
                }
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
            const getDataByid = await NgoMasterService.getServiceById(Id)

            // const fileStatus=await CommanJsonFunction.checkFileExistence(CITY_FOLDER,CITY_JSON)
            // // Store the data in JSON for future retrieval
            // if(fileStatus==false){
            //   const DataToSave=await NgoMasterService.getAllService()
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
            const deleteData = await NgoMasterService.deleteByid(id, req, res)
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
    },createOrUpdateNgoMaster:async(req,res)=>{
        try{
            const data = req.body;
            let ngoWalaId = null
            let ngo_fund_saved_data = false
            let ngo_office_berrars = false
            let ngo_state_mappingData = false
            let ngo_master_saved = false
            let ngo_fields_mapping_saved = false
            

            // Add metadata for creation (created by, created at)
            
            // data.created_by=1,
            // data.created_at = new Date()
            // Create the record using ORM
            if(data.ngo_id!==null && data.ngo_id!=="" && data.ngo_id!==0 && data.ngo_id!==undefined){
                const getNgoMasterData = await NgoMasterService.getServiceById(data.ngo_id)
                await addMetaDataWhileCreateUpdate(data, req, res, true);
                const updateData = await NgoMasterService.updateService(data.ngo_id,data);
                if(updateData>0){
                    ngo_master_saved = true
                }
                const getDataByEmail = await UserMasterService.getUserByEmailIdByView(getNgoMasterData.email)
                if(getDataByEmail && getDataByEmail.length!==0){
                    if(getDataByEmail.password !== data.password){
                    const updatePasswordData = {
                        email_id:data.email_id,
                        password:data.password
                    }

                    const updateUser = await UserMasterService.updateService(getDataByEmail.user_id,updatePasswordData)
                    }
                }
                ngoWalaId = data.ngo_id
            }else{
            if(!data.email || !data.password){
                return res
                .status(responseCode.BAD_REQUEST)
                .send(
                    commonResponse(
                        responseCode.BAD_REQUEST,
                        responseConst.EMAIL_AND_PASSWORD_REQUIRED,
                        null,
                        true
                    )
                );
            }
            await addMetaDataWhileCreateUpdate(data, req, res, false);
            const createData = await NgoMasterService.createService(data);
            if(createData){
                ngo_master_saved = true
            }
             ngoWalaId = createData.dataValues.ngo_id
                }
                if(ngoWalaId!==null && ngoWalaId!==undefined && ngoWalaId!=="" && ngoWalaId!==0){
                    let pan_file_path_name = null , ngo_logo_path_name = null , crs_regis_path_name = null ;
                if(data.pan_file!==null && data.pan_file!=="" && data.pan_file!==0 && data.pan_file!==undefined){
                await saveBase64ToFile(
                    data.pan_file,
                    "ngo_master/" + ngo_id + `/"pan"`,
                    currentTime().replace(/ /g, "_").replace(/:/g, "-") +
                      "_" +
                      data.pan_cad_file_name
                  );
                  const upload_page_1 = data.pan_cad_file_name
                  ? `ngo_master/${ngo_id}/"pan"/${currentTime()
                      .replace(/ /g, "_")
                      .replace(/:/g, "-")}_${data.pan_cad_file_name}`
                  : null;
                  pan_file_path_name = upload_page_1
                }

                if(data.ngo_logo_file!==null && data.ngo_logo_file!=="" && data.ngo_logo_file!==0 && data.ngo_logo_file!==undefined){
                    await saveBase64ToFile(
                        data.ngo_logo_file,
                        "ngo_master/" + ngo_id + `/"logo"`,
                        currentTime().replace(/ /g, "_").replace(/:/g, "-") +
                          "_" +
                          data.ngo_logo
                      );
                      const upload_page_1 = data.ngo_logo
                      ? `ngo_master/${ngo_id}/"logo"/${currentTime()
                          .replace(/ /g, "_")
                          .replace(/:/g, "-")}_${data.ngo_logo}`
                      : null;
                      ngo_logo_path_name = upload_page_1
                    }

                    if(data.crs_regis_file!==null && data.crs_regis_file!=="" && data.crs_regis_file!==0 && data.crs_regis_file!==undefined){
                        await saveBase64ToFile(
                            data.crs_regis_file,
                            "ngo_master/" + ngo_id + `/"logo"`,
                            currentTime().replace(/ /g, "_").replace(/:/g, "-") +
                              "_" +
                              data.crs_regis_file_name
                          );
                          const upload_page_1 = data.crs_regis_file_name
                          ? `ngo_master/${ngo_id}/"logo"/${currentTime()
                              .replace(/ /g, "_")
                              .replace(/:/g, "-")}_${data.crs_regis_file_name}`
                          : null;
                          crs_regis_path_name = upload_page_1
                        }
                        const updateData  ={
                            ngo_logo:data.ngo_logo,
                            ngo_logo_path:ngo_logo_path_name,
                            pan_cad_file_name:data.pan_cad_file_name,
                            pan_card_file_url:pan_file_path_name,
                            crs_regis_file_name:data.crs_regis_file_name,
                            crs_regis_file_path:crs_regis_path_name,
                        } 
                        const updateNgomaster = await NgoMasterService.updateService(ngoWalaId,updateData)
                        const createUserMaster = {
                            user_name:data.email,
                            password:data.password,
                            full_name:data.ngo_name,
                            email_id:data.email,
                            gender:'NA',
                            enrolling_date:currentTime(),
                            ngo_id:ngoWalaId,
                            role_id:ROLE_MASTER.NGO
                        }
                        await addMetaDataWhileCreateUpdate(createUserMaster, req, res, false);
                        const CreateUser = await UserMasterService.createService(createUserMaster) 
                }

                if(ngoWalaId!==null && ngoWalaId!==undefined && ngoWalaId!=="" && ngoWalaId!==0 && data.ngoFundsList){
                    if(data.ngoFundsList && data.ngoFundsList.length==0){
                        ngo_fund_saved_data = true
                    }
                    for(let i =0 ;i<data.ngoFundsList.length;i++){
                        let currentData = data.ngoFundsList[i]
                        if(currentData.ngo_funds_id!==null && currentData.ngo_funds_id!=="" && currentData.ngo_funds_id!==0 && currentData.ngo_funds_id!==undefined){
                            currentData.modified_by = tokenData(req,res)
                            currentData.modified_at = currentTime()
                            currentData.ngo_id = ngoWalaId
                            const updateNgoFundsDetails = await NgoFundSDetailsService.updateService(currentData.ngo_funds_id,currentData)
                            if(updateNgoFundsDetails>0){
                                ngo_fund_saved_data = true
                            }
                        }else{
                            currentData.created_by = tokenData(req,res)
                            currentData.created_at = currentTime()
                            currentData.is_active = true
                            currentData.ngo_id = ngoWalaId
                            const CreateNgoFundsDetails = await NgoFundSDetailsService.createService(currentData)
                            if(CreateNgoFundsDetails){
                                ngo_fund_saved_data = true
                            }
                        }
                    }
                }else{
                    ngo_fund_saved_data = true
                }
                if(ngoWalaId!==null && ngoWalaId!==undefined && ngoWalaId!=="" && ngoWalaId!==0 && data.ngoOfficeBearersList){
                    if(data.ngoOfficeBearersList && data.ngoOfficeBearersList.length == 0){
                        ngo_office_berrars = true
                    }
                    for(let i =0 ;i<data.ngoOfficeBearersList.length;i++){
                        let office_berars_current = data.ngoOfficeBearersList[i]
                        if(office_berars_current.bearer_id!=="" && office_berars_current.bearer_id!==null && office_berars_current.bearer_id!==undefined && office_berars_current.bearer_id!==0){
                            office_berars_current.modified_by = tokenData(req,res)
                            office_berars_current.modified_at = currentTime()
                            office_berars_current.ngo_id = ngoWalaId
                            const updateNgoBerrars = await NgoOfficeBearersService.updateService(office_berars_current.bearer_id,office_berars_current)
                            if(updateNgoBerrars>0){
                                ngo_office_berrars = true
                            }
                        }else{
                            office_berars_current.created_by = tokenData(req,res)
                            office_berars_current.created_at = currentTime()
                            office_berars_current.is_active = true
                            office_berars_current.ngo_id = ngoWalaId
                            const createNgoBerrares = await NgoOfficeBearersService.createService(office_berars_current)
                            if(createNgoBerrares){
                                ngo_office_berrars = true;
                            }
                        } 
                    }
                } else {
                    ngo_office_berrars = true;
                }
                if(ngoWalaId!==null && ngoWalaId!==undefined && ngoWalaId!=="" && ngoWalaId!==0 && data.ngoStateDistrictCityList){
                    if(data.ngoStateDistrictCityList &&  data.ngoStateDistrictCityList.length == 0){
                        ngo_state_mappingData = true
                    }
                    for(let i =0 ;i<data.ngoStateDistrictCityList.length;i++){
                        let currentDataSatateDistrict = data.ngoStateDistrictCityList[i]
                        if(currentDataSatateDistrict.ngo_state_district_mapping_id!==null && currentDataSatateDistrict.ngo_state_district_mapping_id!==0 && currentDataSatateDistrict.ngo_state_district_mapping_id!==undefined && currentDataSatateDistrict.ngo_state_district_mapping_id!==""){
                            currentDataSatateDistrict.modified_by = tokenData(req,res)
                            currentDataSatateDistrict.modified_at = currentTime()
                            currentDataSatateDistrict.ngo_id = ngoWalaId
                            const updateStateDistringMapping = await NgoStateDistrictMappingService.updateService(currentDataSatateDistrict.ngo_state_district_mapping_id,currentDataSatateDistrict)
                            if(updateStateDistringMapping>0){
                                ngo_state_mappingData = true
                            }
                        }else{
                            currentDataSatateDistrict.created_by = tokenData(req,res)
                            currentDataSatateDistrict.created_at = currentTime()
                            currentDataSatateDistrict.is_active = true
                            currentDataSatateDistrict.ngo_id = ngoWalaId
                            const createSatateDistrictMapping = await NgoStateDistrictMappingService.createService(currentDataSatateDistrict)
                            if(createSatateDistrictMapping){
                                ngo_state_mappingData = true
                            }
                        }
                    }
                }else{
                    ngo_state_mappingData = true 
                }
                if(ngoWalaId!==null && ngoWalaId!==undefined && ngoWalaId!=="" && ngoWalaId!==0 && data.ngoFieldList){
                    if(data.ngoFieldList &&  data.ngoFieldList.length == 0){
                        ngo_fields_mapping_saved = true
                    }
                    for(let i =0 ;i<data.ngoFieldList.length;i++){
                        let currentData = data.ngoFieldList[i]
                        if(currentData.ngo_field_mapping_id!==null && currentData.ngo_field_mapping_id!==0 && currentData.ngo_field_mapping_id!=="" && currentData.ngo_field_mapping_id!==undefined){
                            currentData.modified_by = tokenData(req,res)
                            currentData.modified_at = currentTime()
                            currentData.ngo_id = ngoWalaId
                            const updateNgoField = await NgoFieldsMappingService.updateService(currentData.ngo_field_mapping_id,currentData)
                            if(updateNgoField>0){
                                ngo_fields_mapping_saved = true
                            }
                        }else{
                            currentData.created_by = tokenData(req,res)
                            currentData.created_at = currentTime()
                            currentData.is_active = true
                            currentData.ngo_id = ngoWalaId
                            const createNgoField = await NgoFieldsMappingService.createService(currentData)
                            if(createNgoField){
                                ngo_fields_mapping_saved = true
                            }
                        }
                    }
                }else{
                    ngo_fields_mapping_saved = true
                }
               
                if (ngo_state_mappingData && ngo_office_berrars && ngo_fund_saved_data && ngo_fields_mapping_saved && ngo_master_saved) {
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
    },getNgoMasterData:async(req,res)=>{
        try{
            const ngo_id = req.query.ngo_id
            // console.log("ngo_id",ngo_id)
            let getNgomaster = await NgoMasterService.getServiceById(ngo_id)
            const getNgoOfficeBerrares = await NgoOfficeBearersService.getDataByNgoId(ngo_id)
            const ngoFundsDetails = await NgoFundSDetailsService.getDataByIdNgoId(ngo_id)
            const ngoStateDistrictMapping = await NgoStateDistrictMappingService.getDataByNgoId(ngo_id)
            const getNgoMedia = await ngoMediaService.getDataByNgoId(ngo_id)
            const getUserDetails = await UserMasterService.getUserByEmailIdByView(getNgomaster.email)
            getNgomaster.office_berears_list = getNgoOfficeBerrares
            getNgomaster.ngo_funds_details = ngoFundsDetails
            getNgomaster.ngo_state_district_mapping_list = ngoStateDistrictMapping
            getNgomaster.ngo_media = getNgoMedia
            if (getNgomaster.length !== 0) {
            getNgomaster.password = getUserDetails.password
                return res
                    .status(responseCode.OK)
                    .send(
                        commonResponse(
                            responseCode.OK,
                            responseConst.DATA_RETRIEVE_SUCCESS,
                            getNgomaster
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
    },blacklistNgo:async(req,res)=>{
        try{
            const ngo_id = req.query.ngo_id
            const UpdateNgo = {
                is_blacklist:req.body.is_blacklist,
                blacklist_reason:req.body.blacklist_reason
            }
            if(req.body.also_block_user){
                const UserUpdate = {
                    is_blacklisted : req.body.is_blacklist,
                    blacklist_reason : req.body.blacklist_reason
                }
                await addMetaDataWhileCreateUpdate(UserUpdate, req, res, true);
                const updateUser = await UserMasterService.BlockAllUserAccoringToNgo(ngo_id,UserUpdate)
            }
            await addMetaDataWhileCreateUpdate(UpdateNgo, req, res, true);
            const BlackistNgo = await NgoMasterService.updateService(ngo_id,UpdateNgo)
            if (BlackistNgo === 0) {
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
    },getAllBlacklisedNgo:async(req,res)=>{
        try{
            const getAll = await NgoMasterService.getAllBlackListedNgo()
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
    },ngoDashBoardCount:async(req,res)=>{
        try{
            const getData = await NgoMasterService.getTotalSumOfData()
            if (getData.length !== 0) {
                return res
                    .status(responseCode.OK)
                    .send(
                        commonResponse(
                            responseCode.OK,
                            responseConst.DATA_RETRIEVE_SUCCESS,
                            getData[0]
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
    },SearchNgoByName:async(req,res)=>{
        try{
            const ngo_name = req.query.ngo_name
            const getDataByFilter = await NgoMasterService.searchNgoByFilter(ngo_name)
            if (getDataByFilter.length !== 0) {
                for(let i = 0;i<getDataByFilter.length;i++){
                let currentData = getDataByFilter[i]
                currentData.ngo_logo_path =
                currentData.ngo_logo_path &&
                currentData.ngo_logo_path !== 'null' &&
                currentData.ngo_logo_path.trim() !== ''
                ? `${process.env.GET_LIVE_CURRENT_URL}/resources/${row.ngo_logo_path}`
                : null
                }
                return res
                    .status(responseCode.OK)
                    .send(
                        commonResponse(
                            responseCode.OK,
                            responseConst.DATA_RETRIEVE_SUCCESS,
                            getDataByFilter
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
export default NgoMasterController