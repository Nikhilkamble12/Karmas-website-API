import BlogsDAL from "./blogs.data.layer.js";

const BlogsService = {
     // Method to create a new record
     createService: async (data) => {
        try {
            return await BlogsDAL.CreateData(data)
        } catch (error) {
            throw error
        }
    },
    // Method to update an existing record by its ID 
    updateService: async (blog_id, data) => {
        try {
            return await BlogsDAL.UpdateData(blog_id, data)
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve all records
    getAllService: async () => {
        try {
            return await BlogsDAL.getAllDataByView()
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve a specific record by its ID 
    getServiceById: async (blog_id) => {
        try {
            return await BlogsDAL.getDataByIdByView(blog_id)
        } catch (error) {
            throw error
        }
    }, 
    // Method to mark a record as deleted (soft delete) by its ID
    deleteByid: async (blog_id, req, res) => {
        try {
            return await BlogsDAL.deleteDataById(blog_id, req, res)
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve blogs with pagination
    getAllServiceWithPagination: async (limit, offset) => {
        try {
            return await BlogsDAL.getAllDataWithPagination(limit, offset)
        } catch (error) {
            throw error
        }
    }
}
export default BlogsService