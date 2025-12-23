import NgoRegistrationModel from "./ngo.registration.model.js";
import commonPath from "../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
const { db, ViewFieldTableVise, tokenData } = commonPath; // Destructure necessary components from commonPath

const NgoRegistrationDAL = {
    // Method to create a new record in the database
  CreateData: async (data) => {
    try {
      const createdData = await NgoRegistrationModel(db.sequelize).create(data);
      return createdData; // Return the created data
    } catch (error) {
      throw error; // Throw error for handling in the controller
    }
  },
  // Method to update an existing record by its ID
  UpdateData: async (ngo_registration_id, data) => {
    try {
      const updateData = await NgoRegistrationModel(db.sequelize).update(data, {
        where: { ngo_registration_id: ngo_registration_id }, 
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
        `${ViewFieldTableVise.NGO_REGISTRATION_FIELDS}`,
        { type: db.Sequelize.QueryTypes.SELECT } 
      );
      return getAllData; // Return the retrieved data
    } catch (error) {
      throw error; // Throw error for handling in the controller
    }
  },
  // Method to retrieve a specific record by its ID
  getDataByIdByView: async (ngo_registration_id) => {
    try {
      const getDataById = await db.sequelize.query(
        ` ${ViewFieldTableVise.NGO_REGISTRATION_FIELDS} where ngo_registration_id  = ${ngo_registration_id} `,
        { type: db.Sequelize.QueryTypes.SELECT }
      );
      return getDataById[0] ?? [];  // Return the retrieved data
    } catch (error) {
      throw error; // Throw error for handling in the controller
    }
  },
  // Method to mark a record as deleted (soft delete)
  deleteDataById: async (ngo_registration_id, req, res) => {
    try {
      const [deleteDataById] = await NgoRegistrationModel(db.sequelize).update(
        {
          is_active: 0,
          deleted_by: tokenData(req, res),
          deleted_at: new Date(),
        },
        {
          where: {
            ngo_registration_id: ngo_registration_id,
          },
        }
      );
      return deleteDataById; // Return the result of the update operation
    } catch (error) {
      throw error; // Throw error for handling in the controller
    }
  },getDataByEmailId:async(email_id)=>{
    try{
        const getAllData = await db.sequelize.query(
        `${ViewFieldTableVise.NGO_REGISTRATION_FIELDS} where email = '${email_id}'`,
        { type: db.Sequelize.QueryTypes.SELECT } 
      );
      return getAllData;
    }catch(error){
        throw error
    }
  }
}

export default NgoRegistrationDAL