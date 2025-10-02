import UserBlackListService from "./user.blacklist.service.js";
import commonPath from "../../middleware/comman_path/comman.path.js";
import UserActivtyService from "../user_activity/user.activity.service.js";
const {commonResponse,responseCode,responseConst,logger,tokenData,currentTime,addMetaDataWhileCreateUpdate} = commonPath

const validateCreateRequest = (data) => {
    const errors = [];
    const warnings = [];
    const sanitizedData = {};

    // Input type validation
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
        return { 
            isValid: false, 
            errors: ['Request body must be a valid JSON object'], 
            warnings: [],
            sanitizedData: null 
        };
    }

    // Check for suspicious patterns (basic security screening)
    const suspiciousPatterns = [/\b(script|javascript|eval|function)\b/i, /<[^>]*>/];
    const dataStr = JSON.stringify(data);
    
    for (const pattern of suspiciousPatterns) {
        if (pattern.test(dataStr)) {
            warnings.push('Potentially unsafe content detected in request');
            break;
        }
    }

    // Validate blacklisted_user_id (required) with enhanced checks
    if (!data.blacklisted_user_id) {
        errors.push('blacklisted_user_id is required');
    } else {
        const blacklistedUserId = parseInt(data.blacklisted_user_id);
        if (isNaN(blacklistedUserId)) {
            errors.push('blacklisted_user_id must be a valid integer');
        } else if (blacklistedUserId <= 0) {
            errors.push('blacklisted_user_id must be a positive integer');
        } else if (blacklistedUserId > 2147483647) { // INT max value
            errors.push('blacklisted_user_id exceeds maximum allowed value');
        } else {
            sanitizedData.blacklisted_user_id = blacklistedUserId;
        }
    }

    // Validate reason (optional string with enhanced security checks)
    if (data.reason !== undefined && data.reason !== null) {
        if (typeof data.reason !== 'string') {
            errors.push('reason must be a string if provided');
        } else {
            const trimmedReason = data.reason.trim();
            
            if (trimmedReason.length > 255) {
                errors.push('reason cannot exceed 255 characters');
            } else if (trimmedReason.length > 0) {
                // Basic content sanitization
                const sanitizedReason = trimmedReason
                    .replace(/[<>"'&]/g, '') // Remove potentially dangerous characters
                    .replace(/\s+/g, ' ') // Normalize whitespace
                    .substring(0, 255); // Ensure length limit
                    
                if (sanitizedReason.length < trimmedReason.length) {
                    warnings.push('Potentially unsafe characters were removed from reason field');
                }
                
                sanitizedData.reason = sanitizedReason;
            }
        }
    }

    // Validate blacklisted_at (optional date) with timezone handling
    if (data.blacklisted_at !== undefined && data.blacklisted_at !== null) {
        const blacklistedAt = new Date(data.blacklisted_at);
        if (isNaN(blacklistedAt.getTime())) {
            errors.push('blacklisted_at must be a valid date if provided');
        } else {
            // Check for reasonable date ranges (not in far future or ancient past)
            const now = new Date();
            const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
            const oneYearFromNow = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
            
            if (blacklistedAt < oneYearAgo) {
                warnings.push('blacklisted_at date is more than one year in the past');
            } else if (blacklistedAt > oneYearFromNow) {
                errors.push('blacklisted_at date cannot be more than one year in the future');
            }
            
            sanitizedData.blacklisted_at = blacklistedAt;
        }
    } else {
        // Default to current timestamp if not provided
        sanitizedData.blacklisted_at = new Date();
    }

    // Validate is_active (optional boolean) - validation
    if (data.is_active !== undefined && data.is_active !== null) {
        if (typeof data.is_active === 'boolean') {
            sanitizedData.is_active = data.is_active;
        } else if (data.is_active === 0 || data.is_active === '0' || data.is_active === false) {
            sanitizedData.is_active = false;
        } else if (data.is_active === 1 || data.is_active === '1' || data.is_active === true) {
            sanitizedData.is_active = true;
        } else {
            errors.push('is_active must be a boolean, 0, or 1 if provided');
        }
    } else {
        // Default to active if not specified
        sanitizedData.is_active = true;
    }

    // SECURITY: Reject user_id in request body - must come from token only
    if (data.user_id !== undefined) {
        errors.push('user_id cannot be provided in request body - it is determined from authentication token for security');
    }

    // SECURITY: Check for unexpected fields that might indicate tampering
    const allowedFields = ['blacklisted_user_id', 'reason', 'blacklisted_at', 'is_active'];
    const providedFields = Object.keys(data);
    const unexpectedFields = providedFields.filter(field => !allowedFields.includes(field) && field !== 'user_id');
    
    if (unexpectedFields.length > 0) {
        warnings.push(`Unexpected fields ignored: ${unexpectedFields.join(', ')}`);
    }

    return { 
        isValid: errors.length === 0, 
        errors, 
        warnings,
        sanitizedData: errors.length === 0 ? sanitizedData : null 
    };
};

const validateUserId = (userId) => {
    if (!userId) {
        return { isValid: false, error: 'User ID is required from authentication token' };
    }
    const parsedUserId = parseInt(userId);
    if (isNaN(parsedUserId) || parsedUserId <= 0) {
        return { isValid: false, error: 'Invalid user ID from authentication token' };
    }
    return { isValid: true, sanitizedUserId: parsedUserId };
};

const validateUserActivityData = (userActivityData) => {
    if (!userActivityData || !Array.isArray(userActivityData) || userActivityData.length === 0) {
        return { isValid: false, error: 'User activity data not found or empty' };
    }
    const activityRecord = userActivityData[0];
    if (!activityRecord || !activityRecord.user_activity_id) {
        return { isValid: false, error: 'Invalid user activity record structure' };
    }
    return { isValid: true, sanitizedData: activityRecord };
};

const UserBlackListController = {
    // Create A new Record with comprehensive validation and transaction support (UPSERT approach)
    create: async (req, res) => {
        // Generate operation ID for tracking
        const operationId = `op_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        const startTime = Date.now();
        
        try {
            const currentUserId = tokenData(req, res);
            logger.info(`[${operationId}] Starting block user operation`, {
                operatorUserId: currentUserId,
                requestBody: req.body,
                userAgent: req.headers['user-agent'],
                ipAddress: req.ip || req.connection.remoteAddress
            });
            
            // Step 1: Enhanced request validation with security checks
            const bodyValidation = validateCreateRequest(req.body);
            
            // Log validation warnings
            if (bodyValidation.warnings && bodyValidation.warnings.length > 0) {
                logger.warn(`[${operationId}] Validation warnings:`, {
                    warnings: bodyValidation.warnings,
                    userId: currentUserId
                });
            }
            
            if (!bodyValidation.isValid) {
                logger.warn(`[${operationId}] Validation failed:`, {
                    errors: bodyValidation.errors,
                    userId: currentUserId,
                    requestBody: req.body
                });
                
                return res.status(responseCode.BAD_REQUEST).send(
                    commonResponse(
                        responseCode.BAD_REQUEST,
                        responseConst.INVALID_INPUT_DATA + ': ' + bodyValidation.errors.join(', '),
                        {
                            operationId,
                            validationErrors: bodyValidation.errors,
                            warnings: bodyValidation.warnings
                        },
                        true
                    )
                );
            }

            // Step 2: Enhanced user ID validation from token
            const userValidation = validateUserId(currentUserId);
            if (!userValidation.isValid) {
                logger.error(`[${operationId}] Invalid user ID from token:`, {
                    error: userValidation.error,
                    tokenUserId: currentUserId
                });
                return res.status(responseCode.UNAUTHORIZED).send(
                    commonResponse(
                        responseCode.UNAUTHORIZED,
                        responseConst.INVALID_USER_ID,
                        { operationId },
                        true
                    )
                );
            }

            const sanitizedUserId = userValidation.sanitizedUserId;
            const { blacklisted_user_id } = bodyValidation.sanitizedData;

            // Step 3: Prevent self-blocking with detailed logging
            if (sanitizedUserId === blacklisted_user_id) {
                logger.warn(`[${operationId}] Self-blocking attempt:`, {
                    userId: sanitizedUserId,
                    attemptedToBlock: blacklisted_user_id
                });
                return res.status(responseCode.BAD_REQUEST).send(
                    commonResponse(
                        responseCode.BAD_REQUEST,
                        'Cannot block yourself',
                        { operationId },
                        true
                    )
                );
            }

            // Step 4: Get and validate user activity data
            const userActivityData = await UserActivtyService.getDataByUserId(sanitizedUserId);
            const activityValidation = validateUserActivityData(userActivityData);
            if (!activityValidation.isValid) {
                logger.error(`[${operationId}] User activity validation failed:`, {
                    error: activityValidation.error,
                    userId: sanitizedUserId,
                    activityData: userActivityData
                });
                return res.status(responseCode.BAD_REQUEST).send(
                    commonResponse(
                        responseCode.BAD_REQUEST,
                        responseConst.USER_ACTIVITY_NOT_FOUND,
                        { operationId },
                        true
                    )
                );
            }

            const userActivity = activityValidation.sanitizedData;
            
            // Step 5: Verify target user exists in the system
            const blacklistedUserActivity = await UserActivtyService.getDataByUserId(blacklisted_user_id);
            if (!blacklistedUserActivity || blacklistedUserActivity.length === 0) {
                logger.warn(`[${operationId}] Target user not found:`, {
                    targetUserId: blacklisted_user_id,
                    operatorUserId: sanitizedUserId
                });
                return res.status(responseCode.BAD_REQUEST).send(
                    commonResponse(
                        responseCode.BAD_REQUEST,
                        'User to be blocked does not exist',
                        { operationId, targetUserId: blacklisted_user_id },
                        true
                    )
                );
            }

            // Step 6: Prevent blocking already actively blocked users
            const existingActiveBlock = await UserBlackListService.getActiveBlacklistByUserIds(
                sanitizedUserId, 
                blacklisted_user_id
            );
            
            if (existingActiveBlock && existingActiveBlock.length > 0) {
                const blockedRecord = existingActiveBlock[0];
                logger.warn(`[${operationId}] Attempt to block already blocked user:`, {
                    operatorUserId: sanitizedUserId,
                    targetUserId: blacklisted_user_id,
                    existingBlockId: blockedRecord.blacklist_id,
                    existingBlockDate: blockedRecord.blacklisted_at,
                    existingReason: blockedRecord.reason
                });
                
                return res.status(responseCode.BAD_REQUEST).send(
                    commonResponse(
                        responseCode.BAD_REQUEST,
                        'User is already blocked lol you stupid',
                        {
                            operationId,
                            targetUserId: blacklisted_user_id,
                            alreadyBlockedSince: blockedRecord.blacklisted_at,
                            existingReason: blockedRecord.reason || 'No reason provided hehe',
                            message: 'This user is already in your blocked list DEMM'
                        },
                        true
                    )
                );
            }

            // Step 7: Prepare comprehensive blacklist data (user passed active block check)
            const blacklistData = {
                ...bodyValidation.sanitizedData,
                user_id: sanitizedUserId,  // Always use token-derived user_id for security
                blacklisted_user_id: blacklisted_user_id
            };
            
            await addMetaDataWhileCreateUpdate(blacklistData, req, res, false);

            // Step 8: Calculate current blocked count safely
            const currentBlockedCount = userActivity.total_blacklist_user;
            const safeCurrentCount = (currentBlockedCount && !isNaN(parseInt(currentBlockedCount))) 
                ? parseInt(currentBlockedCount) 
                : 0;

            logger.info(`[${operationId}] Proceeding with block operation (no active block exists):`, {
                operatorUserId: sanitizedUserId,
                targetUserId: blacklisted_user_id,
                currentBlockedCount: safeCurrentCount,
                activityId: userActivity.user_activity_id,
                reason: blacklistData.reason || 'No reason provided LOL '
            });

            // Step 9: Execute production-ready UPSERT transaction (CREATE or REACTIVATE only)
            const transactionResult = await UserBlackListService.createOrReactivateWithActivityUpdate(
                blacklistData,
                userActivity.user_activity_id,
                safeCurrentCount
            );

            // Step 10: Handle transaction result with comprehensive error handling
            const operationDuration = Date.now() - startTime;
            
            if (!transactionResult.success) {
                logger.error(`[${operationId}] Transaction failed:`, {
                    error: transactionResult.error,
                    errorType: transactionResult.errorType,
                    transactionId: transactionResult.transactionId,
                    operatorUserId: sanitizedUserId,
                    targetUserId: blacklisted_user_id,
                    duration: operationDuration,
                    originalError: transactionResult.originalError
                });
                
                // Production-grade error handling with specific status codes
                let statusCode = responseCode.INTERNAL_SERVER_ERROR;
                let errorMessage = "An unexpected error occurred while blocking the user";
                
                switch (transactionResult.errorType) {
                    case 'BusinessLogicError':
                    case 'SequelizeUniqueConstraintError':
                        statusCode = responseCode.BAD_REQUEST;
                        errorMessage = 'User is already blocked';
                        break;
                        
                    case 'SequelizeForeignKeyConstraintError':
                        statusCode = responseCode.BAD_REQUEST;
                        errorMessage = 'Referenced user does not exist';
                        break;
                        
                    case 'SequelizeValidationError':
                        statusCode = responseCode.BAD_REQUEST;
                        errorMessage = transactionResult.error;
                        break;
                        
                    case 'SequelizeConnectionError':
                    case 'SequelizeTimeoutError':
                        statusCode = responseCode.SERVICE_UNAVAILABLE;
                        errorMessage = 'Database service temporarily unavailable - please try again';
                        break;
                        
                    default:
                        statusCode = responseCode.INTERNAL_SERVER_ERROR;
                        errorMessage = 'Internal server error - operation failed';
                        break;
                }
                
                return res.status(statusCode).send(
                    commonResponse(
                        statusCode,
                        errorMessage,
                        {
                            operationId,
                            transactionId: transactionResult.transactionId,
                            errorType: transactionResult.errorType,
                            duration: operationDuration
                        },
                        true
                    )
                );
            }

            // Step 11: Success response with comprehensive operation details
            logger.info(`[${operationId}] Block operation completed successfully:`, {
                operationType: transactionResult.operationType,
                operatorUserId: sanitizedUserId,
                targetUserId: blacklisted_user_id,
                transactionId: transactionResult.transactionId,
                previousCount: transactionResult.previousCount,
                newCount: transactionResult.newCount,
                duration: operationDuration,
                reason: blacklistData.reason || 'No reason provided'
            });
            
            const successMessage = transactionResult.operationType === 'CREATE' 
                ? 'User has been successfully blocked'
                : 'User block has been reactivated';
            
            return res.status(responseCode.CREATED).send(
                commonResponse(
                    responseCode.CREATED,
                    successMessage,
                    {
                        operationId,
                        transactionId: transactionResult.transactionId,
                        operationType: transactionResult.operationType,
                        targetUserId: blacklisted_user_id,
                        blockedCount: transactionResult.newCount,
                        duration: operationDuration
                    },
                    false
                )
            );

        } catch (error) {
            const operationDuration = Date.now() - startTime;
            
            logger.error(`[${operationId}] Unexpected error in block user operation:`, {
                errorName: error.name,
                errorMessage: error.message,
                errorCode: error.code,
                stack: error.stack?.split('\n').slice(0, 10), // First 10 lines
                operatorUserId: currentUserId,
                requestBody: req.body,
                duration: operationDuration,
                userAgent: req.headers['user-agent'],
                ipAddress: req.ip || req.connection.remoteAddress
            });
            
            return res.status(responseCode.INTERNAL_SERVER_ERROR).send(
                commonResponse(
                    responseCode.INTERNAL_SERVER_ERROR,
                    'An unexpected error occurred while processing your request',
                    {
                        operationId,
                        duration: operationDuration,
                        errorCode: 'INTERNAL_ERROR'
                    },
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
            const updatedRowsCount = await UserBlackListService.updateService(id, data);
            // if (updatedRowsCount > 0) {
            //     const newData = await UserBlackListService.getServiceById(id);
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
            const getAll = await UserBlackListService.getAllService()

            // const fileStatus=await CommanJsonFunction.checkFileExistence(CITY_FOLDER,CITY_JSON)
            // // Store the data in JSON for future retrieval
            // if(fileStatus==false){
            //   const DataToSave=await UserBlackListService.getAllService()
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
            const getDataByid = await UserBlackListService.getServiceById(Id)

            // const fileStatus=await CommanJsonFunction.checkFileExistence(CITY_FOLDER,CITY_JSON)
            // // Store the data in JSON for future retrieval
            // if(fileStatus==false){
            //   const DataToSave=await UserBlackListService.getAllService()
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
    // Delete A Record with improved validation and logic
    deleteData: async (req, res) => {
        try {
            const id = req.query.id;
            
            // Validate ID parameter
            if (!id) {
                logger.warn('Delete attempt without ID parameter');
                return res.status(responseCode.BAD_REQUEST).send(
                    commonResponse(
                        responseCode.BAD_REQUEST,
                        'ID parameter is required',
                        null,
                        true
                    )
                );
            }

            const parsedId = parseInt(id);
            if (isNaN(parsedId) || parsedId <= 0) {
                logger.warn(`Invalid ID parameter provided: ${id}`);
                return res.status(responseCode.BAD_REQUEST).send(
                    commonResponse(
                        responseCode.BAD_REQUEST,
                        'ID must be a positive integer',
                        null,
                        true
                    )
                );
            }

            logger.info(`Starting delete operation for blacklist record ID: ${parsedId}`);
            
            // Get the blacklist record first to verify it exists
            const getDataById = await UserBlackListService.getServiceById(parsedId);
            if (!getDataById || !getDataById.user_id) {
                logger.warn(`Blacklist record not found for ID: ${parsedId}`);
                return res.status(responseCode.BAD_REQUEST).send(
                    commonResponse(
                        responseCode.BAD_REQUEST,
                        responseConst.DATA_NOT_FOUND,
                        null,
                        true
                    )
                );
            }

            // Get user activity data
            const getserActivityData = await UserActivtyService.getDataByUserId(getDataById.user_id);
            if (!getserActivityData || getserActivityData.length === 0) {
                logger.error(`User activity data not found for user ID: ${getDataById.user_id}`);
                return res.status(responseCode.BAD_REQUEST).send(
                    commonResponse(
                        responseCode.BAD_REQUEST,
                        responseConst.USER_ACTIVITY_NOT_FOUND,
                        null,
                        true
                    )
                );
            }

            const userActivity = getserActivityData[0];
            const currentBlockedCount = userActivity.total_blacklist_user;
            const safeCurrentCount = (currentBlockedCount && !isNaN(parseInt(currentBlockedCount))) 
                ? parseInt(currentBlockedCount) 
                : 0;

            // Delete data from the database
            const deleteResult = await UserBlackListService.deleteByid(parsedId, req, res);
            if (deleteResult === 0) {
                logger.error(`Failed to delete blacklist record ID: ${parsedId}`);
                return res.status(responseCode.BAD_REQUEST).send(
                    commonResponse(
                        responseCode.BAD_REQUEST,
                        responseConst.ERROR_DELETING_RECORD,
                        null,
                        true
                    )
                );
            }

            // FIXED LOGIC: Update user activity count only if deletion was successful
            // and we have valid activity data (length > 0, not == 0)
            if (getserActivityData && getserActivityData.length > 0 && safeCurrentCount > 0) {
                const newBlockedCount = safeCurrentCount - 1;
                logger.info(`Updating blocked count from ${safeCurrentCount} to ${newBlockedCount}`);
                
                const updateUserActivity = await UserActivtyService.updateService(
                    userActivity.user_activity_id,
                    { total_blacklist_user: newBlockedCount }
                );
                
                if (updateUserActivity[0] === 0) {
                    logger.warn(`Failed to update user activity count for user ID: ${getDataById.user_id}`);
                }
            } else {
                logger.info(`Skipping activity count update - current count: ${safeCurrentCount}`);
            }

            logger.info(`Successfully deleted blacklist record ID: ${parsedId}`);
            return res.status(responseCode.CREATED).send(
                commonResponse(
                    responseCode.CREATED,
                    responseConst.SUCCESS_DELETING_RECORD
                )
            );

        } catch (error) {
            logger.error(`Unexpected error in delete blacklist operation: ${error.message}`, {
                stack: error.stack,
                recordId: req.query.id
            });
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
    getDataByUseridByView: async (req, res) => {
        try{
            const user_id = req.query.user_id
            const getDataByView = await UserBlackListService.getByUserId(user_id)
            if (getDataByView.length !== 0) {
                return res
                    .status(responseCode.OK)
                    .send(
                        commonResponse(
                            responseCode.OK,
                            responseConst.DATA_RETRIEVE_SUCCESS,
                            getDataByView
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

export default UserBlackListController