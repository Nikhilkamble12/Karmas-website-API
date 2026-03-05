import UserBlackListDAL from "./user.blacklist.data.layer.js";
import UserActivityDAL from "../user_activity/user.activity.data.layer.js";
import commonPath from "../../middleware/comman_path/comman.path.js";
const { db } = commonPath;

const UserBlackListService = {
    // Method to create a new record with transaction support
    createService: async (data, transaction = null) => {
        try {
            return await UserBlackListDAL.CreateData(data, transaction)
        } catch (error) {
            throw error
        }
    },
    // Method to create blacklist with user activity update in transaction
    createWithActivityUpdate: async (blacklistData, activityId, newCount) => {
        const transaction = await db.sequelize.transaction();
        try {
            console.log('Transaction Data:', {
                blacklistData,
                activityId,
                newCount
            });
            
            // Create blacklist record
            const blacklistResult = await UserBlackListDAL.CreateData(blacklistData, transaction);
            console.log('Blacklist creation result:', blacklistResult?.blacklist_id);
            
            // Update user activity count
            const activityResult = await UserActivityDAL.UpdateData(activityId, 
                { total_blacklist_user: newCount }, transaction);
            console.log('Activity update result:', activityResult);
            
            await transaction.commit();
            console.log('Transaction committed successfully');
            
            return {
                success: true,
                blacklistResult,
                activityResult,
                error: null
            };
        } catch (error) {
            console.error('Transaction error details:', {
                name: error.name,
                message: error.message,
                sql: error.sql,
                original: error.original,
                errors: error.errors
            });
            
            await transaction.rollback();
            
            // Return specific error types
            let errorMessage = error.message;
            
            if (error.name === 'SequelizeUniqueConstraintError') {
                errorMessage = 'User is already blocked';
            } else if (error.name === 'SequelizeForeignKeyConstraintError') {
                errorMessage = 'Referenced user does not exist';
            } else if (error.name === 'SequelizeValidationError') {
                errorMessage = 'Invalid data provided: ' + error.errors?.map(e => e.message).join(', ');
            }
            
            return {
                success: false,
                blacklistResult: null,
                activityResult: null,
                error: errorMessage,
                errorType: error.name
            };
        }
    },
    // Method to update an existing record by its ID 
    updateService: async (blacklist_id, data) => {
        try {
            return await UserBlackListDAL.UpdateData(blacklist_id, data)
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve all records
    getAllService: async () => {
        try {
            return await UserBlackListDAL.getAllDataByView()
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve a specific record by its ID 
    getServiceById: async (blacklist_id) => {
        try {
            return await UserBlackListDAL.getDataByIdByView(blacklist_id)
        } catch (error) {
            throw error
        }
    }, 
    // Method to mark a record as deleted (soft delete) by its ID
    deleteByid: async (blacklist_id, req, res) => {
        try {
            return await UserBlackListDAL.deleteDataById(blacklist_id, req, res)
        } catch (error) {
            throw error
        }
    },getByUserId:async(user_id)=>{
        try{
            return await UserBlackListDAL.getByUserId(user_id)
        }catch(error){
            throw error
        }
    },getDataByUserIdAndBackListUser:async(user_id,blacklist_user_id)=>{
        try{
            return await UserBlackListDAL.getDatabyUserIdAndBlacklistUserid(user_id,blacklist_user_id)
        }catch(error){
            throw error
        }
    },
    // Method to check for active (non-deleted) blacklist records only
    getActiveBlacklistByUserIds: async(user_id, blacklisted_user_id) => {
        try {
            return await UserBlackListDAL.getActiveBlacklistByUserIds(user_id, blacklisted_user_id);
        } catch(error) {
            throw error;
        }
    },
    
    //   UPSERT method: Create new or reactivate existing blacklist record
    createOrReactivateWithActivityUpdate: async (blacklistData, activityId, currentCount) => {
        // Generate unique transaction ID for tracking
        const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const transaction = await db.sequelize.transaction();
        
        try {
            console.log(`[${transactionId}] Starting UPSERT transaction:`, {
                userId: blacklistData.user_id,
                blacklistedUserId: blacklistData.blacklisted_user_id,
                currentCount,
                activityId
            });
            
            // Step 1: Use UPSERT logic to handle existing records
            const upsertResult = await UserBlackListDAL.createOrReactivateBlacklistRecord(
                blacklistData.user_id,
                blacklistData.blacklisted_user_id,
                blacklistData,
                transaction
            );
            
            console.log(`[${transactionId}] UPSERT result:`, {
                isNewRecord: upsertResult.isNewRecord,
                isReactivated: upsertResult.isReactivated,
                blacklistId: upsertResult.blacklist_id
            });
            
            // Step 2: Calculate new activity count based on operation type
            let newCount;
            if (upsertResult.isNewRecord) {
                // New record created - increment count
                newCount = currentCount + 1;
            } else if (upsertResult.isReactivated) {
                // Existing inactive record reactivated - increment count
                newCount = currentCount + 1;
            } else {
                // This case shouldn't happen due to our logic, but handle gracefully
                newCount = currentCount;
            }
            
            // Step 3: Update user activity count
            const activityResult = await UserActivityDAL.UpdateData(
                activityId,
                { total_blacklist_user: newCount },
                transaction
            );
            
            console.log(`[${transactionId}] Activity update:`, {
                previousCount: currentCount,
                newCount: newCount,
                updateResult: activityResult
            });
            
            // Step 4: Commit transaction
            await transaction.commit();
            console.log(`[${transactionId}] Transaction committed successfully`);
            
            return {
                success: true,
                transactionId,
                blacklistResult: upsertResult,
                activityResult,
                operationType: upsertResult.isNewRecord ? 'CREATE' : 'REACTIVATE',
                previousCount: currentCount,
                newCount,
                error: null,
                errorType: null
            };
            
        } catch (error) {
            console.error(`[${transactionId}] Transaction error:`, {
                name: error.name,
                message: error.message,
                sql: error.sql,
                original: error.original?.message,
                errno: error.original?.errno,
                code: error.original?.code,
                stack: error.stack?.split('\n').slice(0, 5) // First 5 lines of stack
            });
            
            await transaction.rollback();
            console.log(`[${transactionId}] Transaction rolled back`);
            
            // Enhanced error handling with specific error types
            let errorMessage = error.message;
            let errorType = error.name;
            
            if (error.message === 'DUPLICATE_ACTIVE_RECORD') {
                errorMessage = 'User is already actively blocked';
                errorType = 'BusinessLogicError';
            } else if (error.name === 'SequelizeUniqueConstraintError') {
                errorMessage = 'User blacklist record already exists and is active';
                errorType = 'SequelizeUniqueConstraintError';
            } else if (error.name === 'SequelizeForeignKeyConstraintError') {
                errorMessage = 'Referenced user or activity record does not exist';
                errorType = 'SequelizeForeignKeyConstraintError';
            } else if (error.name === 'SequelizeValidationError') {
                const validationErrors = error.errors?.map(e => e.message).join(', ') || 'Invalid data';
                errorMessage = `Validation failed: ${validationErrors}`;
                errorType = 'SequelizeValidationError';
            } else if (error.name === 'SequelizeConnectionError') {
                errorMessage = 'Database connection error - please try again';
                errorType = 'SequelizeConnectionError';
            } else if (error.name === 'SequelizeTimeoutError') {
                errorMessage = 'Database operation timeout - please try again';
                errorType = 'SequelizeTimeoutError';
            }
            
            return {
                success: false,
                transactionId,
                blacklistResult: null,
                activityResult: null,
                operationType: null,
                previousCount: currentCount,
                newCount: currentCount,
                error: errorMessage,
                errorType,
                originalError: {
                    name: error.name,
                    message: error.message,
                    code: error.original?.code
                }
            };
        }
    },
    
    // Method to get blacklist statistics for monitoring
    getBlacklistStatistics: async (user_id) => {
        try {
            return await UserBlackListDAL.getBlacklistStatistics(user_id);
        } catch (error) {
            throw error;
        }
    }
}
export default UserBlackListService