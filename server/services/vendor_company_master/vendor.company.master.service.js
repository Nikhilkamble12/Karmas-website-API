import VendorCompanyMasterDAL from "./vendor.company.master.data.layer.js";

const VendorCompanyMasterService = {
    // Method to create a new record
    createService: async (data) => {
        try {
            return await VendorCompanyMasterDAL.CreateData(data)
        } catch (error) {
            throw error
        }
    },
    // Method to update an existing record by its ID 
    updateService: async (company_id, data) => {
        try {
            return await VendorCompanyMasterDAL.UpdateData(company_id, data)
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve all records
    getAllService: async () => {
        try {
            return await VendorCompanyMasterDAL.getAllDataByView()
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve a specific record by its ID 
    getServiceById: async (company_id) => {
        try {
            return await VendorCompanyMasterDAL.getDataByIdByView(company_id)
        } catch (error) {
            throw error
        }
    }, 
    // Method to mark a record as deleted (soft delete) by its ID
    deleteByid: async (company_id, req, res) => {
        try {
            return await VendorCompanyMasterDAL.deleteDataById(company_id, req, res)
        } catch (error) {
            throw error
        }
    }
}
export default VendorCompanyMasterService