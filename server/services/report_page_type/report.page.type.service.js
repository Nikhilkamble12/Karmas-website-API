import ReportPageTypeDAL from "./report.page.type.data.layer.js";

const ReportPageTypeService = {
     // Method to create a new record
  createService: async (data) => {
    try {
      return await ReportPageTypeDAL.CreateData(data);
    } catch (error) {
      throw error;
    }
  },
  // Method to update an existing record by its ID
  updateService: async (report_page_type_id, data) => {
    try {
      return await ReportPageTypeDAL.UpdateData(report_page_type_id, data);
    } catch (error) {
      throw error;
    }
  },
  // Method to retrieve all records
  getAllService: async () => {
    try {
      return await ReportPageTypeDAL.getAllDataByView();
    } catch (error) {
      throw error;
    }
  },
  // Method to retrieve a specific record by its ID
  getServiceById: async (report_page_type_id) => {
    try {
      return await ReportPageTypeDAL.getDataByIdByView(report_page_type_id);
    } catch (error) {
      throw error;
    }
  },
  // Method to mark a record as deleted (soft delete) by its
  deleteById: async (report_page_type_id, req, res) => {
    try {
      return await ReportPageTypeDAL.deleteDataById(report_page_type_id, req, res);
    } catch (error) {
      throw error;
    }
  }
}


export default ReportPageTypeService