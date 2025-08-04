import UserTokenModel from "./user.tokens.model.js";
import commonPath from "../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
const { db, ViewFieldTableVise, tokenData } = commonPath // Destructure necessary components from commonPath
function mapTokenResults(results) {
  const tokens = [];

  results.forEach(row => {
    if (row.is_android && row.is_android_on && row.android_token) {
      tokens.push({
        userTokenId: row.user_token_id,
        userId: row.user_id,
        user_id:row.user_id,
        platform: "android",
        token: row.android_token,
        updatedAt: row.updated_at
      });
    }

    if (row.is_web && row.is_web_on && row.web_token) {
      tokens.push({
        userTokenId: row.user_token_id,
        userId: row.user_id,
        user_id:row.user_id,
        platform: "web",
        token: row.web_token,
        updatedAt: row.updated_at
      });
    }
  });

  return tokens;
}

const UserTokenDAL = {
   // Method to create a new record in the database
     CreateData: async (data) => {
        try {
            const createdData = await UserTokenModel(db.sequelize).create(data)
            return createdData // Return the created data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, 
    // Method to update an existing record by its ID
    UpdateData: async (user_token_id, data) => {
        try {
            const updateData = await UserTokenModel(db.sequelize).update(data, { where: { user_token_id: user_token_id } })
            return updateData // Return the result of the update operation
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, 
    // Method to retrieve all records by view
    getAllDataByView: async () => {
        try {
            const getAllData = await db.sequelize.query(`${ViewFieldTableVise.USER_TOKEN_FIELDS}`, { type: db.Sequelize.QueryTypes.SELECT })
            return getAllData // Return the retrieved data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    },
    // Method to retrieve a specific record by its ID
    getDataByIdByView: async (user_token_id) => {
        try {
            const getDataById = await db.sequelize.query(` ${ViewFieldTableVise.USER_TOKEN_FIELDS} where user_token_id  = ${user_token_id} `, { type: db.Sequelize.QueryTypes.SELECT })
            return getDataById[0] ?? [] // Return the retrieved data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, 
    // Method to mark a record as deleted (soft delete)
    deleteDataById: async (user_token_id, req, res) => {
        try {
            const [deleteDataById] = await UserTokenModel(db.sequelize).update({ is_active: 0, deleted_by: tokenData(req, res), deleted_at: new Date() }, {
                where: {
                    user_token_id: user_token_id
                }
            })
            return deleteDataById
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    },CreateOrUpdateUserToken: async (userId, tokenData) => {
    try {
        const UserToken = UserTokenModel(db.sequelize);

        // Try to find existing user token row
        const existing = await UserToken.findOne({ where: { user_id: userId } });

        if (existing) {
            // Only update fields that are in tokenData
            const updated = await existing.update({
                ...tokenData,
                modified_by: userId,
                modified_at: new Date()
            });
            return updated;
        } else {
            // Create new record with defaults and auditing fields
            const created = await UserToken.create({
                user_id: userId,
                ...tokenData,
                created_by: userId,
                created_at: new Date(),
                is_active: 1 // ensure active by default
            });
            return created;
        }

    } catch (error) {
        throw error;
    }
}, GetAllActiveTokens: async () => {
    try {
      const [results] = await db.sequelize.query(`
        ${ViewFieldTableVise.USER_TOKEN_FIELDS}
        WHERE 
          (is_android = 1 AND is_android_on = 1 AND android_token IS NOT NULL)
          OR 
          (is_web = 1 AND is_web_on = 1 AND web_token IS NOT NULL)
      `);

      return mapTokenResults(results);
    } catch (error) {
      console.error("Error fetching all active tokens:", error);
      throw error;
    }
  },

  GetTokensByUserIds: async (userIds) => {
    try {
      const ids = Array.isArray(userIds) ? userIds : [userIds];

      const [results] = await db.sequelize.query(`
        ${ViewFieldTableVise.USER_TOKEN_FIELDS}
        WHERE 
          user_id IN (:ids) AND
          (
            (is_android = 1 AND is_android_on = 1 AND android_token IS NOT NULL)
            OR 
            (is_web = 1 AND is_web_on = 1 AND web_token IS NOT NULL)
          )
      `, {
        replacements: { ids }
      });

      return mapTokenResults(results);
    } catch (error) {
      console.error("Error fetching tokens by user IDs:", error);
      throw error;
    }
  },getTokenByRoleId:async(role_id)=>{
    try{
      const getAllData = await db.sequelize.query(` ${ViewFieldTableVise.USER_TOKEN_FIELDS} where role_id = ${role_id} and
          (
            (is_android = 1 AND is_android_on = 1 AND android_token IS NOT NULL)
            OR 
            (is_web = 1 AND is_web_on = 1 AND web_token IS NOT NULL)
          )`, { type: db.Sequelize.QueryTypes.SELECT })
      return mapTokenResults(getAllData) // Return the retrieved data
    }catch(error){
      throw error;
    }
  }
}

export default UserTokenDAL