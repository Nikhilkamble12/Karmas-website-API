import PostMediaService from "./postmedia.service.js";
import commonPath from "../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
const {
  commonResponse,
  responseCode,
  responseConst,
  logger,
  tokenData,
  currentTime,
  addMetaDataWhileCreateUpdate,
} = commonPath;

const PostMediaController = {
  // Create a new record
  create: async (req, res) => {
    try {
      const data = req.body;
      // Add metadata to creation (created_by, created_at)
      await addMetaDataWhileCreateUpdate(data, req, res, false);
      // data.created_by = 1,
      // data.created_at = new Data()
      // Create the recod using ORM
      const createdData = await PostMediaService.createSerive(data);
      if (createdData) {
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
      console.log("error", error);
      logger.error(`Error --> ${error}`);
      return res
        .status(responseCode.INTERNAL_SERVER_ERROR)
        .send(
          commonResponse(
            responseCode.INTERNAL_SERVER_ERROR,
            responseConst.ERROR_ADDING_RECORD,
            null,
            true
          )
        );
    }
  },
  // Update a record
  update: async (req, res) => {
    try {
      const data = req.body;
      const id = req.query.id;
      // Add metadata to creation (updated_by, updated_at)
      await addMetaDataWhileCreateUpdate(data, req, res, true);
      // data.updated_by = 1,
      // data.updated_at = new Data()
      // Update the recod using ORM
      const updatedRowsCount = await PostMediaService.updateService(id, data);
      // if (updatedRowsCount > 0) {
      //     const newData = await PostMediaService.getServiceById(id);
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
      } else {
        return res
          .status(responseCode.OK)
          .send(
            commonResponse(
              responseCode.OK,
              responseConst.SUCCESS_UPDATING_RECORD
            )
          );
      }
    } catch (error) {
      console.log("error", error);
      logger.error(`Error --> ${error}`);
      return res
        .status(responseCode.INTERNAL_SERVER_ERROR)
        .send(
          commonResponse(
            responseCode.INTERNAL_SERVER_ERROR,
            responseConst.ERROR_UPDATING_RECORD,
            null,
            true
          )
        );
    }
  },

  // Retrieve all records
  getALLByView: async (req, res) => {
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
      const getAll = await PostMediaService.getAllService();
      // const fileStatus=await CommanJsonFunction.checkFileExistence(CITY_FOLDER,CITY_JSON)
      // // Store the data in JSON for future retrieval
      // if(fileStatus==false){
      //   const DataToSave=await PostMediaService.getAllService()
      //   if(DataToSave.length!==0){
      //     await CommanJsonFunction.storeData( CITY_FOLDER, CITY_JSON, DataToSave, null, CITY_VIEW_NAME)
      //   }
      // }
      // Return fetched data or handle case where no data is found
      if (getAll !== 0) {
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
  // Retrieve a specific record by its ID
  getByIdByView: async (req, res) => {
    try {
      const id = req.query.id;
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
      const getDataById = await PostMediaService.getServiceById(id);
      // const fileStatus=await CommanJsonFunction.checkFileExistence(CITY_FOLDER,CITY_JSON)
      // // Store the data in JSON for future retrieval
      // if(fileStatus==false){
      //   const DataToSave=await PostMediaService.getAllService()
      //   if(DataToSave.length!==0){
      //     await CommanJsonFunction.storeData( CITY_FOLDER, CITY_JSON, DataToSave, null, CITY_VIEW_NAME)
      //   }
      // }
      // Return the fetched data or handle case where no data is found
      if (getDataById.length !== 0) {
        return res
          .status(responseCode.OK)
          .send(
            commonResponse(
              responseCode.OK,
              responseConst.DATA_RETRIEVE_SUCCESS,
              getDataById
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
      console.log("error", error);
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
  // Delete a record
  deleteData: async (req, res) => {
    try {
      const id = req.query.id;
      // Delete data from the database
      const deleteData = await PostMediaService.deleteServiceById(id, req, res);
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
      console.log("error", error);
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
};

export default PostMediaController;
