import NgoDesignationMasterModel from "./ngo.designation.master.model.js";
import commonPath from "../../middleware/comman_path/comman.path.js";
const { db, ViewFieldTableVise, tokenData } = commonPath; // Destructure necessary components from commonPath

const NgoDesignationMasterDAL = {
     // Method to create a new record in the database
  CreateData: async (data) => {
    try {
      const createdData = await NgoDesignationMasterModel(db.sequelize).create(data);
      return createdData; // Return the created data
    } catch (error) {
      throw error; // Throw error for handling in the controller
    }
  },
  // Method to update an existing record by its ID
  UpdateData: async (ngo_designation_id, data) => {
    try {
      const updateData = await NgoDesignationMasterModel(db.sequelize).update(data, {
        where: { ngo_designation_id: ngo_designation_id }, 
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
        `${ViewFieldTableVise.NGO_DESIGNATION_MASTER_FIELDS}`,
        { type: db.Sequelize.QueryTypes.SELECT } 
      );
      return getAllData; // Return the retrieved data
    } catch (error) {
      throw error; // Throw error for handling in the controller
    }
  },
  // Method to retrieve a specific record by its ID
  getDataByIdByView: async (ngo_designation_id) => {
    try {
      const getDataById = await db.sequelize.query(
        ` ${ViewFieldTableVise.NGO_DESIGNATION_MASTER_FIELDS} where ngo_designation_id  = ${ngo_designation_id} `,
        { type: db.Sequelize.QueryTypes.SELECT }
      );
      return getDataById[0] ?? [];  // Return the retrieved data
    } catch (error) {
      throw error; // Throw error for handling in the controller
    }
  },
  // Method to mark a record as deleted (soft delete)
  deleteDataById: async (ngo_designation_id, req, res) => {
    try {
      const [deleteDataById] = await NgoDesignationMasterModel(db.sequelize).update(
        {
          is_active: 0,
          deleted_by: tokenData(req, res),
          deleted_at: new Date(),
        },
        {
          where: {
            ngo_designation_id: ngo_designation_id,
          },
        }
      );
      return deleteDataById; // Return the result of the update operation
    } catch (error) {
      throw error; // Throw error for handling in the controller
    }
  },
}

export default NgoDesignationMasterDAL