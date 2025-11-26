import CompanyMasterService from "./company.master.service.js";
import commonPath from "../../middleware/comman_path/comman.path.js";
import getBase64FromFile from "../../utils/helper/base64.retrive.data.js";
import saveBase64ToFile from "../../utils/helper/base64ToFile.js";
const {commonResponse,responseCode,responseConst,logger,tokenData,currentTime,addMetaDataWhileCreateUpdate,LocalJsonHelper,TABLE_VIEW_FOLDER_MAP} = commonPath

const CompanyMasterController = {
    // Create A new Record 
    create: async (req, res) => {
        try {
            const data = req.body;
            // Add metadata for creation (created by, created at)
            await addMetaDataWhileCreateUpdate(data, req, res, false);
            // data.created_by=1,
            // data.created_at = new Date()
            // Create the record using ORM
            const createData = await CompanyMasterService.createService(data);
            if(createData) {
                if(data.company_logo_file !== null && data.company_logo_file !== "" && data.company_logo_file !== 0 && data.company_logo_file !== undefined && data.company_logo && data.company_logo !== "" && data.company_logo !== 0) {
                    await saveBase64ToFile(
                        data.company_logo_file,
                        "company_master/" + createData.dataValues.company_id + "/company_logo",
                        currentTime().replace(/ /g, "_").replace(/:/g, "-") +
                        "_" +
                        data.company_logo
                    );
                    const upload_page_1 = data.company_logo
                        ? `company_master/${createData.dataValues.company_id}/company_logo/${currentTime()
                            .replace(/ /g, "_")
                            .replace(/:/g, "-")}_${data.company_logo}`
                        : null;
        
                    const updateCompanyMaster = await CompanyMasterService.updateService(createData.dataValues.company_id, { company_logo_path: upload_page_1 });
                }
            }
            if (createData) {
                const getDataById = await CompanyMasterService.getServiceById(createData.dataValues.company_id)
                await LocalJsonHelper.save(TABLE_VIEW_FOLDER_MAP.company_master,getDataById,"company_id",createData.dataValues.company_id,null,"30d")
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
            if(data.company_logo_file !== null && data.company_logo_file !== "" && data.company_logo_file !== 0 && data.company_logo_file !== undefined && data.company_logo && data.company_logo !== "" && data.company_logo !== 0) {
                    await saveBase64ToFile(
                        data.company_logo_file,
                        "company_master/" + id + "/company_logo",
                        currentTime().replace(/ /g, "_").replace(/:/g, "-") +
                        "_" +
                        data.company_logo
                    );
                    const upload_page_1 = data.company_logo
                        ? `company_master/${id}/company_logo/${currentTime()
                            .replace(/ /g, "_")
                            .replace(/:/g, "-")}_${data.company_logo}`
                        : null;
                    data.company_logo_path = upload_page_1
                    delete data.company_logo_file
                }
            // Update the record using ORM
            const updatedRowsCount = await CompanyMasterService.updateService(id, data);
            // if (updatedRowsCount > 0) {
            //     const newData = await CompanyMasterService.getServiceById(id);
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
            const getDataById = await CompanyMasterService.getServiceById(id)
            await LocalJsonHelper.save(TABLE_VIEW_FOLDER_MAP.company_master,getDataById,"company_id",id,null,"30d")
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
            const localData = await LocalJsonHelper.getAll(TABLE_VIEW_FOLDER_MAP.company_master,"30d");
            if(localData!==null){
                if(localData.length!==0){
                  return res
                  .status(responseCode.OK)
                  .send(
                    commonResponse(
                      responseCode.OK,
                      responseConst.DATA_RETRIEVE_SUCCESS,
                      localData
                    )
                  );
                }
              }
            // Fetch data from the database if JSON is empty
            const getAll = await CompanyMasterService.getAllService()

            // const fileStatus=await CommanJsonFunction.checkFileExistence(CITY_FOLDER,CITY_JSON)
            // // Store the data in JSON for future retrieval
            // if(fileStatus==false){
            //   const DataToSave=await CompanyMasterService.getAllService()
            //   if(DataToSave.length!==0){
            //     await CommanJsonFunction.storeData( CITY_FOLDER, CITY_JSON, DataToSave, null, CITY_VIEW_NAME)
            //   }
            // }
            // Return fetched data or handle case where no data is found
         const updatedCompanyData = await Promise.all(getAll.map(async (currentData) => {
                // Normalize file path
                if (
                    currentData.company_logo_path &&
                    currentData.company_logo_path !== "null" &&
                    currentData.company_logo_path !== ""
                ) {
                    currentData.company_logo_path = `${process.env.GET_LIVE_CURRENT_URL}/resources/${currentData.company_logo_path}`;
                } else {
                    currentData.company_logo_path = null;
                }

                return currentData;

                }));

            if (getAll.length !== 0) {
                return res
                    .status(responseCode.OK)
                    .send(
                        commonResponse(
                            responseCode.OK,
                            responseConst.DATA_RETRIEVE_SUCCESS,
                            updatedCompanyData
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
            const getJsonDatabyId = await LocalJsonHelper.getByKey(TABLE_VIEW_FOLDER_MAP.company_master,"company_id",Id,"30d")
            if(getJsonDatabyId!==null){
              return res
                .status(responseCode.OK)
                .send(
                  commonResponse(
                    responseCode.OK,
                    responseConst.DATA_RETRIEVE_SUCCESS,
                    getJsonDatabyId
                  )
                );
            }

            // If not found in JSON, fetch data from the database
            const getDataByid = await CompanyMasterService.getServiceById(Id)

            // const fileStatus=await CommanJsonFunction.checkFileExistence(CITY_FOLDER,CITY_JSON)
            // // Store the data in JSON for future retrieval
            // if(fileStatus==false){
            //   const DataToSave=await CompanyMasterService.getAllService()
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
            onsole.log("error",error)
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
            const deleteData = await CompanyMasterService.deleteByid(id, req, res)
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
            await LocalJsonHelper.deleteEntry(TABLE_VIEW_FOLDER_MAP.company_master,"company_id",id,"30d")
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
    }
}

export default CompanyMasterController