import CouponsService from "./coupons.service.js";
import commonPath from "../../middleware/comman_path/comman.path.js";
import GiftMasterService from "../gift_master/gift.master.service.js";
import UserActivtyService from "../user_activity/user.activity.service.js";
const {
  commonResponse,
  responseCode,
  responseConst,
  logger,
  tokenData,
  currentTime,
  addMetaDataWhileCreateUpdate,
} = commonPath;

const CouponsController = {
  // Create A new Record
  create: async (req, res) => {
    try {
      const data = req.body;
      // Add metadata for creation (created by, created at)
      await addMetaDataWhileCreateUpdate(data, req, res, false);
      // data.created_by=1,
      // data.created_at = new Date()
      // Create the record using ORM
      const createData = await CouponsService.createService(data);
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
  // update Record Into Db
  update: async (req, res) => {
    try {
      const id = req.query.id;
      const data = req.body;
      // Add metadata for modification (modified by, modified at)
      await addMetaDataWhileCreateUpdate(data, req, res, true);

      // Update the record using ORM
      const updatedRowsCount = await CouponsService.updateService(id, data);
      // if (updatedRowsCount > 0) {
      //     const newData = await CouponsService.getServiceById(id);
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
      const getAll = await CouponsService.getAllService();

      // const fileStatus=await CommanJsonFunction.checkFileExistence(CITY_FOLDER,CITY_JSON)
      // // Store the data in JSON for future retrieval
      // if(fileStatus==false){
      //   const DataToSave=await CouponsService.getAllService()
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
      const Id = req.query.id;
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
      const getDataByid = await CouponsService.getServiceById(Id);

      // const fileStatus=await CommanJsonFunction.checkFileExistence(CITY_FOLDER,CITY_JSON)
      // // Store the data in JSON for future retrieval
      // if(fileStatus==false){
      //   const DataToSave=await CouponsService.getAllService()
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
      // Delete data from the database
      const deleteData = await CouponsService.deleteByid(id, req, res);
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
  },
  bulkCreateOrUpdateCoupons: async (req, res) => {
    try {
      // Extract data from the request body
      // Assuming the request body contains an array of coupon objects  
      const data = req.body;
      // Validate the input data format 
      if (!Array.isArray(data) || data.length === 0) {
        return res
          .status(responseCode.BAD_REQUEST)
          .send(
            commonResponse(
              responseCode.BAD_REQUEST,
              responseConst.INVALID_DATA_FORMAT,
              null,
              true
            )
          );
      }
      // Validate each item in the data array
      for (let i = 0; i < data.length; i++) {
        const isUpdate = !!data[i].coupon_id;
        await addMetaDataWhileCreateUpdate(data[i], req, res, isUpdate);
      }
      // Call service to bulk create or update
      const bulkCreateOrUpdate = await CouponsService.bulkCreateOrUpdateService(data);
      if (bulkCreateOrUpdate && bulkCreateOrUpdate.length > 0) {
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
  // Get coupon by user id and gift_master_id
  getCouponAndRedeem: async (req, res) => {
    try {
      const user_id = req.query.user_id;
      const gift_master_id = req.query.gift_master_id;
      const getGiftDetails  = await GiftMasterService.getServiceById(gift_master_id)
      console.log("getGiftDetails",getGiftDetails)
      if(getGiftDetails &&getGiftDetails.length==0){
          return res
         .status(responseCode.BAD_REQUEST)
         .send(
            commonResponse(
              responseCode.BAD_REQUEST,
              responseConst.GIFT_NOT_FOUND,
              null,
              true
          )
      );
      }
      const getUserTotalScore = await UserActivtyService.getDataByUserId(user_id)
      if( getUserTotalScore.total_scores_no < getGiftDetails.gift_score_required){
          return res
         .status(responseCode.BAD_REQUEST)
         .send(
            commonResponse(
              responseCode.BAD_REQUEST,
              responseConst.USER_NOT_ELIGIBLE_FOR_GIFT,
              null,
              true
          )
      );
      }
      const existingCoupon = await CouponsService.getCouponAndRedeemService(user_id, gift_master_id);
      // If user has already redeemed a coupon for the given gift_master_id
      //console.log("existingCoupon", existingCoupon);
      if(existingCoupon){
        return res
          .status(responseCode.OK)
          .send(
            commonResponse(
              responseCode.OK,
              responseConst.COUPON_ALREADY_REDEEMED,
              existingCoupon
            )
          );
      } 
      // Assign Coupon to user
      const getNewCoupon = await CouponsService.getNewCoupon(gift_master_id);

      if(!getNewCoupon || getNewCoupon.length==0) {
         return res
         .status(responseCode.BAD_REQUEST)
         .send(
            commonResponse(
              responseCode.BAD_REQUEST,
              responseConst.NO_COUPONS_AVAILABLE,
              null,
              true
          )
      );
      }

      const assignCoupon = await CouponsService.assignCouponToUser(getNewCoupon.coupon_id,
          { 
            user_id: user_id, 
            status_id: 18, 
            redeem_date: currentTime().date, 
            redeem_time: currentTime().time 
          }
        );
      
      return res
        .status(responseCode.OK)
        .send(
          commonResponse(
            responseCode.OK,
            responseConst.DATA_RETRIEVE_SUCCESS,
            assignCoupon
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
};
export default CouponsController;
