import NgoMasterModel from "./ngo.master.model.js";
import commonPath from "../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
import VIEW_NAME from "../../utils/db/view.constants.js";
const { db, ViewFieldTableVise, tokenData } = commonPath // Destructure necessary components from commonPath

const NgoMasterDAL = {
    // Method to create a new record in the database
    CreateData: async (data) => {
        try {
            const createdData = await NgoMasterModel(db.sequelize).create(data)
            return createdData // Return the created data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, 
    // Method to update an existing record by its ID
    UpdateData: async (ngo_id, data) => {
        try {
            const updateData = await NgoMasterModel(db.sequelize).update(data, { where: { ngo_id: ngo_id } })
            return updateData // Return the result of the update operation
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, 
    // Method to retrieve all records by view
    getAllDataByView: async () => {
        try {
            const getAllData = await db.sequelize.query(` ${ViewFieldTableVise.NGO_MASTER_FIELDS} order by ngo_id Desc `, { type: db.Sequelize.QueryTypes.SELECT })
            return getAllData // Return the retrieved data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    },

    getAllDataByViewWithLimit: async (limit, offset) => {
        try {
            const getAllData = await db.sequelize.query(
            `${ViewFieldTableVise.NGO_MASTER_FIELDS} LIMIT :limit OFFSET :offset`,
            {
                type: db.Sequelize.QueryTypes.SELECT,
                replacements: { limit: Number(limit), offset: Number(offset) }
            }
        );
        return getAllData;
        } catch (error) {
            throw error;
        }
    },
    
    // Method to retrieve a specific record by its ID
    getDataByIdByView: async (ngo_id) => {
        try {
            const getDataById = await db.sequelize.query(` ${ViewFieldTableVise.NGO_MASTER_FIELDS} where ngo_id  = ${ngo_id} `, { type: db.Sequelize.QueryTypes.SELECT })
            return getDataById[0] ?? [] // Return the retrieved data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, 
    // Method to mark a record as deleted (soft delete)
    deleteDataById: async (ngo_id, req, res) => {
        try {
            const [deleteDataById] = await NgoMasterModel(db.sequelize).update({ is_active: 0, deleted_by: tokenData(req, res), deleted_at: new Date() }, {
                where: {
                    ngo_id: ngo_id
                }
            })
            return deleteDataById
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    },getAllNgoDataByCityId:async(CityId)=>{
        try{
            const getDataById = await db.sequelize.query(` ${ViewFieldTableVise.NGO_MASTER_FIELDS} where ngo_id  = ${CityId} `, { type: db.Sequelize.QueryTypes.SELECT })
            return getDataById ?? [] // Return the retrieved data
        }catch(error){
            throw error
        }
    },getRemaingNgoWhoseIsNotYetCreated:async(ngoId)=>{
        try{
            const ngoIdCondition = ngoId && ngoId.length > 0 ? `where ngo_id NOT IN (${ngoId.join(",")})` : "";
            const getAllNgo = await db.sequelize.query(` ${ViewFieldTableVise.NGO_MASTER_FIELDS} ${ngoIdCondition} `,{ type: db.Sequelize.QueryTypes.SELECT})
            return getAllNgo
        }catch(error){
            throw error
        }
    },getAllBlacKlistedNgo:async()=>{
        try{
            const getAllBlackListedNgo = await db.sequelize.query(` ${ViewFieldTableVise.BLACK_LISTED_NGO_FIELDS} `,{type:db.Sequelize.QueryTypes.SELECT})
            return getAllBlackListedNgo
        }catch(error){
            throw error
        }
    },getAllSumByNgoDashBoard: async (ngo_id) => {
    try {
        // Base query
        let query = `
            SELECT 
                COUNT(ngo_id) AS total_ngo,
                SUM(total_request_assigned) AS total_ngo_request_assigned,
                SUM(total_request_completed) AS total_ngo_request_completed,
                SUM(total_request_rejected) AS total_ngo_request_rejected,

                SUM(CASE WHEN is_blacklist = TRUE THEN 1 ELSE 0 END) AS total_ngo_blacklisted,
                SUM(CASE WHEN is_blacklist = FALSE THEN 1 ELSE 0 END) AS total_ngo_not_blacklisted,

                SUM(CASE 
                    WHEN unique_id IS NULL 
                        OR TRIM(unique_id) = '' 
                        OR LOWER(TRIM(unique_id)) = 'null' 
                    THEN 1 ELSE 0 END) AS total_ngo_non_darpan_registered,

                SUM(CASE 
                    WHEN unique_id IS NOT NULL 
                        AND TRIM(unique_id) <> '' 
                        AND LOWER(TRIM(unique_id)) <> 'null'
                    THEN 1 ELSE 0 END) AS total_ngo_darpan_registered

            FROM ngo_master
            WHERE is_active = TRUE
        `;

        // Add ngo_id conditionally
        if (ngo_id && ngo_id!=="" && ngo_id!=="null") {
            query += ` AND ngo_id = :ngo_id`;
        }

        const getAllSum = await db.sequelize.query(query, {
            type: db.Sequelize.QueryTypes.SELECT,
            replacements: ngo_id ? { ngo_id } : {}
        });

        return getAllSum;
    } catch (error) {
        throw error;
    }
},searchNgoByFilter: async (search_query) => {
  try {
    // Trim and validate input
    const trimmedQuery = search_query?.trim();
    if (!trimmedQuery) return [];

    const getData = await db.sequelize.query(`
      SELECT 
        *,
        CASE
          WHEN ngo_name LIKE :exactMatch THEN 'ngo_name'
          WHEN registration_no LIKE :exactMatch THEN 'registration_no'
          WHEN unique_id LIKE :exactMatch THEN 'unique_id'
          WHEN ngo_name LIKE :search THEN 'ngo_name'
          WHEN registration_no LIKE :search THEN 'registration_no'
          WHEN unique_id LIKE :search THEN 'unique_id'
          WHEN email LIKE :search THEN 'email'
          WHEN city_name LIKE :search THEN 'city_name'
          WHEN state_name LIKE :search THEN 'state_name'
          WHEN country_name LIKE :search THEN 'country_name'
          WHEN address LIKE :search THEN 'address'
        END AS matched_fields
      FROM ${VIEW_NAME.GET_ALL_NGO_MASTER}
      WHERE 
        ngo_name LIKE :search
        OR registration_no LIKE :search
        OR unique_id LIKE :search
        OR email LIKE :search
        OR city_name LIKE :search
        OR state_name LIKE :search
        OR country_name LIKE :search
        OR address LIKE :search
      LIMIT 100
    `, {
      replacements: { 
        search: `%${trimmedQuery}%`,
        exactMatch: trimmedQuery
      },
      type: db.Sequelize.QueryTypes.SELECT
    });

    return getData;
  } catch (error) {
    console.error("Error while searching NGOs: ", error);
    throw error;
  }
},UpdateDataCount: async (ngo_id, fieldName, amount) => {
    try {
        const result = await NgoMasterModel(db.sequelize).increment(fieldName, { 
            by: amount, 
            where: { ngo_id: ngo_id } 
        });
        return result;
    } catch (error) {
        throw error;
    }
},

}
export default NgoMasterDAL