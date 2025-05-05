import ScoreHistoryDAL from "./score.history.data.layer.js";

const ScoreHistoryService = {
      // Method to create a new record
    createService: async (data) => {
        try {
            return await ScoreHistoryDAL.CreateData(data)
        } catch (error) {
            throw error
        }
    },
    // Method to update an existing record by its ID 
    updateService: async (sr_no, data) => {
        try {
            return await ScoreHistoryDAL.UpdateData(sr_no, data)
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve all records
    getAllService: async () => {
        try {
            return await ScoreHistoryDAL.getAllDataByView()
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve a specific record by its ID 
    getServiceById: async (sr_no) => {
        try {
            return await ScoreHistoryDAL.getDataByIdByView(sr_no)
        } catch (error) {
            throw error
        }
    }, 
    // Method to mark a record as deleted (soft delete) by its ID
    deleteByid: async (sr_no, req, res) => {
        try {
            return await ScoreHistoryDAL.deleteDataById(sr_no, req, res)
        } catch (error) {
            throw error
        }
    },getSimpleScoreHistoryByUserId:async(user_id)=>{
        try{
            return await ScoreHistoryDAL.getSimpleScoreHistoryByUserId(user_id)
        }catch(error){
            throw error
        }
    },getScoreDasHBoardDataByLimit:async(limit)=>{
        try{
            return await ScoreHistoryDAL.getScoreDashBoardDataByLimit(limit)
        }catch(error){
            throw error
        }
    }
}
export default ScoreHistoryService 