import UserFollowingModel from "./user.following.model.js";
import commonPath from "../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
const { db, ViewFieldTableVise, tokenData } = commonPath // Destructure necessary components from commonPath

const UserFollowingDAL = {
    // Method to create a new record in the database
    CreateData: async (data) => {
        try {
            const createdData = await UserFollowingModel(db.sequelize).create(data)
            return createdData // Return the created data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    },
    // Method to update an existing record by its ID
    UpdateData: async (follow_id, data) => {
        try {
            const updateData = await UserFollowingModel(db.sequelize).update(data, { where: { follow_id: follow_id } })
            return updateData // Return the result of the update operation
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    },
    // Method to retrieve all records by view
    getAllDataByView: async () => {
        try {
            const getAllData = await db.sequelize.query(`${ViewFieldTableVise.USER_FOLLOWING_FIELDS}`, { type: db.Sequelize.QueryTypes.SELECT })
            return getAllData // Return the retrieved data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    },
    // Method to retrieve a specific record by its ID
    getDataByIdByView: async (follow_id) => {
        try {
            // Use parameterized query to prevent SQL injection
            const getDataById = await db.sequelize.query(
                `${ViewFieldTableVise.USER_FOLLOWING_FIELDS} WHERE follow_id = :follow_id`,
                {
                    replacements: { follow_id: parseInt(follow_id) },
                    type: db.Sequelize.QueryTypes.SELECT
                }
            );
            return getDataById[0] ?? null; // Return single record or null
        } catch (error) {
            throw error; // Throw error for handling in the controller
        }
    },
    // Method to mark a record as deleted (soft delete)
    deleteDataById: async (follow_id, req, res) => {
        try {
            const [deleteDataById] = await UserFollowingModel(db.sequelize).update({ is_active: 0, deleted_by: tokenData(req, res), deleted_at: new Date() }, {
                where: {
                    follow_id: follow_id
                }
            })
            return deleteDataById
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, getByUserId: async (user_id) => {
        try {
            const getDatabyView = await db.sequelize.query(` ${ViewFieldTableVise.USER_FOLLOWING_FIELDS} where user_id = ${user_id} and is_following = true and is_rejected = 0`, { type: db.Sequelize.QueryTypes.SELECT })
            return getDatabyView
        } catch (error) {
            throw error
        }
    }, getDataByFollowed: async (following_user_id) => {
        try {
            const getDataById = await db.sequelize.query(` ${ViewFieldTableVise.USER_FOLLOWING_FIELDS} where following_user_id = ${following_user_id} and is_following = true and is_rejected = 0 `, { type: db.Sequelize.QueryTypes.SELECT })
            return getDataById
        } catch (error) {
            throw error
        }
    }, getDataByUserIdAndFollowId: async (user_id, following_user_id) => {
        try {
            const getDataByUseridAndFollowId = await db.sequelize.query(` ${ViewFieldTableVise.USER_FOLLOWING_FIELDS} where user_id = ${user_id} and following_user_id = ${following_user_id} `, { type: db.Sequelize.QueryTypes.SELECT })
            return getDataByUseridAndFollowId
        } catch (error) {
            throw error
        }
    }, getListByFollowingUserToAccepted: async (following_user_id) => {
        try {
            const getDataByFollowerUserId = await db.sequelize.query(` ${ViewFieldTableVise.USER_FOLLOWING_FIELDS} where following_user_id = ${following_user_id} and is_private = true and is_rejected = 0 and is_following = false `, { type: db.Sequelize.QueryTypes.SELECT })
            return getDataByFollowerUserId
        } catch (error) {
            throw error
        }
    }, getOnlyFollowAndBlockedUserByUserId: async (user_id) => {
        try {
            // 1. Get all users the user is following
            const getDatabyView = await db.sequelize.query(` ${ViewFieldTableVise.USER_FOLLOWING_FIELDS} where user_id = ${user_id} and is_following = true`, { type: db.Sequelize.QueryTypes.SELECT })
            const followingUserIds = getDatabyView.map(item => item.following_user_id);

            if (!followingUserIds.length) return [];

            // 2. Get all blacklisted users by this user
            const blacklistedData = await db.sequelize.query(`
      ${ViewFieldTableVise.USER_BLACKLIST_FIELDS} 
      WHERE user_id = ${user_id}
    `, { type: db.Sequelize.QueryTypes.SELECT });

            const blacklistedUserIds = new Set(blacklistedData.map(item => item.blacklisted_user_id));

            // 3. Filter out blacklisted users from following list
            const validFollowingUserIds = followingUserIds.filter(id => !blacklistedUserIds.has(id));

            return validFollowingUserIds;
        } catch (error) {
            throw error;
        }
    }, getDataByUserNameByLIke: async (user_id, full_name) => {
    try {

        let replacements = { user_id };
        let nameFilter = "";

        if (full_name && full_name.trim() !== "") {
            nameFilter = `
                AND full_name LIKE :full_name
            `;
            replacements.full_name = `%${full_name}%`;
        }

        const relations = await db.sequelize.query(
            `
            SELECT * FROM (
                SELECT *
                FROM user_following
                WHERE user_id = :user_id
                  AND is_following = 1

                UNION ALL

                SELECT *
                FROM user_following
                WHERE following_user_id = :user_id
                  AND is_following = 1
            ) AS combined
            `,
            {
                replacements,
                type: db.Sequelize.QueryTypes.SELECT
            }
        );

        if (!relations.length) return [];

        const uniqueUserIds = [
            ...new Set(
                relations.map(row =>
                    row.user_id === user_id
                        ? row.following_user_id
                        : row.user_id
                )
            )
        ];

        if (!uniqueUserIds.length) return [];

        const users = await db.sequelize.query(
            `
            ${ViewFieldTableVise.USER_MASTER_WITHOUT_PASSWORD}
            WHERE user_id IN (:userIds)
            `,
            {
                replacements: { userIds: uniqueUserIds },
                type: db.Sequelize.QueryTypes.SELECT
            }
        );

        return users;

    } catch (error) {
        throw error;
    }
}

}

export default UserFollowingDAL