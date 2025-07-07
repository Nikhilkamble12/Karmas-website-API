import MenuDAL from "./menu.data.layer.js";

const MenuService = {
    // Method to create a new record
    createService: async (data) => {
        try {
            return await MenuDAL.CreateData(data)
        } catch (error) {
            throw error
        }
    },
    // Method to update an existing record by its ID 
    updateService: async (menu_id, data) => {
        try {
            return await MenuDAL.UpdateData(menu_id, data)
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve all records
    getAllService: async () => {
        try {
            return await MenuDAL.getAllDataByView()
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve a specific record by its ID 
    getServiceById: async (menu_id) => {
        try {
            return await MenuDAL.getDataByIdByView(menu_id)
        } catch (error) {
            throw error
        }
    }, 
    // Method to mark a record as deleted (soft delete) by its ID
    deleteByid: async (menu_id, req, res) => {
        try {
            return await MenuDAL.deleteDataById(menu_id, req, res)
        } catch (error) {
            throw error
        }
    }
}

export default MenuService