import ScoreCategoryDAL from "./score.category.data.layer.js";

const ScoreCategoryService = {
    // Method to create a new record
    createService: async (data) => {
        try {
            return await ScoreCategoryDAL.CreateData(data)
        } catch (error) {
            throw error
        }
    },
    // Method to update an existing record by its ID 
    updateService: async (score_category_id, data) => {
        try {
            return await ScoreCategoryDAL.UpdateData(score_category_id, data)
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve all records
    getAllService: async () => {
        try {
            return await ScoreCategoryDAL.getAllDataByView()
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve a specific record by its ID 
    getServiceById: async (score_category_id) => {
        try {
            return await ScoreCategoryDAL.getDataByIdByView(score_category_id)
        } catch (error) {
            throw error
        }
    }, 
    // Method to mark a record as deleted (soft delete) by its ID
    deleteByid: async (score_category_id, req, res) => {
        try {
            return await ScoreCategoryDAL.deleteDataById(score_category_id, req, res)
        } catch (error) {
            throw error
        }
    },getDataByStateIdByView:async(state_id)=>{
        try{
            return await ScoreCategoryDAL.getDataByStateIdByView(state_id)
        }catch(error){
            throw error
        }
    }
}
export default ScoreCategoryService