import RequestService from "./requests.service.js";
import commonPath from "../../middleware/comman_path/comman.path.js";
import NgoMasterService from "../ngo_master/ngo.master.service.js";
import NgoStateDistrictMappingService from "../ngo_state_district_mapping/ngo.state.district.mapping.service.js";
import RequestNgoService from "../request_ngo/request.ngo.service.js";
import { STATUS_MASTER } from "../../utils/constants/id_constant/id.constants.js";
import RequestMediaService from "../request_media/request.media.service.js";
import UserActivtyService from "../user_activity/user.activity.service.js";
import notificationTemplates from "../../utils/helper/notification.templates.js";
import UserTokenService from "../user_tokens/user.tokens.service.js";
import uploadFileToS3Folder from "../../utils/helper/s3.common.code.js";
import sendTemplateNotification from "../../utils/helper/firebase.push.notification.js";
import UserRequestStatsService from "../user_request_stats/user.request.stats.service.js";
import RequestTagService from "../request_tag/request.tag.service.js";

const { commonResponse, responseCode, responseConst, logger, tokenData, currentTime, addMetaDataWhileCreateUpdate } = commonPath

const RequestsController = {
    // Create A new Record 
    create: async (req, res) => {
        try {
            const data = req.body;

            // 1. Setup & Validation
            // Ensure User ID is present
            if (!data.request_user_id || data.request_user_id == "0" || data.request_user_id == "null") {
                data.request_user_id = await tokenData(req, res);
            }

            await addMetaDataWhileCreateUpdate(data, req, res, false);

            // Set Default Status
            data.status_id = STATUS_MASTER.REQUEST_DRAFT;

            // 2. Create the Request Record FIRST (Fail Fast)
            // We create the record before updating counters. If this fails, the count remains correct.
            const createData = await RequestService.createService(data);

            if (createData) {
                const tasks = [];

                // 3. Parallel Execution (Atomic Updates & Stats)

                // A. Atomic Increment (Total Requests by User)
                // No need to fetch the whole row, just add +1
                tasks.push(UserActivtyService.UpdateUserDataCount(data.request_user_id, 'total_requests_no', 1));

                // B. Update User Request Statistics
                tasks.push(UserRequestStatsService.CreateOrUpdateData(data.request_user_id));

                // C. Notifications (Commented out in your code, but if needed, add here)
                // tasks.push(sendNotification(...));

                // Execute tasks simultaneously
                await Promise.allSettled(tasks);

                return res.status(responseCode.CREATED).send(
                    commonResponse(
                        responseCode.CREATED,
                        responseConst.SUCCESS_ADDING_RECORD,
                        createData
                    )
                );
            } else {
                return res.status(responseCode.BAD_REQUEST).send(
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
    // update Record Into Db
    update: async (req, res) => {
        try {
            const id = req.query.id
            const data = req.body
            // Add metadata for modification (modified by, modified at)
            await addMetaDataWhileCreateUpdate(data, req, res, true);
            const getRequestById = await RequestService.getServiceById(id)
            if (getRequestById.status_id == STATUS_MASTER.REQUEST_DRAFT && getRequestById.request_user_id !== tokenData(req, res)) {
                return res
                    .status(responseCode.BAD_REQUEST)
                    .send(
                        commonResponse(
                            responseCode.BAD_REQUEST,
                            responseConst.REQUEST_IS_INCOMPLETE,
                            null,
                            true
                        )
                    )
            }
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
            // await Promise.all(getAll.map(async(currentData)=> {
            //     const getTaggedUsers = await RequestTagService.getAllTagByRequestd(currentData.RequestId)
            //     currentData.tagged_users = getTaggedUsers
            // }))

            // 1️⃣ Extract all RequestIds
            const requestIds = getAll.map(item => item.RequestId);

            // 2️⃣ Fetch all tags for these RequestIds in one go
            const allTags = await RequestTagService.getAllTagsByMultipleRequestIds(requestIds);

            // 3️⃣ Group tags by RequestId
            const tagsByRequest = allTags.reduce((acc, tag) => {
                if (!acc[tag.request_id]) acc[tag.request_id] = [];
                acc[tag.request_id].push(tag);
                return acc;
            }, {});

            // 4️⃣ Assign tags to each request
            for (const currentData of getAll) {
                currentData.tagged_users = tagsByRequest[currentData.RequestId] || [];
            }


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
            console.log("error", error)
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
            const getRequestMedia = await RequestMediaService.getDataByRequestIdByView(Id)
            getDataByid.request_media = getRequestMedia
            const getTagedUsers = await RequestTagService.getAllTagByRequestd(Id)
            getDataByid.tagged_users = getTagedUsers
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
            console.log("error", error)
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
        const currentUserId = tokenData(req, res);

        // 1. Fetch Request Data (Fail Fast)
        const requestData = await RequestService.getServiceById(id);

        if (requestData && requestData.length==0) {
            return res.status(responseCode.BAD_REQUEST).send(
                commonResponse(responseCode.BAD_REQUEST, responseConst.DATA_NOT_FOUND, null, true)
            );
        }

        // 2. Authorization Check
        if (requestData.created_by !== currentUserId) {
            return res.status(responseCode.BAD_REQUEST).send(
                commonResponse(responseCode.BAD_REQUEST, responseConst.CANNOT_DELETE_REQUEST_AT_THIS_STAGE, null, true)
            );
        }

        // 3. Stage Validation (Cannot delete if Active/Approved/Rejected)
        // Assuming DRAFT is the only deletable stage
        const invalidStatuses = [
            STATUS_MASTER.REQUEST_APPROVAL_PENDINNG, 
            STATUS_MASTER.REQUEST_REJECTED, 
            STATUS_MASTER.REQUEST_APPROVED
        ];
        
        if (invalidStatuses.includes(parseInt(requestData.status_id))) {
            return res.status(responseCode.BAD_REQUEST).send(
                commonResponse(responseCode.BAD_REQUEST, responseConst.CANNOT_DELETE_REQUEST_AT_THIS_STAGE, null, true)
            );
        }

        const tasks = [];

        // 4. Decrement User Activity Stats (Atomic)
        if (requestData.request_user_id) {
            tasks.push(
                UserActivtyService.UpdateUserDataCount(requestData.request_user_id, 'total_requests_no', -1)
            );
        }

        // 5. Handle Media Deletion (S3 + DB)
        // Fetch media list first
        const requestMediaList = await RequestMediaService.getDataByRequestIdByView(id);
        
        if (requestMediaList && requestMediaList.length > 0) {
            // A. Delete from S3 (Parallelize)
            const s3Promises = requestMediaList.map(media => {
                if (media.s3_url) {
                    return uploadFileToS3Folder.deleteVideoByUrl(media.s3_url);
                }
            });
            tasks.push(Promise.allSettled(s3Promises));

            // B. Delete Media Records from DB
            tasks.push(RequestMediaService.deleteDataByRequestId(id, req, res));
        }

        // 6. Delete Main Request Record
        tasks.push(RequestService.deleteByid(id, req, res));

        // 7. Execute Deletions Simultaneously
        
        const results = await Promise.allSettled(tasks);

        // Check Main Delete Result (Last task added)
        const mainDeleteResult = results[results.length - 1];

        if (mainDeleteResult.status === 'fulfilled' && mainDeleteResult.value !== 0) {
            
            // 8. Post-Delete Cleanup: Recalculate NGO Stats (If assigned)
            // This runs AFTER delete to ensure counts are accurate
            if (requestData.AssignedNGO && requestData.AssignedNGO > 0) {
                // Since this is a heavy recalculation, we don't await it to block the response
                // Fire and Forget
                (async () => {
                    const stats = await RequestNgoService.getRequestNgoCountByNgo(requestData.AssignedNGO);
                    if (stats && stats.length > 0) {
                        await NgoMasterService.updateService(requestData.AssignedNGO, { 
                            total_request_assigned: stats[0].total_ngo_request, 
                            total_request_completed: stats[0].total_request_approved_status, 
                            total_request_rejected: stats[0].total_request_rejected 
                        });
                    }
                })();
            }

            return res.status(responseCode.CREATED).send(
                commonResponse(responseCode.CREATED, responseConst.SUCCESS_DELETING_RECORD)
            );
        } else {
             return res.status(responseCode.BAD_REQUEST).send(
                commonResponse(responseCode.BAD_REQUEST, responseConst.ERROR_DELETING_RECORD, null, true)
            );
        }

    } catch (error) {
        logger.error(`Error ---> ${error}`);
        return res.status(responseCode.INTERNAL_SERVER_ERROR).send(
            commonResponse(responseCode.INTERNAL_SERVER_ERROR, responseConst.INTERNAL_SERVER_ERROR, null, true)
        );
    }
},
     getRequestByUserId: async (req, res) => {
        try {
            const user_id = req.query.id
            const limit = req.query.limit
            const offset = req.query.offset
            const getAllRequestByUserId = await RequestService.getAllRequestByUserId(user_id, limit, offset)
            if (getAllRequestByUserId.length !== 0) {
                for (let i = 0; i < getAllRequestByUserId.length; i++) {
                    let currentData = getAllRequestByUserId[i]
                    const getRequestMedia = await RequestMediaService.getDataByRequestIdByView(currentData.RequestId)
                    currentData.request_media = getRequestMedia
                }
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
getNgoRequstDataForMapping :async (req, res) => {
    try {
        const request_id = req.query.RequestId;
        const transformNgoData = (ngoList) => {
            return ngoList.map(ngo => ({
                Request_Ngo_Id: null,
                ngo_id: ngo.ngo_id,
                ngo_name: ngo.ngo_name,
                unique_id: ngo.unique_id,
                ngo_type_name: ngo.ngo_type_name,
                darpan_reg_date: ngo.darpan_reg_date,
                registration_no: ngo.registration_no,
                email: ngo.email,
                mobile_no: ngo.mobile_no,
                status_id: null,
                Reason: null,
                status_name: null
            }));
        };
        const mergeRequestStatus = (ngoList, requestData) => {
        if (!requestData || requestData.length === 0) {
            return ngoList;
        }

        const requestMap = new Map(
            requestData.map(req => [req.ngo_id, req])
        );

        return ngoList.map(ngo => {
            const matchedRequest = requestMap.get(ngo.ngo_id);
            if (matchedRequest) {
                return {
                    ...ngo,
                    Request_Ngo_Id: matchedRequest.Request_Ngo_Id,
                    Reason: matchedRequest.Reason,
                    status_id: matchedRequest.status_id,
                    status_name: matchedRequest.status_name
                };
            }
            return ngo;
        });
        };
        // Validate request_id
        if (!request_id) {
            return res
                .status(responseCode.BAD_REQUEST)
                .send(
                    commonResponse(
                        responseCode.BAD_REQUEST,
                        'Request ID is required',
                        null,
                        true
                    )
                );
        }

        // Fetch request details
        const requestData = await RequestService.getServiceById(request_id);
        
        if (!requestData) {
            return res
                .status(responseCode.NOT_FOUND)
                .send(
                    commonResponse(
                        responseCode.NOT_FOUND,
                        'Request not found',
                        null,
                        true
                    )
                );
        }

        let fullData = [];
        const ngoIds = new Set(); // Use Set for O(1) lookup

        // Helper to add NGOs and track IDs
        const addNgoData = (ngoList) => {
            const transformed = transformNgoData(ngoList);
            transformed.forEach(ngo => {
                if (!ngoIds.has(ngo.ngo_id)) {
                    fullData.push(ngo);
                    ngoIds.add(ngo.ngo_id);
                }
            });
        };

        // Fetch NGOs in hierarchical order: City -> District -> State -> Country -> Remaining
        
        // 1. City level
        if (requestData.CityId) {
            const cityNgos = await NgoStateDistrictMappingService.getAllNgoDataByCityId(
                requestData.CityId
            );
            addNgoData(cityNgos);
        }

        // 2. District level (excluding already fetched)
        if (requestData.districtId) {
            const districtNgos = await NgoStateDistrictMappingService.getAllNgoDataByDistrictId(
                requestData.districtId,
                Array.from(ngoIds)
            );
            addNgoData(districtNgos);
        }

        // 3. State level (excluding already fetched)
        if (requestData.StateId) {
            const stateNgos = await NgoStateDistrictMappingService.getAllNgoDataByStateId(
                requestData.StateId,
                Array.from(ngoIds)
            );
            addNgoData(stateNgos);
        }

        // 4. Country level (remaining NGOs in mapping)
        const countryNgos = await NgoStateDistrictMappingService.getAllRemainingNgo(
            Array.from(ngoIds)
        );
        addNgoData(countryNgos);

        // 5. All other NGOs not yet selected
        const remainingNgos = await NgoMasterService.getAllNgoWhichAreNotSelected(
            Array.from(ngoIds)
        );
        addNgoData(remainingNgos);

        // Merge request status information
        const requestStatusData = await RequestNgoService.getAllNgoByRequestIdOnly(request_id);
        fullData = mergeRequestStatus(fullData, requestStatusData);

        // Return response
        if (fullData.length > 0) {
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
                .status(responseCode.NOT_FOUND)
                .send(
                    commonResponse(
                        responseCode.NOT_FOUND,
                        responseConst.DATA_NOT_FOUND,
                        null,
                        true
                    )
                );
        }
    } catch (error) {
        console.error('Error in getNgoRequestDataForMapping:', error);
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
    getRequestDataByDescUserWise: async (req, res) => {
        try {
            const user_id = tokenData(req, res)
            const limit = req.query.limit
            const already_viewed = req.query.already_viewed
            const getAllRequest = await RequestService.getRequestsForUserFeed(user_id, limit, already_viewed)
            // OPTIMIZATION 1: Early Exit
            // If no requests found, return immediately. 
            // Do not waste resources fetching media or processing arrays.
            if (!getAllRequest || getAllRequest.length === 0) {
                return res.status(responseCode.BAD_REQUEST).send(
                    commonResponse(
                        responseCode.BAD_REQUEST,
                        responseConst.DATA_NOT_FOUND,
                        null,
                        true
                    )
                );
            }

            // 2. Extract IDs
            const requestIds = getAllRequest.map(r => r.RequestId);

            // 3. Fetch Media
            const allRequestMedia = await RequestMediaService.getDataByMultipleRequestIdsByInForHomeScreen(requestIds);

            // OPTIMIZATION 2: Use a Map for Grouping
            // Maps are generally more performant than Objects for frequent additions/retrievals
            const mediaMap = new Map();

            // Single pass to group media
            for (const media of allRequestMedia) {
                const rid = media.RequestId;
                if (!mediaMap.has(rid)) {
                    mediaMap.set(rid, []);
                }
                mediaMap.get(rid).push(media);
            }

            // OPTIMIZATION 3: Pre-calculate static strings
            // Avoid accessing process.env inside the loop repeatedly
            const resourceBaseUrl = `${process.env.GET_LIVE_CURRENT_URL}/resources/`;

            // 4. Enrich Data
            // We mutate the object in place to avoid creating a new array copy (saving memory)
            getAllRequest.forEach(currentData => {
                // Normalize path
                if (currentData.request_user_file_path && currentData.request_user_file_path !== "null") {
                    currentData.request_user_file_path = resourceBaseUrl + currentData.request_user_file_path;
                } else {
                    currentData.request_user_file_path = null;
                }

                // Attach Media (O(1) lookup)
                currentData.request_media = mediaMap.get(currentData.RequestId) || [];
            });

            // 5. Success Response
            return res.status(responseCode.OK).send(
                commonResponse(
                    responseCode.OK,
                    responseConst.DATA_RETRIEVE_SUCCESS,
                    getAllRequest
                )
            );
        } catch (error) {
            console.log("error", error)
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
    }, getRequestByNgoId: async (req, res) => {
        try {
            const ngo_id = req.query.ngo_id;
            if (!ngo_id || ngo_id == "") {
                return res
                    .status(responseCode.BAD_REQUEST)
                    .send(
                        commonResponse(
                            responseCode.BAD_REQUEST,
                            responseConst.DATA_MISSING_KINDLY_CHECK,
                            null,
                            true
                        )
                    );
            }

            const getData = await RequestService.GetRequestByNgoId(ngo_id);

            if (!getData || getData.length === 0) {
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


            const updatedData = await Promise.all(
                getData.map(async (request) => {
                    const request_media = await RequestMediaService.getDataByRequestIdByView(request.RequestId);
                    return {
                        ...request,
                        request_media: request_media ?? null,
                    };
                })
            );


            return res
                .status(responseCode.OK)
                .send(
                    commonResponse(
                        responseCode.OK,
                        responseConst.DATA_RETRIEVE_SUCCESS,
                        updatedData
                    )
                );

        } catch (error) {
            console.error("Error:", error);
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
    }, getAllVideoRequestByUserIdForHome: async (req, res) => {
        try {
            const user_id = tokenData(req, res);
            const limit = req.query.limit;
            const already_viewed = req.query.already_viewed;

            // 1️⃣ Fetch requests with only video media
            const getAllRequestVideos = await RequestService.getRequestVideosForUserFeed(user_id, limit, already_viewed);

            // 2️⃣ Extract all request IDs
            const requestIds = getAllRequestVideos.map(r => r.RequestId);

            // 3️⃣ Fetch all media at once (only videos)
            const allRequestMedia = await RequestMediaService.getVideoDataByMultipleRequestIds(requestIds);

            // 4️⃣ Group media by RequestId
            const mediaByRequest = allRequestMedia.reduce((acc, media) => {
                if (!acc[media.RequestId]) acc[media.RequestId] = [];
                acc[media.RequestId].push(media);
                return acc;
            }, {});

            // 5️⃣ Attach media & normalize user file path
            const updatedRequestData = getAllRequestVideos.map(currentData => {
                if (
                    currentData.request_user_file_path &&
                    currentData.request_user_file_path !== "null" &&
                    currentData.request_user_file_path !== ""
                ) {
                    currentData.request_user_file_path = `${process.env.GET_LIVE_CURRENT_URL}/resources/${currentData.request_user_file_path}`;
                } else {
                    currentData.request_user_file_path = null;
                }

                currentData.request_media = mediaByRequest[currentData.RequestId] ?? [];
                return currentData;
            });

            // 6️⃣ Response
            if (getAllRequestVideos.length !== 0) {
                return res.status(responseCode.OK).send(
                    commonResponse(
                        responseCode.OK,
                        responseConst.DATA_RETRIEVE_SUCCESS,
                        updatedRequestData
                    )
                );
            } else {
                return res.status(responseCode.BAD_REQUEST).send(
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
            return res.status(responseCode.INTERNAL_SERVER_ERROR).send(
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