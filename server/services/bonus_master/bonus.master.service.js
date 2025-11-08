import BonusMasterDAL from "./bonus.master.data.layer.js";

const BonusMasterService = {
    // Method to create a new record
    createService: async (data) => {
        try {
            return await BonusMasterDAL.CreateData(data)
        } catch (error) {
            throw error
        }
    },
    // Method to update an existing record by its ID 
    updateService: async (bonus_id, data) => {
        try {
            return await BonusMasterDAL.UpdateData(bonus_id, data)
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve all records
    getAllService: async () => {
        try {
            return await BonusMasterDAL.getAllDataByView()
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve a specific record by its ID 
    getServiceById: async (bonus_id) => {
        try {
            return await BonusMasterDAL.getDataByIdByView(bonus_id)
        } catch (error) {
            throw error
        }
    }, 
    // Method to mark a record as deleted (soft delete) by its ID
    deleteByid: async (bonus_id, req, res) => {
        try {
            return await BonusMasterDAL.deleteDataById(bonus_id, req, res)
        } catch (error) {
            throw error
        }
    },getBonusMasterDataByCategoryStatus:async(score_category_id,status_id)=>{
        try{
            return await BonusMasterDAL.getBonusMasterDataByCategoryStatus(score_category_id,status_id)
        }catch(error){
            throw error
        }
    }
}
export default BonusMasterService