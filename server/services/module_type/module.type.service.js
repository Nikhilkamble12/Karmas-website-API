import ModuleTypeDAL from "./module.type.data.layer.js";

const ModuleTypeService = {
    // Method to create a new record
     createService: async (data) => {
        try {
            return await ModuleTypeDAL.CreateData(data)
        } catch (error) {
            throw error
        }
    },
    // Method to update an existing record by its ID 
    updateService: async (module_type_id, data) => {
        try {
            return await ModuleTypeDAL.UpdateData(module_type_id, data)
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve all records
    getAllService: async () => {
        try {
            return await ModuleTypeDAL.getAllDataByView()
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve a specific record by its ID 
    getServiceById: async (module_type_id) => {
        try {
            return await ModuleTypeDAL.getDataByIdByView(module_type_id)
        } catch (error) {
            throw error
        }
    }, 
    // Method to mark a record as deleted (soft delete) by its ID
    deleteByid: async (module_type_id, req, res) => {
        try {
            return await ModuleTypeDAL.deleteDataById(module_type_id, req, res)
        } catch (error) {
            throw error
        }
    },
}

export default ModuleTypeService