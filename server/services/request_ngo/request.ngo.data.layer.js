import RequestNgoModel from "./request.ngo.model.js";
import commonPath from "../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
import VIEW_NAME from "../../utils/db/view.constants.js";
const { db, ViewFieldTableVise, tokenData } = commonPath // Destructure necessary components from commonPath
import { STATUS_MASTER } from "../../utils/constants/id_constant/id.constants.js";

const RequestNgoDAL = {
    // Method to create a new record in the database
    CreateData: async (data) => {
        try {
            const createdData = await RequestNgoModel(db.sequelize).create(data)
            return createdData // Return the created data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    },
    // Method to update an existing record by its ID
    UpdateData: async (Request_Ngo_Id, data) => {
        try {
            delete data.Request_Ngo_Id

            const updateData = await RequestNgoModel(db.sequelize).update(data, { where: { Request_Ngo_Id: Request_Ngo_Id } })
            return updateData // Return the result of the update operation
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    },
    // Method to retrieve all records by view
    getAllDataByView: async () => {
        try {
            let getAllData = await db.sequelize.query(`${ViewFieldTableVise.NGO_REQUEST_MAPPING_FIELDS}`, { type: db.Sequelize.QueryTypes.SELECT })
            let fulldata = []
            if (getAllData && getAllData.length > 0) {
                fulldata = getAllData.map(row => ({
                    ...row, // keep all existing columns
                    ngo_logo_path:
                        row.ngo_logo_path &&
                            row.ngo_logo_path !== 'null' &&
                            row.ngo_logo_path.trim() !== ''
                            ? `${process.env.GET_LIVE_CURRENT_URL}/resources/${row.ngo_logo_path}`
                            : null
                }));
            }
            return fulldata // Return the retrieved data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    },
    // Method to retrieve a specific record by its ID
    getDataByIdByView: async (Request_Ngo_Id) => {
        try {
            const getDataById = await db.sequelize.query(` ${ViewFieldTableVise.NGO_REQUEST_MAPPING_FIELDS} where Request_Ngo_Id  = ${Request_Ngo_Id} `, { type: db.Sequelize.QueryTypes.SELECT })
            const resultWithImages = getDataById.map(row => ({
                ...row, // keep all existing columns
                ngo_logo_path:
                    row.ngo_logo_path &&
                        row.ngo_logo_path !== 'null' &&
                        row.ngo_logo_path.trim() !== ''
                        ? `${process.env.GET_LIVE_CURRENT_URL}/resources/${row.ngo_logo_path}`
                        : null
            }));
            return resultWithImages[0] ?? [] // Return the retrieved data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    },
    // Method to mark a record as deleted (soft delete)
    deleteDataById: async (Request_Ngo_Id, req, res) => {
        try {
            const [deleteDataById] = await RequestNgoModel(db.sequelize).update({ is_active: 0, deleted_by: tokenData(req, res), deleted_at: new Date() }, {
                where: {
                    Request_Ngo_Id: Request_Ngo_Id
                }
            })
            return deleteDataById
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, getDataByRequestIdAndNgoId: async (RequestId, NgoId) => {
        try {
            const getAllData = await db.sequelize.query(` ${ViewFieldTableVise.NGO_REQUEST_MAPPING_FIELDS}  where RequestId = ${RequestId} and ngo_id = ${NgoId} `, { type: db.Sequelize.QueryTypes.SELECT })
            return getAllData ?? [] // Return the retrieved data
        } catch (error) {
            throw error
        }
    }, getDataByNgoId: async (ngo_id) => {
        try {
            const getAllData = await db.sequelize.query(` ${ViewFieldTableVise.NGO_REQUEST_MAPPING_FIELDS} where ngo_id = ${ngo_id} `, { type: db.Sequelize.QueryTypes.SELECT })
            return getAllData ?? [] // Return the retrieved data
        } catch (error) {
            throw error
        }
    }, getAllNgoByRequestIdOnly: async (RequestId) => {
        try {
            const getAllData = await db.sequelize.query(` ${ViewFieldTableVise.NGO_REQUEST_MAPPING_FIELDS}  where RequestId = ${RequestId} `, { type: db.Sequelize.QueryTypes.SELECT })
            return getAllData ?? []
        } catch (error) {
            throw error
        }
    }, getNgoDataByFilterAndNgoId: async (ngo_id, offset = null, limit = null, status_id = null) => {
        try {
            let baseQuery = `${ViewFieldTableVise.NGO_REQUEST_MAPPING_FIELDS} WHERE ngo_id = :ngo_id`;
            const replacements = { ngo_id };

            if (status_id !== null && status_id !== undefined && status_id !== "null" && status_id !== "undefined" && status_id !== "") {
                baseQuery += ` AND status_id = :status_id`;
                replacements.status_id = status_id;
            }

            baseQuery += ` ORDER BY Request_Ngo_Id DESC`;

            if (limit !== null && offset !== null && limit !== "null" && limit !== "undefined" && offset !== "null" && offset !== "undefined" && offset !== "" && limit !== "") {
                baseQuery += ` LIMIT :limit OFFSET :offset`;
                replacements.limit = Number(limit);   // ✅ Ensure numeric type
                replacements.offset = Number(offset); // ✅ Ensure numeric type
            }


            const results = await db.sequelize.query(baseQuery, {
                replacements,
                type: db.Sequelize.QueryTypes.SELECT,
            });

            return results ?? [];
        } catch (error) {
            throw error;
        }
    }, getRequestNgoCountById: async (ngo_id) => {
        try {
            const getData = await db.sequelize.query(` SELECT 
            COUNT(RequestId) AS total_ngo_request,
            SUM(CASE WHEN status_id = ${STATUS_MASTER.REQUEST_APPROVAL_PENDINNG} THEN 1 ELSE 0 END) AS total_request_ngo_approval_pending,
            SUM(CASE WHEN status_id = ${STATUS_MASTER.REQUEST_APPROVED} THEN 1 ELSE 0 END) AS total_request_approved_status,
            SUM(CASE WHEN status_id = ${STATUS_MASTER.REQUEST_REJECTED} THEN 1 ELSE 0 END) AS total_request_rejected
            FROM ${VIEW_NAME.GET_ALL_NGO_REQUEST} where ngo_id = ${ngo_id}`, { type: db.Sequelize.QueryTypes.SELECT })
            return getData[0] ?? []
        } catch (error) {
            throw error
        }
    }, UpdateRequestCountByNgoDataCount: async (ngo_id, fieldName, amount) => {
        try {
            // Validation: Ensure amount is a number
            const valueChange = parseInt(amount);
            if (isNaN(valueChange)) {
                throw new Error("Amount must be a valid number");
            }

            // Sequelize .increment() handles negative numbers automatically!
            // If amount is 1, it adds 1.
            // If amount is -1, it subtracts 1.
            const result = await RequestNgoModel(db.sequelize).increment(fieldName, {
                by: valueChange,
                where: { ngo_id: ngo_id }
            });

            return result;
        } catch (error) {
            throw error;
        }
    },UpdateRequestCountByRequestListDataCount: async (RequestId, fieldName, amount) => {
    try {
        const valueChange = Number(amount)
        if (Number.isNaN(valueChange) || valueChange === 0) {
            return 0 // nothing to update
        }

        const whereCondition = Array.isArray(RequestId)
            ? { RequestId: RequestId }        // IN (...)
            : { RequestId: RequestId }        // =

        const result = await RequestNgoModel(db.sequelize).increment(
            fieldName,
            {
                by: valueChange,
                where: whereCondition
            }
        )

        return result
    } catch (error) {
        throw error
    }
},UpdateRequestCountByNgoIdListDataCount: async (ngo_id, fieldName, amount) => {
    try {
        // 1. Validation: Ensure amount is a number
        const valueChange = parseInt(amount);
        if (isNaN(valueChange)) {
            throw new Error("Amount must be a valid number");
        }

        // 2. Validation: Ensure ngo_id is present and valid
        if (!ngo_id || (Array.isArray(ngo_id) && ngo_id.length === 0)) {
            throw new Error("No Valid NGO ID(s) provided");
        }

        // 3. Execution
        // Sequelize automatically detects if 'ngo_id' is an array or a single value.
        // - Single value (e.g., 5) -> WHERE `ngo_id` = 5
        // - Array (e.g., [1, 2, 3]) -> WHERE `ngo_id` IN (1, 2, 3)
        const result = await RequestNgoModel(db.sequelize).increment(fieldName, {
            by: valueChange,
            where: { 
                ngo_id: ngo_id 
            }
        });

        return result;
    } catch (error) {
        throw error;
    }
},UpdateRequestCountByRequestNgoId: async (Request_Ngo_Id, fieldName, amount) => {
    try {
        // 1. Validation: Ensure amount is a number
        const valueChange = parseInt(amount);
        if (isNaN(valueChange)) {
            throw new Error("Amount must be a valid number");
        }

        // 2. Validation: Ensure Request_Ngo_Id is present
        // This handles both single ID (e.g., 5) and Array of IDs (e.g., [1, 5, 10])
        if (!Request_Ngo_Id || (Array.isArray(Request_Ngo_Id) && Request_Ngo_Id.length === 0)) {
            throw new Error("No Valid Request_Ngo_Id(s) provided");
        }

        // 3. Execution
        // If Request_Ngo_Id is [1, 2, 3], SQL becomes: WHERE Request_Ngo_Id IN (1, 2, 3)
        const result = await RequestNgoModel(db.sequelize).increment(fieldName, {
            by: valueChange,
            where: { 
                Request_Ngo_Id: Request_Ngo_Id 
            }
        });

        return result;
    } catch (error) {
        throw error;
    }
}

}

export default RequestNgoDAL