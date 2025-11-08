import ReportDAL from "./report.data.layer.js";

const ReportService = {
    // Method to create a new record
  createService: async (data) => {
    try {
      return await ReportDAL.CreateData(data);
    } catch (error) {
      throw error;
    }
  },
  // Method to update an existing record by its ID
  updateService: async (report_id, data) => {
    try {
      return await ReportDAL.UpdateData(report_id, data);
    } catch (error) {
      throw error;
    }
  },
  // Method to retrieve all records
  getAllService: async () => {
    try {
      return await ReportDAL.getAllDataByView();
    } catch (error) {
      throw error;
    }
  },
  // Method to retrieve a specific record by its ID
  getServiceById: async (report_id) => {
    try {
      return await ReportDAL.getDataByIdByView(report_id);
    } catch (error) {
      throw error;
    }
  },
  // Method to mark a record as deleted (soft delete) by its
  deleteById: async (report_id, req, res) => {
    try {
      return await ReportDAL.deleteDataById(report_id, req, res);
    } catch (error) {
      throw error;
    }
  }
}

export default ReportService