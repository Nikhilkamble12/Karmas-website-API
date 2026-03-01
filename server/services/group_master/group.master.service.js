import GroupMasterDAL from "./group.master.data.layer.js";

const GroupMasterService = {

    // Create new group
    createService: async (data) => {
        try {
            return await GroupMasterDAL.CreateData(data);
        } catch (error) {
            throw error;
        }
    },

    // Update existing group
    updateService: async (group_id, data) => {
        try {
            return await GroupMasterDAL.UpdateData(group_id, data);
        } catch (error) {
            throw error;
        }
    },

    // Get all groups
    getAllService: async () => {
        try {
            return await GroupMasterDAL.getAllDataByView();
        } catch (error) {
            throw error;
        }
    },

    // Get group by ID
    getServiceById: async (group_id) => {
        try {
            return await GroupMasterDAL.getDataByIdByView(group_id);
        } catch (error) {
            throw error;
        }
    },

    // Soft delete group
    deleteByid: async (group_id, req, res) => {
        try {
            return await GroupMasterDAL.deleteDataById(group_id, req, res);
        } catch (error) {
            throw error;
        }
    },getServiceByCode:async(group_code)=>{
        try{
            return await GroupMasterDAL.getDataByCodeByView(group_code);
        }catch(error){
            throw error;
        }
    }

};

export default GroupMasterService;