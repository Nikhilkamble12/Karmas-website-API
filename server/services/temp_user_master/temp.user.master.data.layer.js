import TempUserMasterModel from "./temp.user.master.model.js";
import commonPath from "../../middleware/comman_path/comman.path.js";
import { Op } from "sequelize";

const { db, ViewFieldTableVise, tokenData } = commonPath;

const TempUserMasterDAL = {

    // Create new temp user
    CreateData: async (data) => {
        try {
            return await TempUserMasterModel(db.sequelize).create(data);
        } catch (error) {
            throw error;
        }
    },

    // Update temp user by ID
    UpdateData: async (user_id, data) => {
        try {
            return await TempUserMasterModel(db.sequelize).update(
                data,
                { where: { user_id } }
            );
        } catch (error) {
            throw error;
        }
    },

    // Get all temp users via VIEW
    getAllDataByView: async () => {
        try {
            return await db.sequelize.query(
                ViewFieldTableVise.TEMP_USER_MASTER_FIELDS,
                { type: db.Sequelize.QueryTypes.SELECT }
            );
        } catch (error) {
            throw error;
        }
    },

    // Get temp user by ID via VIEW
    getDataByIdByView: async (user_id) => {
        try {
            const result = await db.sequelize.query(
                `${ViewFieldTableVise.TEMP_USER_MASTER_FIELDS} WHERE user_id = :user_id`,
                {
                    replacements: { user_id },
                    type: db.Sequelize.QueryTypes.SELECT,
                }
            );
            return result[0] ?? null;
        } catch (error) {
            throw error;
        }
    },

    // Soft delete temp user
    deleteDataById: async (user_id, req, res) => {
        try {
            const [affectedRows] = await TempUserMasterModel(db.sequelize).update(
                {
                    is_active: 0,
                    deleted_by: tokenData(req, res),
                    deleted_at: new Date(),
                },
                {
                    where: { user_id },
                }
            );
            return affectedRows;
        } catch (error) {
            throw error;
        }
    }, getByEmail: async (email_id) => {
        const result = await db.sequelize.query(
            `
        SELECT *
        FROM temp_user_master
        WHERE email_id = :email_id
          AND deleted_at IS NULL
        LIMIT 1
        `,
            {
                replacements: { email_id },
                type: db.Sequelize.QueryTypes.SELECT,
            }
        );

        return result[0] ?? null;
    },
    deleteDataByIdHard: async (user_id) => {
        try {
            const affectedRows = await TempUserMasterModel(db.sequelize).destroy({
                where: { user_id }
            });

            return affectedRows; // number of rows deleted
        } catch (error) {
            throw error;
        }
    },deleteOldRecordsHard: async () => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const affectedRows = await TempUserMasterModel(db.sequelize).destroy({
            where: {
                created_at: {
                    [Op.lt]: thirtyDaysAgo
                }
            }
        });

        return affectedRows;
    } catch (error) {
        throw error;
    }
}

};

export default TempUserMasterDAL;
