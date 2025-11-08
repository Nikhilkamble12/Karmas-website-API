import TicketDAL from "./ticket.data.layer.js";

const  TicketService = {
    // Method to create a new record
     createService: async (data) => {
        try {
            return await TicketDAL.CreateData(data)
        } catch (error) {
            throw error
        }
    },
    // Method to update an existing record by its ID 
    updateService: async (ticket_id, data) => {
        try {
            return await TicketDAL.UpdateData(ticket_id, data)
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve all records
    getAllService: async () => {
        try {
            return await TicketDAL.getAllDataByView()
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve a specific record by its ID 
    getServiceById: async (ticket_id) => {
        try {
            return await TicketDAL.getDataByIdByView(ticket_id)
        } catch (error) {
            throw error
        }
    }, 
    // Method to mark a record as deleted (soft delete) by its ID
    deleteByid: async (ticket_id, req, res) => {
        try {
            return await TicketDAL.deleteDataById(ticket_id, req, res)
        } catch (error) {
            throw error
        }
    }
}

export default TicketService