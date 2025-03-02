import RequestService from "./requests.service.js";
import commonPath from "../../middleware/comman_path/comman.path.js";
import NgoMasterService from "../ngo_master/ngo.master.service.js";
import NgoStateDistrictMappingService from "../ngo_state_district_mapping/ngo.state.district.mapping.service.js";
import RequestNgoService from "../request_ngo/request.ngo.service.js";
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
            }
            const createData = await RequestService.createService(data);
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
            const getDataByid = await RequestService.getServiceById(Id)

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
            const getAllRequestByUserId = await RequestService.getAllRequestByUserId(user_id)
            if (getAllRequestByUserId.length !== 0) {
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
            console.log("getDataByCityId",getDataByCityId)
            if(getDataByCityId.length>0){
                console.log("inside city if")
                for(let i=0;i<getDataByCityId.length;i++){
                    console.log("inside city for")
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
            console.log("ngoIds",ngoIds)
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
            console.log("ngoIds",ngoIds)
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
                    console.log("CurrentData",CurrentData)
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
                    ngo.status_id = matchedRequest.status_id; // Update status_id if found
                }else{
                    ngo.Request_Ngo_Id = null
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
    }
}

export default RequestsController