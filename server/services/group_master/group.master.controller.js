import GroupMasterService from "./group.master.service.js";
import commonPath from "../../middleware/comman_path/comman.path.js";
import GroupMasterModel from "./group.master.model.js";
import db from "../index.js";
import uploadFileToS3Folder from "../../utils/helper/s3.common.code.js";


const {
    commonResponse,
    responseCode,
    responseConst,
    logger,
    addMetaDataWhileCreateUpdate,fs
} = commonPath;

const GroupMasterController = {

    // Create a new record
    create: async (req, res) => {
        try {
            const data = req.body;

            // Add metadata (created_by, created_at)
            await addMetaDataWhileCreateUpdate(data, req, res, false);

            const createData = await GroupMasterService.createService(data);

            if (createData) {
                return res
                    .status(responseCode.CREATED)
                    .send(
                        commonResponse(
                            responseCode.CREATED,
                            responseConst.SUCCESS_ADDING_RECORD
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

    // Update record
    update: async (req, res) => {
        try {
            const id = req.query.id;
            const data = req.body;

            // Add metadata (modified_by, modified_at)
            await addMetaDataWhileCreateUpdate(data, req, res, true);

            const updatedRowsCount = await GroupMasterService.updateService(id, data);

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

    // Get all records
    getAllByView: async (req, res) => {
        try {
            const getAll = await GroupMasterService.getAllService();

            if (getAll.length !== 0) {
                return res
                    .status(responseCode.OK)
                    .send(
                        commonResponse(
                            responseCode.OK,
                            responseConst.DATA_RETRIEVE_SUCCESS,
                            getAll
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

    // Get record by ID
    getByIdByView: async (req, res) => {
        try {
            const id = req.query.id;

            const getDataById = await GroupMasterService.getServiceById(id);

            if (getDataById.length !== 0) {
                return res
                    .status(responseCode.OK)
                    .send(
                        commonResponse(
                            responseCode.OK,
                            responseConst.DATA_RETRIEVE_SUCCESS,
                            getDataById
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

    // Soft delete record
    deleteData: async (req, res) => {
        try {
            const id = req.query.id;

            const deleteData = await GroupMasterService.deleteByid(id, req, res);

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
    },BulkCreateOrUpdateGroupMaster: async (req, res) => {
         if (!req.file) {
            return res.status(400).send({ error: "No file uploaded" });
        }
        const filePath = req.file.path;
    try {

        function deleteFile(filePath) {
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error(`Error deleting file: ${filePath}`, err);
                } else {
                    console.log(`Local file deleted: ${filePath}`);
                }
            });
        }

        const data = req.body;


        const fileType = req.file.mimetype;
        const folderType = "group_master";
        const fileName = req.file.filename;

        // ✅ Validate group_id
        if (!data.group_id || data.group_id == 0) {
            deleteFile(filePath);
            return res
                .status(responseCode.BAD_REQUEST)
                .send(
                    commonResponse(
                        responseCode.BAD_REQUEST,
                        "GROUP_ID_REQUIRED",
                        null,
                        true
                    )
                );
        }

        // ✅ Store group_id into group_code
        data.group_code = data.group_id;

        // ✅ Find record based on group_code
        const existingGroup = await GroupMasterModel(db.sequelize).findOne({
            where: { group_code: data.group_code }
        });

        const s3BucketFileDynamic = `${folderType}/${data.group_code}/${fileName}`;
        if(existingGroup && existingGroup.s3_url){
            await uploadFileToS3Folder.deleteVideoByUrl(existingGroup.s3_url);
        }

        // Upload to S3
        const fileUrl = await uploadFileToS3Folder.uploadFileToS3(
            s3BucketFileDynamic,
            filePath,
            fileType
        );

        if (!fileUrl.success) {
            deleteFile(filePath);
            return res.status(500).send({
                error: "File upload failed!",
            });
        }

        const dataToStore = {
            group_code: data.group_code,
            group_name: data.group_name,
            file_path: fileUrl.url,
            s3_url:fileUrl.s3_url,
            file_name: fileName,
            is_public: data.is_public,
            is_announcement: data.is_announcement,
            admins: data.admins,
            is_active: 1,
        };
        if (existingGroup) {

            // ✅ UPDATE FLOW
            await addMetaDataWhileCreateUpdate(dataToStore, req, res, true);
            const update = await GroupMasterService.updateService(
                existingGroup.group_id,
                dataToStore
            );

            deleteFile(filePath);

            if (update === 0) {
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
            const finalData = await GroupMasterService.getServiceById(existingGroup.group_id);
            return res
                .status(responseCode.OK)
                .send(
                    commonResponse(
                        responseCode.OK,
                        responseConst.SUCCESS_UPDATING_RECORD,
                        finalData
                    )
                );

        } else {
            // ✅ CREATE FLOW
            await addMetaDataWhileCreateUpdate(dataToStore, req, res, false);

            const createData = await GroupMasterService.createService(dataToStore);

            deleteFile(filePath);

            if (!createData) {
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
            const finalData = await GroupMasterService.getServiceById(createData.group_id);
            return res
                .status(responseCode.CREATED)
                .send(
                    commonResponse(
                        responseCode.CREATED,
                        responseConst.SUCCESS_ADDING_RECORD,
                        finalData
                    )
                );
        }

    } catch (error) {
        console.log("error", error);
        logger.error(`Error ---> ${error}`);
        deleteFile(filePath);
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
getByCodeByView: async (req, res) => {
        try {
            const group_code = req.query.group_code;

            const getDataById = await GroupMasterService.getServiceByCode(group_code);

            if (getDataById.length !== 0) {
                return res
                    .status(responseCode.OK)
                    .send(
                        commonResponse(
                            responseCode.OK,
                            responseConst.DATA_RETRIEVE_SUCCESS,
                            getDataById
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
};

export default GroupMasterController;