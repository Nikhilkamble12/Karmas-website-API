import TableMasterDAL from "./table.master.data.layer.js";

const TableMasterService = {
    // Method to create a new record
    createService: async (data) => {
        try {
            return await TableMasterDAL.CreateData(data)
        } catch (error) {
            throw error
        }
    },
    // Method to update an existing record by its ID 
    updateService: async (table_id, data) => {
        try {
            return await TableMasterDAL.UpdateData(table_id, data)
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve all records
    getAllService: async () => {
        try {
            return await TableMasterDAL.getAllDataByView()
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve a specific record by its ID 
    getServiceById: async (table_id) => {
        try {
            return await TableMasterDAL.getDataByIdByView(table_id)
        } catch (error) {
            throw error
        }
    }, 
    // Method to mark a record as deleted (soft delete) by its ID
    deleteByid: async (table_id, req, res) => {
        try {
            return await TableMasterDAL.deleteDataById(table_id, req, res)
        } catch (error) {
            throw error
        }
    }
}
export default TableMasterService