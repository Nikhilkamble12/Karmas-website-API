import NgoRequestDocumentCategoryService from "./ngo.request.document.category.service.js";
import commonPath from "../../middleware/comman_path/comman.path.js";
import RequestNgoService from "../request_ngo/request.ngo.service.js";
import { STATUS_MASTER } from "../../utils/constants/id_constant/id.constants.js";
import RequestDocumentService from "../request_documents/request.documents.service.js";
const {commonResponse,responseCode,responseConst,logger,tokenData,currentTime,addMetaDataWhileCreateUpdate,LocalJsonHelper,TABLE_VIEW_FOLDER_MAP} = commonPath


const NgoRequestDocumentCategoryController = {
     // Create A new Record 
    create: async (req, res) => {
    try {
        const data = req.body

        // Add metadata
        await addMetaDataWhileCreateUpdate(data, req, res, false)

        // 1️⃣ Check if already exists
        const alreadyExists =
            await NgoRequestDocumentCategoryService
                .checkWetherAlreadyCreatedAndDocumentType(
                    data.ngo_id,
                    data.category_id,
                    data.document_type_id
                )

        if (alreadyExists?.length > 0) {
            return res.status(responseCode.CREATED).send(
                commonResponse(
                    responseCode.CREATED,
                    responseConst.DATA_ALREADY_PRESENT
                )
            )
        }

        // 2️⃣ Create mapping
        const createData =
            await NgoRequestDocumentCategoryService.createService(data)

        if (!createData) {
            return res.status(responseCode.BAD_REQUEST).send(
                commonResponse(
                    responseCode.BAD_REQUEST,
                    responseConst.ERROR_ADDING_RECORD,
                    null,
                    true
                )
            )
        }

        // 3️⃣ Get all approved requests for this NGO
        const allRequests =
            await RequestNgoService.getAllByFilterByNgoId(
                data.ngo_id,
                null,
                null,
                STATUS_MASTER.REQUEST_ADMIN_APPROVED
            )

        const liveRequestIds = allRequests.map(r => r.RequestId)

        // 4️⃣ Increase required document count (+1) for all live requests
        if (liveRequestIds.length > 0) {
            await RequestNgoService.UpdateRequestCountByRequestListDataCount(
                liveRequestIds,
                "ngo_document_required",
                1
            )
        }

        // 5️⃣ Find which requests already have this document uploaded
        let uploadedRequestIds = []

        if (liveRequestIds.length > 0) {
            const uploadedDocs =
                await RequestDocumentService
                    .getDataByRequestIdListAndDocumentType(
                        liveRequestIds,
                        data.document_type_id
                    )

            uploadedRequestIds =
                uploadedDocs.map(doc => doc.RequestId)
        }

        // 6️⃣ Increase uploaded count ONLY for requests that already have documents
        if (uploadedRequestIds.length > 0) {
            await RequestNgoService.UpdateRequestCountByRequestListDataCount(
                uploadedRequestIds,
                "ngo_document_uploaded",
                1
            )
        }

        return res.status(responseCode.CREATED).send(
            commonResponse(
                responseCode.CREATED,
                responseConst.SUCCESS_ADDING_RECORD
            )
        )

    } catch (error) {
        console.log("error", error)
        logger.error(`Error ---> ${error}`)

        return res.status(responseCode.INTERNAL_SERVER_ERROR).send(
            commonResponse(
                responseCode.INTERNAL_SERVER_ERROR,
                responseConst.INTERNAL_SERVER_ERROR,
                null,
                true
            )
        )
    }
},


    
    // update Record Into Db
    update: async (req, res) => {
        try {
            const id = req.query.id
            const data = req.body
            // Add metadata for modification (modified by, modified at)
            await addMetaDataWhileCreateUpdate(data, req, res, true);
            const getDataById = await NgoRequestDocumentCategoryService.getServiceById(id)
            if(getDataById && getDataById.length!==0 &&  getDataById.category_id!==data.category_id){
               const checkWetherAlreadyCreated = await NgoRequestDocumentCategoryService.checkWetherAlreadyCreatedAndDocumentType(data.ngo_id,data.category_id,data.document_type_id)
                if(checkWetherAlreadyCreated && checkWetherAlreadyCreated.length>0){
                    return res
                        .status(responseCode.CREATED)
                        .send(
                            commonResponse(
                                responseCode.CREATED,
                                responseConst.DATA_ALREADY_PRESENT
                            )
                        );
                } 
            }

            // Update the record using ORM
            const updatedRowsCount = await  NgoRequestDocumentCategoryService.updateService(id, data);
            // if (updatedRowsCount > 0) {
            //     const newData = await  NgoRequestDocumentCategoryService.getServiceById(id);
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
            const getAll = await  NgoRequestDocumentCategoryService.getAllService()

            // const fileStatus=await CommanJsonFunction.checkFileExistence(CITY_FOLDER,CITY_JSON)
            // // Store the data in JSON for future retrieval
            // if(fileStatus==false){
            //   const DataToSave=await  NgoRequestDocumentCategoryService.getAllService()
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
            const getDataByid = await  NgoRequestDocumentCategoryService.getServiceById(Id)

            // const fileStatus=await CommanJsonFunction.checkFileExistence(CITY_FOLDER,CITY_JSON)
            // // Store the data in JSON for future retrieval
            // if(fileStatus==false){
            //   const DataToSave=await  NgoRequestDocumentCategoryService.getAllService()
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
            const getDataById = await NgoRequestDocumentCategoryService.getServiceById(id)
            // Delete data from the database
            const deleteData = await  NgoRequestDocumentCategoryService.deleteByid(id, req, res)
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
            const allRequests =
            await RequestNgoService.getAllByFilterByNgoId(
                getDataById.ngo_id,
                null,
                null,
                STATUS_MASTER.REQUEST_ADMIN_APPROVED
            )

        const liveRequestIds = allRequests.map(r => r.RequestId)

        // 4️⃣ Increase required document count (+1) for all live requests
        if (liveRequestIds.length > 0) {
            await RequestNgoService.UpdateRequestCountByRequestListDataCount(
                liveRequestIds,
                "ngo_document_required",
                -1
            )
        }

        // 5️⃣ Find which requests already have this document uploaded
        let uploadedRequestIds = []

        if (liveRequestIds.length > 0) {
            const uploadedDocs =
                await RequestDocumentService
                    .getDataByRequestIdListAndDocumentType(
                        liveRequestIds,
                        getDataById.document_type_id
                    )

            uploadedRequestIds =
                uploadedDocs.map(doc => doc.RequestId)
        }

        // 6️⃣ Increase uploaded count ONLY for requests that already have documents
        if (uploadedRequestIds.length > 0) {
            await RequestNgoService.UpdateRequestCountByRequestListDataCount(
                uploadedRequestIds,
                "ngo_document_uploaded",
                -1
            )
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
    },getDataByNgoId:async(req,res)=>{
        try{
            const ngo_id = req.query.id
            // If not found in JSON, fetch data from the database
            const getDataByid = await  NgoRequestDocumentCategoryService.getDataByNgoId(ngo_id)
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

export default NgoRequestDocumentCategoryController