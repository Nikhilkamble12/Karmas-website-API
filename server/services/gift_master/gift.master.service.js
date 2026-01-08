import GiftMasterDAL from "./gift.master.data.layer.js";

const GiftMasterService = {
    // Method to create a new record
    createService: async (data) => {
        try {
            return await GiftMasterDAL.CreateData(data)
        } catch (error) {
            throw error
        }
    },
    // Method to update an existing record by its ID 
    updateService: async (gift_master_id, data) => {
        try {
            return await GiftMasterDAL.UpdateData(gift_master_id, data)
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve all records
    getAllService: async () => {
        try {
            return await GiftMasterDAL.getAllDataByView()
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve a specific record by its ID 
    getServiceById: async (gift_master_id) => {
        try {
            return await GiftMasterDAL.getDataByIdByView(gift_master_id)
        } catch (error) {
            throw error
        }
    }, 
    // Method to mark a record as deleted (soft delete) by its ID
    deleteByid: async (gift_master_id, req, res) => {
        try {
            return await GiftMasterDAL.deleteDataById(gift_master_id, req, res)
        } catch (error) {
            throw error
        }
    },getCountOfGift:async()=>{
        try{
            return await GiftMasterDAL.getTotalGiftCount()
        }catch(error){
            throw error
        }
    }
}
export default GiftMasterService