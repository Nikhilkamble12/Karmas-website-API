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
    },getNgoDataByCityId:async(city_id)=>{
        try{
            const getDataById = await db.sequelize.query(` ${ViewFieldTableVise.NGO_STATE_DISTRICT_MAPPING_FILDS} where city_id = ${city_id} `,{type:db.Sequelize.QueryTypes.SELECT})
            return getDataById
        }catch(error){
            throw error
        }
    },getNgoDataByDistrictId:async(district_id,ngoId)=>{
        try{
            console.log("ngoId",ngoId)
            const ngoIdCondition = ngoId && ngoId.length > 0 ? `AND ngo_id NOT IN (${ngoId.join(",")})` : "";
            const getDataById = await db.sequelize.query(` ${ViewFieldTableVise.NGO_STATE_DISTRICT_MAPPING_FILDS} where district_id = ${district_id} ${ngoIdCondition} `,{type:db.Sequelize.QueryTypes.SELECT})
            return getDataById 
        }catch(error){
            throw error
        }
    },getNgoDataByStateId:async(state_id,ngoId)=>{
        try{
              // If ngoId is empty or undefined, ignore the NOT IN clause
            const ngoIdCondition = ngoId && ngoId.length > 0 ? `AND ngo_id NOT IN (${ngoId.join(",")})` : "";
            const getDataById = await db.sequelize.query(` ${ViewFieldTableVise.NGO_STATE_DISTRICT_MAPPING_FILDS} where state_id = ${state_id} ${ngoIdCondition} `,{type:db.Sequelize.QueryTypes.SELECT})
            return getDataById 
        }catch(error){
            throw error
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