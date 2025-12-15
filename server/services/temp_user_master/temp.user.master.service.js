import TempUserMasterDAL from "./temp.user.master.data.layer.js";

const TempUserMasterService = {

    // Create new temp user
    createService: async (data) => {
        try {
            return await TempUserMasterDAL.CreateData(data);
        } catch (error) {
            throw error;
        }
    },

    // Update temp user by ID
    updateService: async (user_id, data) => {
        try {
            return await TempUserMasterDAL.UpdateData(user_id, data);
        } catch (error) {
            throw error;
        }
    },

    // Get all temp users
    getAllService: async () => {
        try {
            return await TempUserMasterDAL.getAllDataByView();
        } catch (error) {
            throw error;
        }
    },

    // Get temp user by ID
    getServiceById: async (user_id) => {
        try {
            return await TempUserMasterDAL.getDataByIdByView(user_id);
        } catch (error) {
            throw error;
        }
    },

    // Soft delete temp user
    deleteById: async (user_id, req, res) => {
        try {
            return await TempUserMasterDAL.deleteDataById(user_id, req, res);
        } catch (error) {
            throw error;
        }
    },getByEmail:async(email_id)=>{
        try{
            return await TempUserMasterDAL.getByEmail(email_id)
        }catch(error){
            throw error
        }
    },deleteDataByIdHard:async(user_id)=>{
        try{
            return await TempUserMasterDAL.deleteDataByIdHard(user_id)
        }catch(error){
            throw error
        }
    },deleteOldRecordsHard:async()=>{
        try{
            return await TempUserMasterDAL.deleteOldRecordsHard()
        }catch(error){
            throw error
        }
    }
};

export default TempUserMasterService;
