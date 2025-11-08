import QuotesModel from "./quotes.model.js";
import commonPath from "../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
const { db, ViewFieldTableVise, tokenData } = commonPath; // Destructure necessary components from commonPath

const QuotesDAL = {
  // Method to create a new record in the database
  CreateData: async (data) => {
    try {
      const createdData = await QuotesModel(db.sequelize).create(data);
      return createdData; // Return the created data
    } catch (error) {
      throw error; // Throw error for handling in the controller
    }
  },
  // Method to update an existing record by its ID
  UpdateData: async (quote_id, data) => {
    try {
      const updateData = await QuotesModel(db.sequelize).update(data, {
        where: { quote_id: quote_id }, 
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
        `${ViewFieldTableVise.QUOTES_FIELDS}`,
        { type: db.Sequelize.QueryTypes.SELECT } 
      );
      return getAllData; // Return the retrieved data
    } catch (error) {
      throw error; // Throw error for handling in the controller
    }
  },
  // Method to retrieve a specific record by its ID
  getDataByIdByView: async (quote_id) => {
    try {
      const getDataById = await db.sequelize.query(
        ` ${ViewFieldTableVise.QUOTES_FIELDS} where quote_id  = ${quote_id} `,
        { type: db.Sequelize.QueryTypes.SELECT }
      );
      return getDataById[0] ?? [];  // Return the retrieved data
    } catch (error) {
      throw error; // Throw error for handling in the controller
    }
  },
  // Method to mark a record as deleted (soft delete)
  deleteDataById: async (quote_id, req, res) => {
    try {
      const [deleteDataById] = await QuotesModel(db.sequelize).update(
        {
          is_active: 0,
          deleted_by: tokenData(req, res),
          deleted_at: new Date(),
        },
        {
          where: {
            quote_id: quote_id,
          },
        }
      );
      return deleteDataById; // Return the result of the update operation
    } catch (error) {
      throw error; // Throw error for handling in the controller
    }
  },
  getRandomQuote: async () => {
    try {
      // Step 1: Count active quotes
      const [[{ total }]] = await db.sequelize.query(
        `SELECT COUNT(*) AS total FROM v_quotes WHERE is_active = 1`
      );

      if (total === 0) return {};

      // Step 2: Pick a random offset
      const randomOffset = Math.floor(Math.random() * total);

      // Step 3: Fetch one record efficiently
      const [quote] = await db.sequelize.query(
        `${ViewFieldTableVise.QUOTES_FIELDS} WHERE is_active = 1 LIMIT 1 OFFSET :offset`,
        {
          replacements: { offset: randomOffset },
          type: db.Sequelize.QueryTypes.SELECT,
        }
      );

      // Step 4: Return a cleaned result (exclude unwanted fields)
      return quote || {};
    } catch (error) {
      throw error;
    }
  }


};

export default QuotesDAL; // Export the CommentsDAL object for use in the controller
