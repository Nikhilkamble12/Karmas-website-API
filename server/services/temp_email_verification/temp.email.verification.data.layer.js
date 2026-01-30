import TempEmailVerificationModel from "./temp.email.verification.model.js";
import commonPath from "../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
const { db, ViewFieldTableVise, tokenData } = commonPath // Destructure necessary components from commonPath

const TempEmailVerificationDAL = {
     // Method to create a new record in the database
    CreateData: async (data) => {
        try {
            const createdData = await TempEmailVerificationModel(db.sequelize).create(data)
            return createdData // Return the created data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, 
    // Method to update an existing record by its ID
    UpdateData: async (id, data) => {
        try {
            const updateData = await TempEmailVerificationModel(db.sequelize).update(data, { where: { id: id } })
            return updateData // Return the result of the update operation
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, 
    // Method to retrieve all records by view
    getAllDataByView: async () => {
        try {
            const getAllData = await db.sequelize.query(`${ViewFieldTableVise.TEMP_EMAIL_VERIFICATION_FIELDS}`, { type: db.Sequelize.QueryTypes.SELECT })
            return getAllData // Return the retrieved data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    },
    // Method to retrieve a specific record by its ID
    getDataByIdByView: async (id) => {
        try {
            const getDataById = await db.sequelize.query(` ${ViewFieldTableVise.TEMP_EMAIL_VERIFICATION_FIELDS} where id  = ${id} `, { type: db.Sequelize.QueryTypes.SELECT })
            return getDataById[0] ?? [] // Return the retrieved data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, 
    // Method to mark a record as deleted (soft delete)
    deleteDataById: async (id, req, res) => {
        try {
            const [deleteDataById] = await TempEmailVerificationModel(db.sequelize).update({ is_active: 0, deleted_by: tokenData(req, res), deleted_at: new Date() }, {
                where: {
                    id: id
                }
            })
            return deleteDataById
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    },
    // CHECK EMAIL EXISTS (TEMP)
    checkEmailExists: async (email_id) => {
        try {
            const result = await db.sequelize.query(
                `
            SELECT *
            FROM temp_email_verification
            WHERE email_id = :email_id
            LIMIT 1
            `,
                {
                    replacements: { email_id },
                    type: db.Sequelize.QueryTypes.SELECT
                }
            );
            return result[0] ?? null;
        } catch (error) {
            throw error;
        }
    },

    // VERIFY OTP
    verifyOtp: async (email_id, otp) => {
        try {
            const result = await db.sequelize.query(
                `
            SELECT *
            FROM temp_email_verification
            WHERE email_id = :email_id
              AND otp = :otp
              AND expires_at > NOW()
            LIMIT 1
            `,
                {
                    replacements: { email_id, otp },
                    type: db.Sequelize.QueryTypes.SELECT
                }
            );
            return result[0] ?? null;
        } catch (error) {
            throw error;
        }
    },

    // UPSERT OTP (RESEND SAFE)
    upsertOtp: async (data) => {
        try {
            return await db.sequelize.query(
                `
            INSERT INTO temp_email_verification
                (email_id, otp, created_at, expires_at)
            VALUES
                (:email_id, :otp, NOW(), :expires_at)
            ON DUPLICATE KEY UPDATE
                otp = VALUES(otp),
                created_at = NOW(),
                expires_at = VALUES(expires_at)
            `,
                {
                    replacements: data,
                    type: db.Sequelize.QueryTypes.INSERT
                }
            );
        } catch (error) {
            throw error;
        }
    },
}

export default TempEmailVerificationDAL
