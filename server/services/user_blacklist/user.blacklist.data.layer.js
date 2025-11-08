import UserBlackListModel from "./user.blacklist.model.js";
import commonPath from "../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
const { db, ViewFieldTableVise, tokenData } = commonPath

const UserBlackListDAL = {
    // Method to create a new record in the database
     CreateData: async (data, transaction = null) => {
        try {
            const options = transaction ? { transaction } : {};
            const createdData = await UserBlackListModel(db.sequelize).create(data, options)
            return createdData // Return the created data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    },
    // Method to update an existing record by its ID
    UpdateData: async (blacklist_id, data) => {
        try {
            const updateData = await UserBlackListModel(db.sequelize).update(data, { where: { blacklist_id: blacklist_id } })
            return updateData // Return the result of the update operation
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, 
    // Method to retrieve all records by view
    getAllDataByView: async () => {
        try {
            const getAllData = await db.sequelize.query(`${ViewFieldTableVise.USER_BLACKLIST_FIELDS}`, { type: db.Sequelize.QueryTypes.SELECT })
            return getAllData // Return the retrieved data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    },
    // Method to retrieve a specific record by its ID
    getDataByIdByView: async (blacklist_id) => {
        try {
            const getDataById = await db.sequelize.query(` ${ViewFieldTableVise.USER_BLACKLIST_FIELDS} where blacklist_id  = ${blacklist_id} `, { type: db.Sequelize.QueryTypes.SELECT })
            return getDataById[0] ?? [] // Return the retrieved data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, 
    // Method to mark a record as deleted (soft delete)
    deleteDataById: async (blacklist_id, req, res) => {
        try {
            const [deleteDataById] = await UserBlackListModel(db.sequelize).update({ is_active: 0, deleted_by: tokenData(req, res), deleted_at: new Date() }, {
                where: {
                    blacklist_id: blacklist_id
                }
            })
            return deleteDataById
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    },getByUserId:async(user_id)=>{
        try{
            const getDatabyUserid = await db.sequelize.query(` ${ViewFieldTableVise.USER_BLACKLIST_FIELDS} where user_id = ${user_id} `,{type:db.Sequelize.QueryTypes.SELECT})
            return getDatabyUserid
        }catch(error){
            throw error
        }
    },getDatabyUserIdAndBlacklistUserid:async(user_id,blacklist_user_id)=>{
        try{
            const getDataByUserIdAndBackList = await db.sequelize.query(` ${ViewFieldTableVise.USER_BLACKLIST_FIELDS} where user_id = ${user_id} and blacklisted_user_id = ${blacklist_user_id} `,{type:db.Sequelize.QueryTypes.SELECT})
            return getDataByUserIdAndBackList
        }catch(error){
            throw error
        }
    },
    // Method to check for ACTIVE blacklist records only (excludes soft-deleted records)
    getActiveBlacklistByUserIds: async(user_id, blacklisted_user_id) => {
        try {
            // Use the model directly to respect soft delete settings
            const activeBlacklist = await UserBlackListModel(db.sequelize).findAll({
                where: {
                    user_id: user_id,
                    blacklisted_user_id: blacklisted_user_id,
                    is_active: 1
                },
                // paranoid: true ensures only non-deleted records are returned
                paranoid: true
            });
            return activeBlacklist;
        } catch(error) {
            throw error;
        }
    },
    // Method to find ANY blacklist record (active or inactive) - for reactivation logic
    getAnyBlacklistByUserIds: async(user_id, blacklisted_user_id) => {
        try {
            // Use paranoid: false to include soft-deleted records
            const anyBlacklist = await UserBlackListModel(db.sequelize).findAll({
                where: {
                    user_id: user_id,
                    blacklisted_user_id: blacklisted_user_id
                },
                paranoid: false // Include soft-deleted records
            });
            return anyBlacklist;
        } catch(error) {
            throw error;
        }
    },
    // Method to reactivate a soft-deleted blacklist record
    reactivateBlacklistRecord: async(blacklist_id, updateData, transaction = null) => {
        try {
            const options = { 
                where: { blacklist_id: blacklist_id },
                paranoid: false // Allow updating soft-deleted records
            };
            if (transaction) options.transaction = transaction;
            
            const reactivateResult = await UserBlackListModel(db.sequelize).update(updateData, options);
            return reactivateResult;
        } catch(error) {
            throw error;
        }
    },
    
    // Method to create or reactivate blacklist record (UPSERT logic)
    createOrReactivateBlacklistRecord: async(user_id, blacklisted_user_id, blacklistData, transaction = null) => {
        try {
            // First, check if ANY record exists (including inactive)
            const existingRecord = await UserBlackListDAL.getAnyBlacklistByUserIds(
                user_id, 
                blacklisted_user_id
            );
            
            if (existingRecord && existingRecord.length > 0) {
                const record = existingRecord[0];
                
                // If record is inactive (soft deleted), reactivate it
                if (!record.is_active || record.deleted_at !== null) {
                    const reactivationData = {
                        ...blacklistData,
                        is_active: true,
                        deleted_at: null,
                        deleted_by: null
                    };
                    
                    const result = await UserBlackListDAL.reactivateBlacklistRecord(
                        record.blacklist_id,
                        reactivationData,
                        transaction
                    );
                    
                    // Return the reactivated record data
                    return {
                        isNewRecord: false,
                        isReactivated: true,
                        blacklist_id: record.blacklist_id,
                        updateResult: result
                    };
                } else {
                    throw new Error('DUPLICATE_ACTIVE_RECORD: Active block exists but controller check failed');
                }
            } else {
                // No existing record found, create new one
                const newRecord = await UserBlackListDAL.CreateData(blacklistData, transaction);
                return {
                    isNewRecord: true,
                    isReactivated: false,
                    blacklist_id: newRecord.blacklist_id,
                    record: newRecord
                };
            }
        } catch(error) {
            throw error;
        }
    },
    
    // Method to get comprehensive blacklist statistics for a user
    getBlacklistStatistics: async(user_id) => {
        try {
            const stats = await db.sequelize.query(`
                SELECT 
                    COUNT(*) as total_records,
                    COUNT(CASE WHEN is_active = 1 THEN 1 END) as active_records,
                    COUNT(CASE WHEN is_active = 0 THEN 1 END) as inactive_records,
                    MAX(blacklisted_at) as last_blocked_at,
                    MAX(modified_at) as last_modified_at
                FROM user_blacklist 
                WHERE user_id = ?
            `, {
                replacements: [user_id],
                type: db.Sequelize.QueryTypes.SELECT
            });
            return stats[0] || null;
        } catch(error) {
            throw error;
        }
    }
}

export default UserBlackListDAL