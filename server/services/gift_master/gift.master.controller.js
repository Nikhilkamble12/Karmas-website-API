import GiftMasterService from "./gift.master.service.js";
import commonPath from "../../middleware/comman_path/comman.path.js";
import CouponsService from "../coupons/coupons.service.js";
import UserActivtyService from "../user_activity/user.activity.service.js";
const {commonResponse,responseCode,responseConst,logger,tokenData,currentTime,addMetaDataWhileCreateUpdate} = commonPath

const GiftMasterController = {
    // Create A new Record 
    create: async (req, res) => {
        try {
            const data = req.body;
            // Add metadata for creation (created by, created at)
            await addMetaDataWhileCreateUpdate(data, req, res, false);
            // data.created_by=1,
            // data.created_at = new Date()
            // Create the record using ORM
            const createData = await GiftMasterService.createService(data);
            if(createData) {
                if (data.gift_logo_file !== null && data.gift_logo_file !== "" && data.gift_logo_file !== 0 && data.gift_logo_file !== undefined && data.gift_logo && data.gift_logo !== "" && data.gift_logo !== 0) {
                    await saveBase64ToFile(
                        data.gift_logo_file,
                        "gift_master/" + createData.dataValues.gift_master_id + "/gift_logo",
                        currentTime().replace(/ /g, "_").replace(/:/g, "-") +
                        "_" +
                        data.gift_logo
                    )
                    const upload_page_1 = data.gift_logo
                        ? `gift_master/${createData.dataValues.gift_master_id}/gift_logo/${currentTime()
                            .replace(/ /g, "_")
                            .replace(/:/g, "-")}_${data.gift_logo}`
                        : null;

                    const updateGiftMaster = await GiftMasterService.updateService(createData.dataValues.gift_master_id, { gift_logo_path: upload_page_1 });
                }
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
            if (data.gift_logo_file !== null && data.gift_logo_file !== "" && data.gift_logo_file !== 0 && data.gift_logo_file !== undefined && data.gift_logo && data.gift_logo !== "" && data.gift_logo !== 0) {
                    await saveBase64ToFile(
                        data.gift_logo_file,
                        "gift_master/" + createData.dataValues.gift_master_id + "/gift_logo",
                        currentTime().replace(/ /g, "_").replace(/:/g, "-") +
                        "_" +
                        data.gift_logo
                    )
                    const upload_page_1 = data.gift_logo
                        ? `gift_master/${createData.dataValues.gift_master_id}/gift_logo/${currentTime()
                            .replace(/ /g, "_")
                            .replace(/:/g, "-")}_${data.gift_logo}`
                        : null;
                    data.gift_logo_path = upload_page_1
                    delete data.gift_logo_file
                }
            // Update the record using ORM
            const updatedRowsCount = await GiftMasterService.updateService(id, data);
            // if (updatedRowsCount > 0) {
            //     const newData = await GiftMasterService.getServiceById(id);
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
            const getAll = await GiftMasterService.getAllService()

            // const fileStatus=await CommanJsonFunction.checkFileExistence(CITY_FOLDER,CITY_JSON)
            // // Store the data in JSON for future retrieval
            // if(fileStatus==false){
            //   const DataToSave=await GiftMasterService.getAllService()
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
            const getDataByid = await GiftMasterService.getServiceById(Id)

            // const fileStatus=await CommanJsonFunction.checkFileExistence(CITY_FOLDER,CITY_JSON)
            // // Store the data in JSON for future retrieval
            // if(fileStatus==false){
            //   const DataToSave=await GiftMasterService.getAllService()
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
            const deleteData = await GiftMasterService.deleteByid(id, req, res)
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
    // get all gifts by user_id 
    getAllGiftsbyUserId: async (req, res) => {
        try {
            const user_id = tokenData(req, res);
            console.log("user_id", user_id);
            
            const [userScores, allGifts, userCoupons] = await Promise.all([
                UserActivtyService.getDataByUserId(user_id),
                GiftMasterService.getAllService(),
                CouponsService.getCouponsByUserId(user_id),
            ]);

            if (!userScores || userScores.length === 0) {
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

            const userScore = userScores[0].total_scores_no ?? 0;

            const giftResponse = allGifts.map((gift) => {
                const userCoupon = userCoupons.find(
                    (coupon) => coupon.gift_master_id === gift.gift_master_id
                );
                
                const progressValue = Math.min(
                    (userScore / gift.gift_score_required) * 100,
                    100
                );

                return {
                        ...gift,
                        progress: parseFloat(progressValue.toFixed(2)), // number e.g. 85.32
                        hasCoupon: !!userCoupon,
                        couponCode: userCoupon?.coupon_code ?? null,
                    };
                }
            );

            const updatedResponse = await Promise.all(giftResponse.map(async (currentData) => {
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
           
            return res
            .status(responseCode.OK)
            .send(
                commonResponse(
                    responseCode.OK,
                    responseConst.DATA_RETRIEVE_SUCCESS,
                    updatedResponse
                )
            );
        } catch (error) {
            logger.error(`Error ---> ${error}`);
            return res.status(responseCode.INTERNAL_SERVER_ERROR).send(
            commonResponse(
                responseCode.INTERNAL_SERVER_ERROR,
                responseConst.INTERNAL_SERVER_ERROR,
                null,
                true
            )
            );
        }
    },

}

export default GiftMasterController