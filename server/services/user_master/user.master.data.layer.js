import UserMasterModel from "./user.master.model.js";
import commonPath from "../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
import VIEW_NAME from "../../utils/db/view.constants.js";
const { db, ViewFieldTableVise, tokenData } = commonPath // Destructure necessary components from commonPath

const UserMasterDAL = {
    // Method to create a new record in the database
    CreateData: async (data) => {
        try {
            console.log("data",data)
            const createdData = await UserMasterModel(db.sequelize).create(data)
            return createdData // Return the created data
        } catch (error) {
            if (error.name === "SequelizeUniqueConstraintError") {
                const cleanedErrors = error.errors.map(({ instance, ...rest }) => rest);

                // Collect duplicate field info
                const duplicates = cleanedErrors.map(e => `${e.path} = "${e.value}"`);

                return {
                    success: false,
                    message: `Duplicate entry. ${duplicates.join(" and ")} already exists.`,
                    error: cleanedErrors, // detailed info if you need it
                };
            }
            throw error // Throw error for handling in the controller
        }
    }, 
    // Method to update an existing record by its ID
    UpdateData: async (user_id, data) => {
        try {
            const updateData = await UserMasterModel(db.sequelize).update(data, { where: { user_id: user_id } })
            return updateData // Return the result of the update operation
        } catch (error) {
            if (error.name === "SequelizeUniqueConstraintError") {
                const cleanedErrors = error.errors.map(({ instance, ...rest }) => rest);

                // Collect duplicate field info
                const duplicates = cleanedErrors.map(e => `${e.path} = "${e.value}"`);

                return {
                    success: false,
                    message: `Duplicate entry. ${duplicates.join(" and ")} already exists.`,
                    error: cleanedErrors, // detailed info if you need it
                };
            }
            throw error // Throw error for handling in the controller
        }
    }, 
    // Method to retrieve all records by view
    getAllDataByView: async () => {
        try {
            const getAllData = await db.sequelize.query(` ${ViewFieldTableVise.USER_MASTER_WITHOUT_PASSWORD} order by user_id desc`, { type: db.Sequelize.QueryTypes.SELECT })
            return getAllData // Return the retrieved data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    },
    // Method to retrieve a specific record by its ID
    getDataByIdByView: async (user_id) => {
        try {
            const getDataById = await db.sequelize.query(` ${ViewFieldTableVise.USER_MASTER_WITHOUT_PASSWORD} where user_id  = ${user_id} `, { type: db.Sequelize.QueryTypes.SELECT })
            return getDataById[0] ?? [] // Return the retrieved data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, 
    // Method to mark a record as deleted (soft delete)
    deleteDataById: async (user_id, req, res) => {
        try {
            const [deleteDataById] = await UserMasterModel(db.sequelize).update({ is_active: 0, deleted_by: tokenData(req, res), deleted_at: new Date() }, {
                where: {
                    user_id: user_id
                }
            })
            return deleteDataById
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    },getDataByUsernameAndPassword: async (user_name,password)=>{
        try{
            const getData = await db.sequelize.query(
                `${ViewFieldTableVise.USER_MASTER_FIELDS} WHERE user_name = ':user_name' AND password = ':password'`, 
                {
                    replacements: { user_name, password },
                    type: db.Sequelize.QueryTypes.SELECT
                }
            );
            return getData
        }catch(error){
            throw error
        }
    },checkIfUserNameIsPresent:async(user_name)=>{
        try{
            console.log('user_name',user_name)
            const getData =await db.sequelize.query(`${ViewFieldTableVise.USER_MASTER_FIELDS} where user_name = '${user_name}'`,{type:db.Sequelize.QueryTypes.SELECT})
            return getData[0] ?? []
        }catch(error){
            throw error
        }
    },checkWhetherUserIsPresent: async (user_name, limit, offset, user_id) => {
        try {
            let query = `
            SELECT u.user_id,u.user_name,u.full_name,u.role_id,u.role,u.is_account_public,u.email_id,u.ngo_id,u.ngo_name,u.file_name,u.file_path,u.bg_image,u.bg_image_path
            FROM v_user_master AS u
            LEFT JOIN v_user_blacklist AS vb1 
                ON vb1.blacklisted_user_id = u.user_id 
                AND vb1.user_id = :searching_user_id
            LEFT JOIN v_user_blacklist AS vb2 
                ON vb2.user_id = u.user_id 
                AND vb2.blacklisted_user_id = :searching_user_id
            WHERE (u.user_name LIKE :search OR u.full_name LIKE :search)
                AND u.is_blacklisted = false
                AND vb1.user_id IS NULL
                AND vb2.user_id IS NULL
            `;

            const replacements = {
                search: `%${user_name}%`,
                searching_user_id: user_id || 0,
            };

            if (
                typeof limit === "number" &&
                typeof offset === "number" &&
                !isNaN(limit) &&
                !isNaN(offset)
            ) {
                query += ` LIMIT :limit OFFSET :offset`;
                replacements.limit = limit;
                replacements.offset = offset;
            }

            const getData = await db.sequelize.query(query, {
                replacements,
                type: db.Sequelize.QueryTypes.SELECT,
            });

            return getData;
        } catch (error) {
            throw error;
        }
    },
 checkIfUserNameIsPresentByGoogleId: async (google_id) => {
        try {
            const getData = await db.sequelize.query(`${ViewFieldTableVise.USER_MASTER_FIELDS} where google_id = '${google_id}'`, { type: db.Sequelize.QueryTypes.SELECT })
            return getData[0] ?? []
        } catch (error) {
            throw error
        }
    },getUserByNgoIdByView:async(ngo_id)=>{
        try{
            const getAllData = await db.sequelize.query(`${ViewFieldTableVise.USER_MASTER_WITHOUT_PASSWORD} where ngo_id = ${ngo_id} `, { type: db.Sequelize.QueryTypes.SELECT })
            return getAllData
        }catch(error){
            throw error
        }
    },BlockUserByNgoId:async(ngo_id,data)=>{
        try{
            const updateData = await UserMasterModel(db.sequelize).update(data, { where: { ngo_id: ngo_id } })
            return updateData 
        }catch(error){
            throw error
        }
    },getAllBlocakedUsed:async()=>{
        try{
            const getAll = await db.sequelize.query(` SELECT ${ViewFieldTableVise.BLACK_LISTED_USER_FIELDS} `,{type:db.Sequelize.QueryTypes.SELECT})
            return getAll
        }catch(error){
            throw error
        }
    },checkIfEmailIsPresent:async(email_id)=>{
        try{
            console.log('email_id',email_id)
            const getData =await db.sequelize.query(` SELECT  user_id,user_name,full_name,email_id  FROM ${VIEW_NAME.GET_ALL_USER_MASTER} where email_id = '${email_id}'`,{type:db.Sequelize.QueryTypes.SELECT})
            return getData[0] ?? []
        }catch(error){
            throw error
        }
    }, getBlockedUsersByUserId: async (user_id) => {
            try {
                const getData = await db.sequelize.query(
                    `${ViewFieldTableVise.USER_MASTER_FIELDS} WHERE blacklisted_by = ${user_id}`,
                    { type: db.Sequelize.QueryTypes.SELECT }
                );
                return getData;
            } catch (error) {
                throw error
            }
    },getUserDashBordCount:async()=>{
        try{
            const getData = await db.sequelize.query(
            `
            SELECT 
                COUNT(*) AS user_total_count,
                SUM(CASE WHEN is_blacklisted = 1 THEN 1 ELSE 0 END) AS user_total_blacklisted,
                SUM(CASE WHEN is_blacklisted = 0 THEN 1 ELSE 0 END) AS user_total_active,
                SUM(CASE WHEN MONTH(created_at) = MONTH(CURRENT_DATE())
                        AND YEAR(created_at) = YEAR(CURRENT_DATE()) THEN 1 ELSE 0 END) AS user_new_month_user,
                SUM(CASE WHEN MONTH(created_at) = MONTH(DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH))
                        AND YEAR(created_at) = YEAR(DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH)) THEN 1 ELSE 0 END) AS user_previous_month_user
            FROM ${VIEW_NAME.GET_ALL_USER_MASTER}
            `,
            { type: db.Sequelize.QueryTypes.SELECT }
            );
            return getData
        }catch(error){
            console.log("error",error)
            throw error
        }
    },getUserDashBoardCountByNgoId:async(ngo_id)=>{
        try{
            const getData = await db.sequelize.query(
            `
            SELECT 
                COUNT(*) AS user_total_count,
                SUM(CASE WHEN is_blacklisted = 1 THEN 1 ELSE 0 END) AS user_total_blacklisted,
                SUM(CASE WHEN is_blacklisted = 0 THEN 1 ELSE 0 END) AS user_total_active,
                SUM(CASE WHEN MONTH(created_at) = MONTH(CURRENT_DATE())
                        AND YEAR(created_at) = YEAR(CURRENT_DATE()) THEN 1 ELSE 0 END) AS user_new_month_user,
                SUM(CASE WHEN MONTH(created_at) = MONTH(DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH))
                        AND YEAR(created_at) = YEAR(DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH)) THEN 1 ELSE 0 END) AS user_previous_month_user
            FROM ${VIEW_NAME.GET_ALL_USER_MASTER} where ngo_id = ${ngo_id}
            `,
            { type: db.Sequelize.QueryTypes.SELECT }
            );
            return getData
        }catch(error){
            throw error
        }
    
    },
    getAllUsersByScoresSorted: async (limit, offset) => {
        try {
            let query = `
            ${ViewFieldTableVise.USER_MASTER_FIELDS} WHERE is_blacklisted = false
            ORDER BY total_scores_no DESC
            LIMIT ${limit} OFFSET ${offset};
            `;
            const getAll = await db.sequelize.query(query, { type: db.Sequelize.QueryTypes.SELECT });
            return getAll;
        } catch (error) {
            throw error;
        }
    },UpdateDataCount: async (user_id, fieldName, amount) => {
    try {
        const result = await UserMasterModel(db.sequelize).increment(fieldName, { 
            by: amount, 
            where: { user_id: user_id } 
        });
        return result;
    } catch (error) {
        throw error;
    }
},checkIfEmailOrUsernameExists: async (email_id, user_name) => {
    try {
        const result = await db.sequelize.query(
            `
            SELECT 
                email_id,
                user_name
            FROM user_master
            WHERE email_id = :email_id
               OR user_name = :user_name
            LIMIT 1
            `,
            {
                replacements: { email_id, user_name },
                type: db.Sequelize.QueryTypes.SELECT,
            }
        );

        return result[0] ?? null;

    } catch (error) {
        throw error;
    }
},
    checkIfUserNameOrEmailIsPresent: async (identifier) => {
        try {
            console.log('identifier', identifier)
            const getData = await db.sequelize.query(
                `${ViewFieldTableVise.USER_MASTER_FIELDS} WHERE user_name = '${identifier}' OR email_id = '${identifier}'`,
                { type: db.Sequelize.QueryTypes.SELECT }
            )
            return getData[0] ?? []
        } catch (error) {
            throw error
        }
    },

}

export default UserMasterDAL