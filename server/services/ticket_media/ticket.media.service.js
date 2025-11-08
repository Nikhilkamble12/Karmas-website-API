import TicketMediaDAL from "./ticket.media.data.layer.js";

const TicketMediaService = {
    // Method to create a new record
    createService: async (data) => {
        try {
            return await TicketMediaDAL.CreateData(data);
        } catch (error) {
            throw error;
        }
    },

    // Method to update an existing record by its ID 
    updateService: async (ticket_media_id, data) => {
        try {
            return await TicketMediaDAL.UpdateData(ticket_media_id, data);
        } catch (error) {
            throw error;
        }
    },

    // Method to retrieve all records
    getAllService: async () => {
        try {
            return await TicketMediaDAL.getAllDataByView();
        } catch (error) {
            throw error;
        }
    },

    // Method to retrieve a specific record by its ID 
    getServiceById: async (ticket_media_id) => {
        try {
            return await TicketMediaDAL.getDataByIdByView(ticket_media_id);
        } catch (error) {
            throw error;
        }
    },

    // Method to mark a record as deleted (soft delete) by its ID
    deleteByid: async (ticket_media_id, req, res) => {
        try {
            return await TicketMediaDAL.deleteDataById(ticket_media_id, req, res);
        } catch (error) {
            throw error;
        }
    },

    // Method to get data by ticket ID
    getDataByTicketId: async (ticket_id) => {
        try {
            return await TicketMediaDAL.getDataByTicketId(ticket_id);
        } catch (error) {
            throw error;
        }
    }
};

export default TicketMediaService;