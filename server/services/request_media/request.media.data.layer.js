import RequestMediaModel from "./request.media.model.js"; 
import commonPath from "../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
const { db, ViewFieldTableVise, tokenData } = commonPath; // Destructure necessary components from commonPath

const RequestMediaDAL = {
  // Method to create a new record in the database
  CreateData: async (data) => {
    try {
      const createdData = await RequestMediaModel(db.sequelize).create(data);
      return createdData; // Return the created data
    } catch (error) {
      throw error; // Throw error for handling in the controller
    }
  },
  // Method to update an existing record by its ID
  UpdateData: async (request_media_id, data) => {
    try {
      const updateData = await RequestMediaModel(db.sequelize).update(data, {
        where: { request_media_id: request_media_id }, 
      }); // Return the result of the update operation
      return updateData;
    } catch (error) {
      throw error; // Throw error for handling in the controller
    }
  },
  // Method to retrieve all records by view
  getAllDataByView: async () => {
    try {
      const getAllData = await db.sequelize.query(
        `${ViewFieldTableVise.REQUEST_MEDIA_FIELDS}`,
        { type: db.Sequelize.QueryTypes.SELECT } 
      );
      return getAllData; // Return the retrieved data
    } catch (error) {
      throw error; // Throw error for handling in the controller
    }
  },
  // Method to retrieve a specific record by its ID
  getDataByIdByView: async (request_media_id ) => {
    try {
      const getDataById = await db.sequelize.query(
        ` ${ViewFieldTableVise.REQUEST_MEDIA_FIELDS} where request_media_id  = ${request_media_id} `,
        { type: db.Sequelize.QueryTypes.SELECT }
      );
      return getDataById[0] ?? [];  // Return the retrieved data
    } catch (error) {
      throw error; // Throw error for handling in the controller
    }
  },
  // Method to mark a record as deleted (soft delete)
  deleteDataById: async (request_media_id, req, res) => {
    try {
      const [deleteDataById] = await RequestMediaModel(db.sequelize).update(
        {
          is_active: 0,
          deleted_by: tokenData(req, res),
          deleted_at: new Date(),
        },
        {
          where: {
            request_media_id : request_media_id ,
          },
        }
      );
      return deleteDataById; // Return the result of the update operation
    } catch (error) {
      throw error; // Throw error for handling in the controller
    }
  },getDataByRequestIdByView:async(RequestId)=>{
    try{
      const getDataByRequestId = await db.sequelize.query(
        ` ${ViewFieldTableVise.REQUEST_MEDIA_FIELDS} where RequestId  = ${RequestId} `,
        { type: db.Sequelize.QueryTypes.SELECT }
      )
      return getDataByRequestId
    }catch(error){
      throw error
    }
  },getANyOneRequestMediaById:async(request_id)=>{
    try{
      let requestMedia = null
      const getReqestDataDefault = await db.sequelize.query(` ${ViewFieldTableVise.REQUEST_MEDIA_FIELDS} where RequestId = ${request_id} and sequence = 1 and media_url is not null `,{type:db.Sequelize.QueryTypes.SELECT})
      if(getReqestDataDefault && getReqestDataDefault.length==0){
        const getRequestDataWithoutSequence = await db.sequelize.query(` ${ViewFieldTableVise.REQUEST_MEDIA_FIELDS} where RequestId = ${request_id} and media_url is not null `,{type:db.Sequelize.QueryTypes.SELECT})
        if(getRequestDataWithoutSequence && getRequestDataWithoutSequence.length>0){
          requestMedia = getRequestDataWithoutSequence
        }
      }else if(getReqestDataDefault && getReqestDataDefault.length>0){
        requestMedia = getReqestDataDefault
      }
      return requestMedia
    }catch(error){
      throw error
    }
  }
};

export default RequestMediaDAL; // Export the CommentsDAL object for use in the controller
