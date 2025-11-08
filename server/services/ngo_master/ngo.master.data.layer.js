import NgoMasterModel from "./ngo.master.model.js";
import commonPath from "../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
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
                SUM(CASE WHEN is_blacklist = FALSE THEN 1 ELSE 0 END) AS total_ngo_non_blacklisted_ngo,

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
        // Define the query with a parameter placeholder :search_query
        const getData = await db.sequelize.query(`
            ${ViewFieldTableVise.NGO_MASTER_FIELDS}
            WHERE
                (ngo_name LIKE CONCAT('%', :search_query, '%') OR
                 registration_no LIKE CONCAT('%', :search_query, '%') OR
                 unique_id LIKE CONCAT('%', :search_query, '%') OR
                 address LIKE CONCAT('%', :search_query, '%') OR
                 city_name LIKE CONCAT('%', :search_query, '%') OR
                 state_name LIKE CONCAT('%', :search_query, '%') OR
                 country_name LIKE CONCAT('%', :search_query, '%') OR
                 email LIKE CONCAT('%', :search_query, '%'))`,
            {
                replacements: { search_query }, // Bind the search_query value here
                type: db.Sequelize.QueryTypes.SELECT
            }
        );
        
        // Return the fetched data
        return getData;
    } catch (error) {
        console.error("Error while searching NGOs: ", error);
        throw error;
    }
}

}
export default NgoMasterDAL