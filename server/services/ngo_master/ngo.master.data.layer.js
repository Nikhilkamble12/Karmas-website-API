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
            const getAllData = await db.sequelize.query(`${ViewFieldTableVise.NGO_MASTER_FIELDS}`, { type: db.Sequelize.QueryTypes.SELECT })
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
    },getAllSumByNgo:async()=>{
        try{
            const getAllSum = await db.sequelize.query( ` SELECT count(ngo_id) as total_ngo,sum(total_request_assigned) as total_request , sum(total_request_completed) as total_ngo_request_completed , sum(total_request_rejected) as total_ngo_request_rejected FROM ngo_master where is_active = true and is_blacklist = false `,{type:db.Sequelize.QueryTypes.SELECT})
            return getAllSum
        }catch(error){
            throw error
        }
    }
}
export default NgoMasterDAL