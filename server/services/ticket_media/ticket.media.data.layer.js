import TicketMediaModel from "./ticket.media.model.js";
import commonPath from "../../middleware/comman_path/comman.path.js";
const { db, ViewFieldTableVise, tokenData } = commonPath

const TicketMediaDAL = {
    // Method to create a new record in the database
    CreateData: async (data) => {
        try {
            const createdData = await TicketMediaModel(db.sequelize).create(data)
            return createdData
        } catch (error) {
            throw error
        }
    },

    // Method to update an existing record by its ID
    UpdateData: async (ticket_media_id, data) => {
        try {
            const updateData = await TicketMediaModel(db.sequelize).update(data, {
                where: { ticket_media_id: ticket_media_id }
            })
            return updateData
        } catch (error) {
            throw error
        }
    },

    // Method to retrieve all records by view
    getAllDataByView: async () => {
        try {
            const getAllData = await db.sequelize.query(
                `${ViewFieldTableVise.TICKET_MEDIA_FIELDS}`, 
                { type: db.Sequelize.QueryTypes.SELECT }
            )
            return getAllData
        } catch (error) {
            throw error
        }
    },

    // Method to retrieve a specific record by its ID
    getDataByIdByView: async (ticket_media_id) => {
        try {
            const getDataById = await db.sequelize.query(
                `${ViewFieldTableVise.TICKET_MEDIA_FIELDS} where ticket_media_id = ${ticket_media_id}`,
                { type: db.Sequelize.QueryTypes.SELECT }
            )
            return getDataById[0] ?? []
        } catch (error) {
            throw error
        }
    },

    // Method to mark a record as deleted (soft delete)
    deleteDataById: async (ticket_media_id, req, res) => {
        try {
            const [deleteDataById] = await TicketMediaModel(db.sequelize).update(
                {
                    is_active: 0,
                    deleted_by: tokenData(req, res),
                    deleted_at: new Date()
                },
                {
                    where: {
                        ticket_media_id: ticket_media_id
                    }
                }
            )
            return deleteDataById
        } catch (error) {
            throw error
        }
    },

    // Method to get data by ticket ID
    getDataByTicketId: async (ticket_id) => {
        try {
            const getAllData = await db.sequelize.query(
                `${ViewFieldTableVise.TICKET_MEDIA_FIELDS} where ticket_id = ${ticket_id}`,
                { type: db.Sequelize.QueryTypes.SELECT }
            )
            return getAllData
        } catch (error) {
            throw error
        }
    }
}

export default TicketMediaDAL