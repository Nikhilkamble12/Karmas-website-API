import RequestTypeDAL from "./request.type.data.layer.js";

const RequestTypeService = {
    // Method to create a new record
        createService: async (data) => {
            try {
                return await RequestTypeDAL.CreateData(data)
            } catch (error) {
                throw error
            }
        },
        // Method to update an existing record by its ID 
        updateService: async (request_type_id, data) => {
            try {
                return await RequestTypeDAL.UpdateData(request_type_id, data)
            } catch (error) {
                throw error
            }
        },
        // Method to retrieve all records
        getAllService: async () => {
            try {
                return await RequestTypeDAL.getAllDataByView()
            } catch (error) {
                throw error
            }
        },
        // Method to retrieve a specific record by its ID 
        getServiceById: async (request_type_id) => {
            try {
                return await RequestTypeDAL.getDataByIdByView(request_type_id)
            } catch (error) {
                throw error
            }
        }, 
        // Method to mark a record as deleted (soft delete) by its ID
        deleteByid: async (request_type_id, req, res) => {
            try {
                return await RequestTypeDAL.deleteDataById(request_type_id, req, res)
            } catch (error) {
                throw error
            }
        }
}
export default RequestTypeService