import RequestNgoModel from "./request.ngo.model.js";
import commonPath from "../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
const { db, ViewFieldTableVise, tokenData } = commonPath // Destructure necessary components from commonPath

const RequestNgoDAL = {
      // Method to create a new record in the database
      CreateData: async (data) => {
        try {
            const createdData = await RequestNgoModel(db.sequelize).create(data)
            return createdData // Return the created data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, 
    // Method to update an existing record by its ID
    UpdateData: async (Request_Ngo_Id, data) => {
        try {
            const updateData = await RequestNgoModel(db.sequelize).update(data, { where: { Request_Ngo_Id: Request_Ngo_Id } })
            return updateData // Return the result of the update operation
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, 
    // Method to retrieve all records by view
    getAllDataByView: async () => {
        try {
            const getAllData = await db.sequelize.query(`${ViewFieldTableVise.NGO_REQUEST_MAPPING_FIELDS}`, { type: db.Sequelize.QueryTypes.SELECT })
            return getAllData // Return the retrieved data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    },
    // Method to retrieve a specific record by its ID
    getDataByIdByView: async (Request_Ngo_Id) => {
        try {
            const getDataById = await db.sequelize.query(` ${ViewFieldTableVise.NGO_REQUEST_MAPPING_FIELDS} where Request_Ngo_Id  = ${Request_Ngo_Id} `, { type: db.Sequelize.QueryTypes.SELECT })
            return getDataById[0] ?? [] // Return the retrieved data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, 
    // Method to mark a record as deleted (soft delete)
    deleteDataById: async (Request_Ngo_Id, req, res) => {
        try {
            const [deleteDataById] = await RequestNgoModel(db.sequelize).update({ is_active: 0, deleted_by: tokenData(req, res), deleted_at: new Date() }, {
                where: {
                    Request_Ngo_Id: Request_Ngo_Id
                }
            })
            return deleteDataById
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    },getDataByRequestIdAndNgoId:async(RequestId,NgoId)=>{
        try{
            const getAllData = await db.sequelize.query(` ${ViewFieldTableVise.NGO_REQUEST_MAPPING_FIELDS}  where RequestId = ${RequestId} and ngo_id = ${NgoId} `,{ type: db.Sequelize.QueryTypes.SELECT })
            return getAllData ?? [] // Return the retrieved data
        }catch(error){
            throw error
        }
    },getDataByNgoId:async(ngo_id)=>{
        try{
            const getAllData = await db.sequelize.query(` ${ViewFieldTableVise.NGO_REQUEST_MAPPING_FIELDS} where ngo_id = ${ngo_id} `,{ type: db.Sequelize.QueryTypes.SELECT })
            return getAllData ?? [] // Return the retrieved data
        }catch(error){
            throw error
        }
    },getAllNgoByRequestIdOnly:async(RequestId)=>{
        try{
            const getAllData = await db.sequelize.query(` ${ViewFieldTableVise.NGO_REQUEST_MAPPING_FIELDS}  where RequestId = ${RequestId} `,{ type: db.Sequelize.QueryTypes.SELECT })
            return getAllData ?? []
        }catch(error){
            throw error
        }
    },getNgoDataByFilterAndNgoId: async (ngo_id, offset = null, limit = null, status_id = null) => {
        try {
          let baseQuery = `${ViewFieldTableVise.NGO_REQUEST_MAPPING_FIELDS} WHERE ngo_id = :ngo_id`;
          const replacements = { ngo_id };
      
          if (status_id !== null && status_id !== undefined && status_id!=="null" && status_id !=="undefined" && status_id!==""){
            baseQuery += ` AND status_id = :status_id`;
            replacements.status_id = status_id;
          }
      
          baseQuery += ` ORDER BY Request_Ngo_Id DESC`;
      
          if (limit !== null && offset !== null && limit!=="null" && limit!=="undefined" && offset!=="null" && offset!=="undefined" && offset!=="" && limit!=="") {
            baseQuery += ` LIMIT :limit OFFSET :offset`;
            replacements.limit = Number(limit);   // ✅ Ensure numeric type
            replacements.offset = Number(offset); // ✅ Ensure numeric type
          }
          
      
          const results = await db.sequelize.query(baseQuery, {
            replacements,
            type: db.Sequelize.QueryTypes.SELECT,
          });
      
          return results ?? [];
        } catch (error) {
          throw error;
        }
      }
}

export default RequestNgoDAL