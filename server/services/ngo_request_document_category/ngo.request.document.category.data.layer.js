import NgoRequestDocumentCategoryModel from "./ngo.request.document.category.model.js";
import commonPath from "../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
import VIEW_NAME from "../../utils/db/view.constants.js";
const { db, ViewFieldTableVise, tokenData } = commonPath // Destructure necessary components from commonPath

const NgoRequestDocumentCategoryDAL  = {
    // Method to create a new record in the database
     CreateData: async (data) => {
        try {
            const createdData = await NgoRequestDocumentCategoryModel(db.sequelize).create(data)
            return createdData // Return the created data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, 
    // Method to update an existing record by its ID
    UpdateData: async (categrory_document_id, data) => {
        try {
            const updateData = await NgoRequestDocumentCategoryModel(db.sequelize).update(data, { where: { categrory_document_id: categrory_document_id } })
            return updateData // Return the result of the update operation
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, 
    // Method to retrieve all records by view
    getAllDataByView: async () => {
        try {
            const getAllData = await db.sequelize.query(`${ViewFieldTableVise.NGO_REQUEST_DOCUMENT_CATEGORY}`, { type: db.Sequelize.QueryTypes.SELECT })
            return getAllData // Return the retrieved data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    },
    // Method to retrieve a specific record by its ID
    getDataByIdByView: async (categrory_document_id) => {
        try {
            const getDataById = await db.sequelize.query(` ${ViewFieldTableVise.NGO_REQUEST_DOCUMENT_CATEGORY} where categrory_document_id  = ${categrory_document_id} `, { type: db.Sequelize.QueryTypes.SELECT })
            return getDataById[0] ?? [] // Return the retrieved data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, 
    // Method to mark a record as deleted (soft delete)
    deleteDataById: async (categrory_document_id, req, res) => {
        try {
            const [deleteDataById] = await NgoRequestDocumentCategoryModel(db.sequelize).update({ is_active: 0, deleted_by: tokenData(req, res), deleted_at: new Date() }, {
                where: {
                    categrory_document_id: categrory_document_id
                }
            })
            return deleteDataById
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    },checkWetherAlreadyCreatedByDocument:async(ngo_id,category_id,document_type_id)=>{
         try {
            const getAllData = await db.sequelize.query(`${ViewFieldTableVise.NGO_REQUEST_DOCUMENT_CATEGORY} where ngo_id = ${ngo_id} and category_id = ${category_id} and document_type_id = ${document_type_id} `, { type: db.Sequelize.QueryTypes.SELECT })
            return getAllData // Return the retrieved data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    },getDataByNgoId:async(ngo_id)=>{
        try {
            const getAllData = await db.sequelize.query(`${ViewFieldTableVise.NGO_REQUEST_DOCUMENT_CATEGORY} where ngo_id = ${ngo_id} `, { type: db.Sequelize.QueryTypes.SELECT })
            return getAllData // Return the retrieved data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    },getByNgoIdAndCategoryId:async(ngo_id,category_id)=>{
        try{
            const getAllData = await db.sequelize.query(`${ViewFieldTableVise.NGO_REQUEST_DOCUMENT_CATEGORY} where ngo_id = ${ngo_id} and category_id = ${category_id} `, { type: db.Sequelize.QueryTypes.SELECT })
            return getAllData // Return the retrieved data
        }catch(error){
            throw error
        }
    },getByNgoIdAndCategoryIdCount: async (ngo_id, category_id) => {
    try {
        const result = await db.sequelize.query(
            `
            SELECT COUNT(*) AS count
            FROM ${VIEW_NAME.GET_ALL_NGO_REQUEST_DOCUMENT_CATEGORY}
            WHERE ngo_id = :ngo_id
              AND category_id = :category_id
            `,
            {
                replacements: { ngo_id, category_id },
                type: db.Sequelize.QueryTypes.SELECT
            }
        )

        // result is an array like: [{ count: '3' }]
        return Number(result[0]?.count || 0)
    } catch (error) {
        throw error
    }
},getByNgoIdUsingInAndCategoryId: async (ngo_id, category_id) => {
  try {
    if (!ngo_id || !category_id) {
      throw new Error("ngo_id and category_id are required");
    }

    // Ensure ngo_id is always an array
    const ngoIds = Array.isArray(ngo_id) ? ngo_id : [ngo_id];

    const query = `
      SELECT *
      FROM ${ViewFieldTableVise.NGO_REQUEST_DOCUMENT_CATEGORY}
      WHERE ngo_id IN (:ngoIds)
      AND category_id = :categoryId
    `;

    const getAllData = await db.sequelize.query(query, {
      replacements: {
        ngoIds,
        categoryId: category_id
      },
      type: db.Sequelize.QueryTypes.SELECT
    });

    return getAllData;

  } catch (error) {
    throw error;
  }
},


}


export default NgoRequestDocumentCategoryDAL