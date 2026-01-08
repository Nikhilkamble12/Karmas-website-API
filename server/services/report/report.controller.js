import ReportService from "./report.service.js";
import commonPath from "../../middleware/comman_path/comman.path.js";
import { REPORT_PAGE_TYPE } from "../../utils/constants/id_constant/id.constants.js";
import NgoMasterService from "../ngo_master/ngo.master.service.js";
import UserMasterService from "../user_master/user.master.service.js";
import UserActivtyService from "../user_activity/user.activity.service.js";
import CommentService from "../Comments/comments.service.js";
import RequestCommentService from "../request_comments/request.comments.service.js";
import RequestService from "../requests/requests.service.js";
import PostService from "../Posts/posts.service.js";
import PostMediaService from "../PostMedia/postmedia.service.js";
import RequestMediaService from "../request_media/request.media.service.js";
const { commonResponse,responseCode, responseConst, logger,tokenData, currentTime,addMetaDataWhileCreateUpdate } = commonPath;


const ReportController = {
     // Create A new Record 
    create: async (req, res) => {
        try {
            const data = req.body;
            // Add metadata for creation (created by, created at)
            await addMetaDataWhileCreateUpdate(data, req, res, false);
            // data.created_by=1,
            // data.created_at = new Date()
            // Create the record using ORM
            const createData = await ReportService.createService(data);
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
            const updatedRowsCount = await ReportService.updateService(id, data);
            // if (updatedRowsCount > 0) {
            //     const newData = await ReportService.getServiceById(id);
            //     // Update the JSON data in the file
            //     await CommanJsonFunction.updateDataByField(CITY_FOLDER, CITY_JSON, "table_id", id, newData, CITY_VIEW_NAME);
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
            const getAll = await ReportService.getAllService()

            // const fileStatus=await CommanJsonFunction.checkFileExistence(CITY_FOLDER,CITY_JSON)
            // // Store the data in JSON for future retrieval
            // if(fileStatus==false){
            //   const DataToSave=await ReportService.getAllService()
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
            // const getJsonDatabyId=await CommanJsonFunction.getFirstDataByField(CITY_FOLDER,CITY_JSON,"table_id",Id)
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
            const getDataByid = await ReportService.getServiceById(Id)

            // const fileStatus=await CommanJsonFunction.checkFileExistence(CITY_FOLDER,CITY_JSON)
            // // Store the data in JSON for future retrieval
            // if(fileStatus==false){
            //   const DataToSave=await ReportService.getAllService()
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
            const deleteData = await ReportService.deleteById(id, req, res)
            // Also delete data from the JSON file
            // const deleteSatus=await CommanJsonFunction.deleteDataByField(CITY_FOLDER,CITY_JSON,"table_id",id)
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
    },getDetailBySpecialId: async (req, res) => {
    try {
        const report_id = req.query.report_id;
        const getData = await ReportService.getServiceById(report_id);

        if (!getData || (Array.isArray(getData) && getData.length === 0)) {
            return res.status(responseCode.BAD_REQUEST).send(
                commonResponse(responseCode.BAD_REQUEST, responseConst.DATA_NOT_FOUND, null, true)
            );
        }

        let information_details = {};
        let images_details = []; // Always returns an array, empty if no images
        const baseUrl = `${process.env.GET_LIVE_CURRENT_URL}/resources/`;

        switch (Number(getData.report_page_type_id)) {
            case REPORT_PAGE_TYPE.NGO:
                information_details = await NgoMasterService.getServiceById(getData.pk_id);
                const fileFields = [
                    { key: "ngo_logo_path", label: "ngo_logo" },
                    { key: "pan_card_file_url", label: "pan_card" },
                    { key: "crs_regis_file_path", label: "crs_registration" },
                    { key: "digital_signature_file_path", label: "digital_signature" },
                    { key: "stamp_file_path", label: "stamp" }
                ];

                fileFields.forEach(field => {
                    const value = information_details[field.key];
                    if (value && value !== "null" && value !== "" && value !== 0) {
                        const fullUrl = `${baseUrl}${value}`;
                        information_details[field.key] = fullUrl; // Update object path
                        images_details.push({ type: field.label, url: fullUrl });
                    } else {
                        information_details[field.key] = null;
                    }
                });
                break;

            case REPORT_PAGE_TYPE.USER_PAGE:
                const user_master = await UserMasterService.getServiceById(getData.pk_id);
                const getActivty = await UserActivtyService.getDataByUserId(getData.pk_id);
                information_details = { ...user_master, ...getActivty[0] };

                // Handle Profile Photo (Construct URL instead of Base64)
                if (information_details.file_path && information_details.file_path !== "" && information_details.file_path !== 0) {
                    information_details.file_path = `${baseUrl}${information_details.file_path}`;
                    images_details.push({ type: "profile_image", url: information_details.file_path });
                } else {

                }

                // Handle Background Photo
                if (information_details.bg_image_path && information_details.bg_image_path !== "" && information_details.bg_image_path !== 0) {
                    information_details.bg_image_path = `${baseUrl}${information_details.bg_image_path}`;
                    images_details.push({ type: "background_image", url: information_details.bg_image_path });
                } else {
                    
                }
                break;

            case REPORT_PAGE_TYPE.REQUEST:
                information_details = await RequestService.getServiceById(getData.pk_id);
                const requestMedia = await RequestMediaService.getDataByRequestIdByView(information_details.RequestId);
                if (requestMedia && requestMedia.length > 0) {
                    images_details = requestMedia.map(media => ({
                        type: "request_media",
                        url: `${baseUrl}${media.file_path}`
                    }));
                }
                break;

            case REPORT_PAGE_TYPE.POST:
                information_details = await PostService.getServiceById(getData.pk_id);
                const postMedia = await PostMediaService.getDatabyPostIdByView(information_details.post_id);
                if (postMedia && postMedia.length > 0) {
                    images_details = postMedia.map(media => ({
                        type: "post_media",
                        url: `${baseUrl}${media.file_path}`
                    }));
                }
                break;

            case REPORT_PAGE_TYPE.POST_COMMENTS:
                information_details = await CommentService.getServiceById(getData.pk_id);
                break;

            case REPORT_PAGE_TYPE.REQUEST_COMMENTS:
                information_details = await RequestCommentService.getServiceById(getData.pk_id);
                break;
        }

        // Standardized Payload
        const responseData = {
            ...getData,
            information_details,
            images_details // Result: [{...}] or []
        };

        return res.status(responseCode.OK).send(
            commonResponse(responseCode.OK, responseConst.DATA_RETRIEVE_SUCCESS, responseData)
        );

    } catch (error) {
        logger.error(`Error in getDetailBySpecialId ---> ${error}`);
        return res.status(responseCode.INTERNAL_SERVER_ERROR).send(
            commonResponse(responseCode.INTERNAL_SERVER_ERROR, responseConst.INTERNAL_SERVER_ERROR, null, true)
        );
    }
}
}

export default ReportController