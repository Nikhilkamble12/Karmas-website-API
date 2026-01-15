import PostMediaService from "./postmedia.service.js";
import commonPath from "../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
import uploadFileToS3Folder from "../../utils/helper/s3.common.code.js";
// import autoTagMedia from "../../utils/helper/auto.tag.media.js";
const {
  commonResponse,
  responseCode,
  responseConst,
  logger,
  tokenData,
  currentTime,
  addMetaDataWhileCreateUpdate,
  fs
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
      const getData = await PostMediaService.getServiceById(id)
      await uploadFileToS3Folder.deleteVideoByUrl(getData.s3_url)
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
  },BulkCreateOrUpdatePostMedia:async(req,res)=>{
      const data = req.body
    const fileType = req.file.mimetype; 
    const folderType = 'post'; 
    const filePath = req.file.path;  // Multer stores the file temporarily here
    const fileName = req.file.filename;
    // Ensure a file is uploaded
      function deleteFile(filePath) {
        // Use fs.unlink to remove the file at the specified file path
        fs.unlink(filePath, (err) => {
          if (err) {
            console.log("error while deleting file --->",err)
            // If an error occurs while deleting the file, log it
            console.error(`Error deleting file: ${filePath}`, err);
          } else {
            // If the file is successfully deleted, log the success
            console.log(`Local file deleted: ${filePath}`);
          }
        });
      }
    try{
      

    if (!req.file) {
      return res.status(400).send({ error: 'No file uploaded' });
    }
    console.log("data",data)
    console.log("data.post_id",data.post_id)
    if(data.post_id== "" || data.post_id== "undefined" || data.post_id== '0' || data.post_id==0 || data.post_id==undefined){
      deleteFile(filePath)
          return res 
          .status(responseCode.BAD_REQUEST)
          .send(
            commonResponse(
              responseCode.BAD_REQUEST,
              responseConst.POST_ID_IS_REQUIRED,
              null,
              true
            )
          )
    }
    if(data.sequence== "" || data.sequence== "undefined" || data.sequence== "0" || data.sequence== 0 || data.sequence== undefined){
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
    console.log("fileType",fileType)
    console.log("folderType",folderType)
    console.log("fileName",fileName)
    if(data.media_id){
    // You can dynamically decide where to store the file, for example, 'post' or 'request'
     // For example, 'post', 'request', etc.
    const s3BucketFileDynamic = `${folderType}/${data.post_id}/${data.sequence}/${fileName}`
    // Upload the file to S3
    const fileUrl = await uploadFileToS3Folder.uploadFileToS3( s3BucketFileDynamic, filePath,fileType);
    if (fileUrl.success) {
      
      // If the upload was successful, return the file URL or save it to the database
      const fileUrlData = fileUrl.url;
      const dataToStore = {
        media_url:fileUrlData,
        s3_url:fileUrl.s3_url,
        expiry_time:fileUrl.expiry_time,
        media_type:data.media_type,
        sequence:data.sequence,
        post_id:data.post_id,
      }
      await addMetaDataWhileCreateUpdate(dataToStore, req, res, true);
      const update = await PostMediaService.updateService(data.media_id,dataToStore)
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
  }else{
    const s3BucketFileDynamic = `${folderType}/${data.post_id}/${data.sequence}/${fileName}`
    // Upload the file to S3
    const fileUrl = await uploadFileToS3Folder.uploadFileToS3(s3BucketFileDynamic, filePath,fileType);
    console.log("fileUrl",fileUrl)
    if (fileUrl.success) {
      const fileUrlData = fileUrl.url;
    const dataToStore = {
      media_url:fileUrlData,
      s3_url:fileUrl.s3_url,
      expiry_time:fileUrl.expiry_time,
      media_type:data.media_type,
      sequence:data.sequence,
      post_id:data.post_id,
    }
    await addMetaDataWhileCreateUpdate(dataToStore, req, res, false);
    const createData = await PostMediaService.createSerive(dataToStore)
    deleteFile(filePath)
    if(createData) {
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
  }else{
    deleteFile(filePath)
    return res.status(500).send({
      error: 'File upload failed!'
    });
  }

  }
    }catch(error){
      deleteFile(filePath)
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
  },getPostMediaByPostId:async(req,res)=>{
    try{
      const post_id = req.query.post_id
      const getPostMedia = await PostMediaService.getDatabyPostIdByView(post_id)
      if (getPostMedia.length !== 0) {
        return res
          .status(responseCode.OK)
          .send(
            commonResponse(
              responseCode.OK,
              responseConst.DATA_RETRIEVE_SUCCESS,
              getPostMedia
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
};

export default PostMediaController;
