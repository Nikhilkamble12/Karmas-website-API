import ReportTypeDAL from "./report.type.data.layer.js";

const ReportTypeService = {
    // Method to create a new record
     createService: async (data) => {
        try {
            return await ReportTypeDAL.CreateData(data)
        } catch (error) {
            throw error
        }
    },
    // Method to update an existing record by its ID 
    updateService: async (report_type_id, data) => {
        try {
            return await ReportTypeDAL.UpdateData(report_type_id, data)
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve all records
    getAllService: async () => {
        try {
            return await ReportTypeDAL.getAllDataByView()
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve a specific record by its ID 
    getServiceById: async (report_type_id) => {
        try {
            return await ReportTypeDAL.getDataByIdByView(report_type_id)
        } catch (error) {
            throw error
        }
    }, 
    // Method to mark a record as deleted (soft delete) by its ID
    deleteByid: async (report_type_id, req, res) => {
        try {
            return await ReportTypeDAL.deleteDataById(report_type_id, req, res)
        } catch (error) {
            throw error
        }
    }
}

export default ReportTypeService