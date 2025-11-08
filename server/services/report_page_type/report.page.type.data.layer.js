import ReportPageTypeModel from "./report.page.type.model.js";
import commonPath from "../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
const { db, ViewFieldTableVise, tokenData } = commonPath; // Destructure necessary components from commonPath


const ReportPageTypeDAL = {
     // Method to create a new record in the database
  CreateData: async (data) => {
    try {
      const createdData = await ReportPageTypeModel(db.sequelize).create(data);
      return createdData; // Return the created data
    } catch (error) {
      throw error; // Throw error for handling in the controller
    }
  },
  // Method to update an existing record by its ID
  UpdateData: async (report_page_type_id, data) => {
    try {
      const updateData = await ReportPageTypeModel(db.sequelize).update(data, {
        where: { report_page_type_id: report_page_type_id }, 
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
        `${ViewFieldTableVise.REPORT_PAGE_TYPE_FIELDS}`,
        { type: db.Sequelize.QueryTypes.SELECT } 
      );
      return getAllData; // Return the retrieved data
    } catch (error) {
      throw error; // Throw error for handling in the controller
    }
  },
  // Method to retrieve a specific record by its ID
  getDataByIdByView: async (report_page_type_id) => {
    try {
      const getDataById = await db.sequelize.query(
        ` ${ViewFieldTableVise.REPORT_PAGE_TYPE_FIELDS} where report_page_type_id  = ${report_page_type_id} `,
        { type: db.Sequelize.QueryTypes.SELECT }
      );
      return getDataById[0] ?? [];  // Return the retrieved data
    } catch (error) {
      throw error; // Throw error for handling in the controller
    }
  },
  // Method to mark a record as deleted (soft delete)
  deleteDataById: async (report_page_type_id, req, res) => {
    try {
      const [deleteDataById] = await ReportPageTypeModel(db.sequelize).update(
        {
          is_active: 0,
          deleted_by: tokenData(req, res),
          deleted_at: new Date(),
        },
        {
          where: {
            report_page_type_id: report_page_type_id,
          },
        }
      );
      return deleteDataById; // Return the result of the update operation
    } catch (error) {
      throw error; // Throw error for handling in the controller
    }
  }
}


export default ReportPageTypeDAL