import BlogsService from "./blogs.service.js";
import commonPath from "../../middleware/comman_path/comman.path.js";
import BlogMediaService from "../blog_media/blog.media.service.js";
const {commonResponse,responseCode,responseConst,logger,tokenData,currentTime,addMetaDataWhileCreateUpdate} = commonPath

const BlogsController = {
    // Create A new Record 
    create: async (req, res) => {
        try {
            const data = req.body;
            // Add metadata for creation (created by, created at)
            await addMetaDataWhileCreateUpdate(data, req, res, false);
            // data.created_by=1,
            // data.created_at = new Date()
            // Create the record using ORM
            const createData = await BlogsService.createService(data);
            if (createData) {
                return res
                    .status(responseCode.CREATED)
                    .send(
                        commonResponse(
                            responseCode.CREATED,
                            responseConst.SUCCESS_ADDING_RECORD,
                            createData
                        )
                    );
            } else {
                return res
                    .status(responseCode.BAD_REQUEST)
                    .send(
                        commonResponse(
                            responseCode.BAD_REQUEST,
                            responseConst.ERROR_ADDING_RECORD,
                            null,
                            true
                        )
                    );
            }
        } catch (error) {
            console.log("error",error)
            logger.error(`Error ---> ${error}`);
            return res
                .status(responseCode.INTERNAL_SERVER_ERROR)
                .send(
                    commonResponse(
                        responseCode.INTERNAL_SERVER_ERROR,
                        responseConst.INTERNAL_SERVER_ERROR,
                        null,
                        true
                    )
                );
        }
    },    
    // update Record Into Db
    update: async (req, res) => {
        try {
            const id = req.query.id
            const data = req.body
            // Add metadata for modification (modified by, modified at)
            await addMetaDataWhileCreateUpdate(data, req, res, true);

            // Update the record using ORM
            const updatedRowsCount = await BlogsService.updateService(id, data);
            // if (updatedRowsCount > 0) {
            //     const newData = await BlogsService.getServiceById(id);
            //     // Update the JSON data in the file
            //     await CommanJsonFunction.updateDataByField(CITY_FOLDER, CITY_JSON, "city_id", id, newData, CITY_VIEW_NAME);
            // }
            // Handle case where no records were updated
            if (updatedRowsCount === 0) {
                return res
                    .status(responseCode.BAD_REQUEST)
                    .send(
                        commonResponse(
                            responseCode.BAD_REQUEST,
                            responseConst.ERROR_UPDATING_RECORD,
                            null,
                            true
                        )
                    );
            }
            return res
                .status(responseCode.CREATED)
                .send(
                    commonResponse(
                        responseCode.CREATED,
                        responseConst.SUCCESS_UPDATING_RECORD
                    )
                );
        } catch (error) {
            logger.error(`Error ---> ${error}`);
            return res
                .status(responseCode.INTERNAL_SERVER_ERROR)
                .send(
                    commonResponse(
                        responseCode.INTERNAL_SERVER_ERROR,
                        responseConst.INTERNAL_SERVER_ERROR,
                        null,
                        true
                    )
                );
        }
    },
    // Retrieve all records 
getAllByView: async (req, res) => {
    try {
        // --- PAGINATION LOGIC START ---
        // Default to Page 1 and Limit 10 if not provided
        const page = req.query.page ? parseInt(req.query.page) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit) : 10;
        const offset = (page - 1) * limit;
        // --- PAGINATION LOGIC END ---

        // Pass limit and offset to the service
        const getAll = await BlogsService.getAllDataByViewByLimit(limit, offset);

        // Check if data exists
        if (getAll.length !== 0) {
            
            const blogIds = getAll.map((element) => element.blog_id);
            
            // Fetch media for only these specific (paginated) blogs
            const getAllBlogMediaUsingId = await BlogMediaService.getDatabyInBlogIdByView(blogIds);

            const finalData = getAll.map((blog) => {
                // Determine if 'blog' is a plain object or Sequelize instance
                // (Raw queries usually return plain objects, but this is a safety check)
                const blogId = blog.blog_id; 

                const mediaForThisBlog = getAllBlogMediaUsingId.filter(media => media.blog_id === blogId);
                
                return {
                    ...blog, 
                    media: mediaForThisBlog
                };
            });

            return res
                .status(responseCode.OK)
                .send(
                    commonResponse(
                        responseCode.OK,
                        responseConst.DATA_RETRIEVE_SUCCESS,
                        finalData,
                        false,
                        // Optional: You can return pagination metadata here if your commonResponse supports it
                        { page, limit, count: finalData.length } 
                    )
                );
        } else {
            return res
                .status(responseCode.BAD_REQUEST)
                .send(
                    commonResponse(
                        responseCode.BAD_REQUEST,
                        responseConst.DATA_NOT_FOUND,
                        [], // Return empty array instead of null for consistency
                        true
                    )
                );
        }
    } catch (error) {
        console.log("error", error);
        logger.error(`Error ---> ${error}`);
        return res
            .status(responseCode.INTERNAL_SERVER_ERROR)
            .send(
                commonResponse(
                    responseCode.INTERNAL_SERVER_ERROR,
                    responseConst.INTERNAL_SERVER_ERROR,
                    null,
                    true
                )
            );
    }
},
    // Retrieve a blog with its media by blog_id
    getByBlogIdWithMedia: async (req, res) => {
        try {
            const blogId = req.query.blog_id;
            
            // Fetch blog data by ID
            const blogData = await BlogsService.getServiceById(blogId);
            
            if (blogData.length === 0) {
                return res
                    .status(responseCode.BAD_REQUEST)
                    .send(
                        commonResponse(
                            responseCode.BAD_REQUEST,
                            responseConst.DATA_NOT_FOUND,
                            null,
                            true
                        )
                    );
            }
            
            // Fetch media for this blog
            const blogMedia = await BlogMediaService.getDatabyInBlogIdByView([blogId]);
            
            // Combine blog data with media
            const finalData = {
                ...blogData,
                media: blogMedia
            };
            
            return res
                .status(responseCode.OK)
                .send(
                    commonResponse(
                        responseCode.OK,
                        responseConst.DATA_RETRIEVE_SUCCESS,
                        finalData
                    )
                );
        } catch (error) {
            console.log("error", error);
            logger.error(`Error ---> ${error}`);
            return res
                .status(responseCode.INTERNAL_SERVER_ERROR)
                .send(
                    commonResponse(
                        responseCode.INTERNAL_SERVER_ERROR,
                        responseConst.INTERNAL_SERVER_ERROR,
                        null,
                        true
                    )
                );
        }
    },
    // Retrieve a record by its ID
    getByIdByView: async (req, res) => {
        try {
            const Id = req.query.id
            // Fetch data by ID from JSON
            // const getJsonDatabyId=await CommanJsonFunction.getFirstDataByField(CITY_FOLDER,CITY_JSON,"city_id",Id)
            // if(getJsonDatabyId!==null){
            //   return res
            //     .status(responseCode.OK)
            //     .send(
            //       commonResponse(
            //         responseCode.OK,
            //         responseConst.DATA_RETRIEVE_SUCCESS,
            //         getJsonDatabyId
            //       )
            //     );
            // }

            // If not found in JSON, fetch data from the database
            const getDataByid = await BlogsService.getServiceById(Id)

            // const fileStatus=await CommanJsonFunction.checkFileExistence(CITY_FOLDER,CITY_JSON)
            // // Store the data in JSON for future retrieval
            // if(fileStatus==false){
            //   const DataToSave=await BlogsService.getAllService()
            //   if(DataToSave.length!==0){
            //     await CommanJsonFunction.storeData( CITY_FOLDER, CITY_JSON, DataToSave, null, CITY_VIEW_NAME)
            //   }
            // }
            // Return the fetched data or handle case where no data is found
            if (getDataByid.length !== 0) {
                return res
                    .status(responseCode.OK)
                    .send(
                        commonResponse(
                            responseCode.OK,
                            responseConst.DATA_RETRIEVE_SUCCESS,
                            getDataByid
                        )
                    );
            } else {
                return res
                    .status(responseCode.BAD_REQUEST)
                    .send(
                        commonResponse(
                            responseCode.BAD_REQUEST,
                            responseConst.DATA_NOT_FOUND,
                            null,
                            true
                        )
                    );
            }
        } catch (error) {
            logger.error(`Error ---> ${error}`);
            return res
                .status(responseCode.INTERNAL_SERVER_ERROR)
                .send(
                    commonResponse(
                        responseCode.INTERNAL_SERVER_ERROR,
                        responseConst.INTERNAL_SERVER_ERROR,
                        null,
                        true
                    )
                );
        }
    },
    // Delete A Record 
    deleteData: async (req, res) => {
        try {
            const id = req.query.id
            // Delete data from the database
            const deleteData = await BlogsService.deleteByid(id, req, res)
            // Also delete data from the JSON file
            // const deleteSatus=await CommanJsonFunction.deleteDataByField(CITY_FOLDER,CITY_JSON,"city_id",id)
            if (deleteData === 0) {
                return res
                    .status(responseCode.BAD_REQUEST)
                    .send(
                        commonResponse(
                            responseCode.BAD_REQUEST,
                            responseConst.ERROR_DELETING_RECORD,
                            null,
                            true
                        )
                    );
            }

            return res
                .status(responseCode.CREATED)
                .send(
                    commonResponse(
                        responseCode.CREATED,
                        responseConst.SUCCESS_DELETING_RECORD
                    )
                );
        } catch (error) {
            logger.error(`Error ---> ${error}`);
            return res
                .status(responseCode.INTERNAL_SERVER_ERROR)
                .send(
                    commonResponse(
                        responseCode.INTERNAL_SERVER_ERROR,
                        responseConst.INTERNAL_SERVER_ERROR,
                        null,
                        true
                    )
                );
        }
    },
    // Retrieve all records with pagination and limit
    getAllWithlimit: async (req, res) => {
        try {
            // Get pagination parameters from query
            const limit = parseInt(req.query.limit) || 10; // Default to 10 if not provided
            const offset = parseInt(req.query.offset) || 0; // Default to 0 if not provided

            // Fetch data from the database with pagination
            const getAll = await BlogsService.getAllServiceWithPagination(limit, offset);

            // Check if data exists
            if (getAll.length !== 0) {
                // Extract blog IDs
                const blogIds = getAll.map((element) => element.blog_id);
                
                // Fetch media for all these blogs
                const getAllBlogMediaUsingId = await BlogMediaService.getDatabyInBlogIdByView(blogIds);

                // Merge the media into the blog objects (only first media per blog)
                const finalData = getAll.map((blog) => {
                    // Find the first media item that belongs to this specific blog
                    const mediaForThisBlog = getAllBlogMediaUsingId.find(media => media.blog_id === blog.blog_id);
                    
                    // Return the blog object with media property
                    return {
                        ...blog, 
                        media: mediaForThisBlog || null // Return null if no media found
                    };
                });

                return res
                    .status(responseCode.OK)
                    .send(
                        commonResponse(
                            responseCode.OK,
                            responseConst.DATA_RETRIEVE_SUCCESS,
                            finalData
                        )
                    );
            } else {
                return res
                    .status(responseCode.BAD_REQUEST)
                    .send(
                        commonResponse(
                            responseCode.BAD_REQUEST,
                            responseConst.DATA_NOT_FOUND,
                            null,
                            true
                        )
                    );
            }
        } catch (error) {
            console.log("error", error);
            logger.error(`Error ---> ${error}`);
            return res
                .status(responseCode.INTERNAL_SERVER_ERROR)
                .send(
                    commonResponse(
                        responseCode.INTERNAL_SERVER_ERROR,
                        responseConst.INTERNAL_SERVER_ERROR,
                        null,
                        true
                    )
                );
        }
    }
}
export default BlogsController