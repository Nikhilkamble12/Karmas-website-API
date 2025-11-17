import NgoUserMasterModel from "./ngo.user.master.model.js";
import commonPath from "../../middleware/comman_path/comman.path.js";
const { db, ViewFieldTableVise, tokenData } = commonPath; // Destructure necessary components from commonPath

const NgoUserMasterDAL = {
    // Method to create a new record in the database
  CreateData: async (data) => {
    try {
      const createdData = await NgoUserMasterModel(db.sequelize).create(data);
      return createdData; // Return the created data
    } catch (error) {
      throw error; // Throw error for handling in the controller
    }
  },
  // Method to update an existing record by its ID
  UpdateData: async (ngo_user_id, data) => {
    try {
      const updateData = await NgoUserMasterModel(db.sequelize).update(data, {
        where: { ngo_user_id: ngo_user_id }, 
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
        `${ViewFieldTableVise.GET_ALL_NGO_USER_MASTER}`,
        { type: db.Sequelize.QueryTypes.SELECT } 
      );
      return getAllData; // Return the retrieved data
    } catch (error) {
      throw error; // Throw error for handling in the controller
    }
  },
  // Method to retrieve a specific record by its ID
  getDataByIdByView: async (ngo_user_id) => {
    try {
      const getDataById = await db.sequelize.query(
        ` ${ViewFieldTableVise.GET_ALL_NGO_USER_MASTER} where ngo_user_id  = ${ngo_user_id} `,
        { type: db.Sequelize.QueryTypes.SELECT }
      );
      return getDataById[0] ?? [];  // Return the retrieved data
    } catch (error) {
      throw error; // Throw error for handling in the controller
    }
  },
  // Method to mark a record as deleted (soft delete)
  deleteDataById: async (ngo_user_id, req, res) => {
    try {
      const [deleteDataById] = await NgoUserMasterModel(db.sequelize).update(
        {
          is_active: 0,
          deleted_by: tokenData(req, res),
          deleted_at: new Date(),
        },
        {
          where: {
            ngo_user_id: ngo_user_id,
          },
        }
      );
      return deleteDataById; // Return the result of the update operation
    } catch (error) {
      throw error; // Throw error for handling in the controller
    }
  },
  getDataByUserIdByView: async (user_id) => {
    try {
      const getDataById = await db.sequelize.query(
        ` ${ViewFieldTableVise.GET_ALL_NGO_USER_MASTER} where user_id  = ${user_id} `,
        { type: db.Sequelize.QueryTypes.SELECT }
      );
      return getDataById[0] ?? [];  // Return the retrieved data
    } catch (error) {
      throw error; // Throw error for handling in the controller
    }
  },
}

export default NgoUserMasterDAL