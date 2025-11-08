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
    },getUserRankByUserId:async(user_id)=>{
        try{
            return await ScoreHistoryDAL.getUserRankByUseriD(user_id)
        }catch(error){
            throw error
        }
    },getScoreHistoryByUserIdByView:async(user_id,limit,offset)=>{
        try{
            return await ScoreHistoryDAL.getAllScoreHistoryByUserIdByLimit(user_id,limit,offset)
        }catch(error){
            throw error
        }
    },ScoreDashBoardCount:async()=>{
        try{
            return await ScoreHistoryDAL.ScoreDashBoardCount()
        }catch(error){
            throw error
        }
    },SearchUserByName:async(user_name)=>{
        try{
            if (!user_name || typeof user_name !== 'string' || user_name.trim() === '') {
            throw new Error('Invalid or missing user_name');
        }
            return await ScoreHistoryDAL.getDataBySearchFilter(user_name)
        }catch(error){
            throw error
        }
    },
    findScoreHistoryByUsername: async (user_name, limit, offset) => {
        try {
            if (!user_name || typeof user_name !== 'string' || user_name.trim() === '') {
            throw new Error('Invalid or missing user_name');
            }
            return await ScoreHistoryDAL.checkWetherUserIsPresent(user_name, limit, offset)
        } catch (error) {
            throw error
        }
    }
}
export default ScoreHistoryService 