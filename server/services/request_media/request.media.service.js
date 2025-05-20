import RequestMediaDAL from "./request.media.data.layer.js";

const RequestMediaService = {
  // Method to create a new record
  createSerive: async (data) => {
    try {
      return await RequestMediaDAL.CreateData(data);
    } catch (error) {
      throw error;
    }
  },
  // Method to update an existing record by its ID
  updateService: async (request_media_id, data) => {
    try {
      return await RequestMediaDAL.UpdateData(request_media_id, data);
    } catch (error) {
      throw error;
    }
  },
  // Method to retrieve all records
  getAllService: async () => {
    try {
      return await RequestMediaDAL.getAllDataByView();
    } catch (error) {
      throw error;
    }
  },
  // Method to retrieve a specific record by its ID
  getServiceById: async (request_media_id) => {
    try {
      return await RequestMediaDAL.getDataByIdByView(request_media_id);
    } catch (error) {
      throw error;
    }
  },
  // Method to mark a record as deleted (soft delete) by its
  deleteById: async (request_media_id, req, res) => {
    try {
      return await RequestMediaDAL.deleteDataById(request_media_id, req, res);
    } catch (error) {
      throw error;
    }
  },getDataByRequestIdByView:async(RequestId)=>{
    try{
      return await RequestMediaDAL.getDataByRequestIdByView(RequestId)
    }catch(error){
      throw error
    }
  },getAnyOneRequestMediaLink:async(request_id)=>{
    try{
      return await RequestMediaDAL.getANyOneRequestMediaById(request_id)
    }catch(error){
      throw error
    }
  }
};

export default RequestMediaService;
