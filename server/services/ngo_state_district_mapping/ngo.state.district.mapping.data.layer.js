import NgoStateDistritMappingModel from "./ngo.state.district.mapping.model.js";
import commonPath from "../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
const { db, ViewFieldTableVise, tokenData } = commonPath // Destructure necessary components from commonPath

const NgoOfficeDistrictMappingDAL = {
    // Method to create a new record in the database
    CreateData: async (data) => {
        try {
            const createdData = await NgoStateDistritMappingModel(db.sequelize).create(data)
            return createdData // Return the created data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, 
    // Method to update an existing record by its ID
    UpdateData: async (ngo_state_district_mapping_id, data) => {
        try {
            const updateData = await NgoStateDistritMappingModel(db.sequelize).update(data, { where: { ngo_state_district_mapping_id: ngo_state_district_mapping_id } })
            return updateData // Return the result of the update operation
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, 
    // Method to retrieve all records by view
    getAllDataByView: async () => {
        try {
            const getAllData = await db.sequelize.query(`${ViewFieldTableVise.NGO_STATE_DISTRICT_MAPPING_FILDS}`, { type: db.Sequelize.QueryTypes.SELECT })
            return getAllData // Return the retrieved data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    },
    // Method to retrieve a specific record by its ID
    getDataByIdByView: async (ngo_state_district_mapping_id) => {
        try {
            const getDataById = await db.sequelize.query(` ${ViewFieldTableVise.NGO_STATE_DISTRICT_MAPPING_FILDS} where ngo_state_district_mapping_id  = ${ngo_state_district_mapping_id} `, { type: db.Sequelize.QueryTypes.SELECT })
            return getDataById[0] ?? [] // Return the retrieved data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, 
    // Method to mark a record as deleted (soft delete)
    deleteDataById: async (ngo_state_district_mapping_id, req, res) => {
        try {
            const [deleteDataById] = await NgoStateDistritMappingModel(db.sequelize).update({ is_active: 0, deleted_by: tokenData(req, res), deleted_at: new Date() }, {
                where: {
                    ngo_state_district_mapping_id: ngo_state_district_mapping_id
                }
            })
            return deleteDataById
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    },getDataByNgoId:async(ngo_id)=>{
        try{
            const getAllData = await db.sequelize.query(`${ViewFieldTableVise.NGO_STATE_DISTRICT_MAPPING_FILDS} where ngo_id = ${ngo_id}`, { type: db.Sequelize.QueryTypes.SELECT })
            return getAllData // Return the retrieved data
        }catch(error){
            throw error
        }
    },
    getAllNgoDataByCityId: async (city_id) => {
        try {
            const getDataById = await db.sequelize.query(
                `${ViewFieldTableVise.NGO_STATE_DISTRICT_MAPPING_FILDS} WHERE city_id = :cityId`,
                {
                    replacements: { cityId: city_id },
                    type: db.Sequelize.QueryTypes.SELECT
                }
            );
            
            // Remove duplicates by ngo_id
            const uniqueData = Object.values(
                getDataById.reduce((acc, row) => {
                    acc[row.ngo_id] = row;
                    return acc;
                }, {})
            );
            
            return uniqueData;
        } catch (error) {
            throw error;
        }
    },
    getAllNgoDataByDistrictId: async (district_id, excludeNgoIds = []) => {
        try {
            let query = `${ViewFieldTableVise.NGO_STATE_DISTRICT_MAPPING_FILDS} WHERE district_id = :districtId`;
            const replacements = { districtId: district_id };

            if (excludeNgoIds.length > 0) {
                query += ` AND ngo_id NOT IN (:excludeIds)`;
                replacements.excludeIds = excludeNgoIds;
            }

            const getDataById = await db.sequelize.query(query, {
                replacements,
                type: db.Sequelize.QueryTypes.SELECT
            });

            const uniqueData = Object.values(
                getDataById.reduce((acc, row) => {
                    acc[row.ngo_id] = row;
                    return acc;
                }, {})
            );

            return uniqueData;
        } catch (error) {
            throw error;
        }
    },
    getAllNgoDataByStateId: async (state_id, excludeNgoIds = []) => {
        try {
            let query = `${ViewFieldTableVise.NGO_STATE_DISTRICT_MAPPING_FILDS} WHERE state_id = :stateId`;
            const replacements = { stateId: state_id };

            if (excludeNgoIds.length > 0) {
                query += ` AND ngo_id NOT IN (:excludeIds)`;
                replacements.excludeIds = excludeNgoIds;
            }

            const getDataById = await db.sequelize.query(query, {
                replacements,
                type: db.Sequelize.QueryTypes.SELECT
            });

            const uniqueData = Object.values(
                getDataById.reduce((acc, row) => {
                    acc[row.ngo_id] = row;
                    return acc;
                }, {})
            );

            return uniqueData;
        } catch (error) {
            throw error;
        }
    },getRemaingNgoData:async(ngoId)=>{
        try{
            const ngoIdCondition = ngoId && ngoId.length > 0 ? `AND ngo_id NOT IN (${ngoId.join(",")})` : "";
            const getDataById = await db.sequelize.query(` ${ViewFieldTableVise.NGO_STATE_DISTRICT_MAPPING_FILDS} where ngo_id IS NOT NULL ${ngoIdCondition} `,{type:db.Sequelize.QueryTypes.SELECT})
            return getDataById   
        }catch(error){
            throw error
        }
    }

}

export default NgoOfficeDistrictMappingDAL