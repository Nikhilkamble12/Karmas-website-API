import UserOtpLogModel from "./user.otp.log.model.js";
import commonPath from "../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
const { db, ViewFieldTableVise, tokenData } = commonPath; // Destructure necessary components from commonPath

const UserOtpLogsModelDAL = {
    // Method to create a new record in the database
  CreateData: async (data) => {
    try {
      const createdData = await UserOtpLogModel(db.sequelize).create(data);
      return createdData; // Return the created data
    } catch (error) {
      throw error; // Throw error for handling in the controller
    }
  },
  // Method to update an existing record by its ID
  UpdateData: async (otp_id, data) => {
    try {
      const updateData = await UserOtpLogModel(db.sequelize).update(data, {
        where: { otp_id: otp_id }, 
      }); // Return the result of the update operation
      return updateData;
    } catch (error) {
      throw error; // Throw error for handling in the controller
    }
  },
  // Method to retrieve all records by view
  getAllDataByView: async () => {
    try {
      const getAllData = await db.sequelize.query(
        `${ViewFieldTableVise.USER_OTP_LOGS_FIELDS}`,
        { type: db.Sequelize.QueryTypes.SELECT } 
      );
      return getAllData; // Return the retrieved data
    } catch (error) {
      throw error; // Throw error for handling in the controller
    }
  },
  // Method to retrieve a specific record by its ID
  getDataByIdByView: async (otp_id) => {
    try {
      const getDataById = await db.sequelize.query(
        ` ${ViewFieldTableVise.USER_OTP_LOGS_FIELDS} where otp_id  = ${otp_id} `,
        { type: db.Sequelize.QueryTypes.SELECT }
      );
      return getDataById[0] ?? [];  // Return the retrieved data
    } catch (error) {
      throw error; // Throw error for handling in the controller
    }
  },
  // Method to mark a record as deleted (soft delete)
  deleteDataById: async (otp_id, req, res) => {
    try {
      const [deleteDataById] = await UserOtpLogModel(db.sequelize).update(
        {
          is_active: 0,
          deleted_by: tokenData(req, res),
          deleted_at: new Date(),
        },
        {
          where: {
            otp_id: otp_id,
          },
        }
      );
      return deleteDataById; // Return the result of the update operation
    } catch (error) {
      throw error; // Throw error for handling in the controller
    }
  },getOtpByNotUsed: async (user_id, otp_type_id) => {
    try {
      const otpData = await db.sequelize.query(
        `
        ${ViewFieldTableVise.USER_OTP_LOGS_FIELDS}
        WHERE 
            user_id = :user_id 
            AND otp_type_id = :otp_type_id
            AND is_used = 0
            AND is_active = 1
            AND expiry_at > NOW()
        ORDER BY otp_id DESC
        LIMIT 1
        `,
        {
          replacements: { user_id, otp_type_id },
          type: db.Sequelize.QueryTypes.SELECT,
        }
      );

      return otpData[0] ?? null;
    } catch (error) {
      throw error;
    }
  },matchOtpByUserIdTypeAndCode: async (user_id, otp_type_id, otp_code) => {
  try {
    const otpData = await db.sequelize.query(
      `
      ${ViewFieldTableVise.USER_OTP_LOGS_FIELDS}
      WHERE 
          user_id = :user_id
          AND otp_type_id = :otp_type_id
          AND otp_code = :otp_code
          AND is_used = 0
          AND is_active = 1
          AND expiry_at > NOW()
      ORDER BY otp_id DESC
      LIMIT 1
      `,
      {
        replacements: { user_id, otp_type_id, otp_code },
        type: db.Sequelize.QueryTypes.SELECT,
      }
    );

    return otpData[0] ?? null;
  } catch (error) {
    throw error;
  }
},

}


export default UserOtpLogsModelDAL