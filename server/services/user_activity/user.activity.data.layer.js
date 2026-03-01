import UserActivityModel from "./user.activity.model.js";
import commonPath from "../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
import VIEW_NAME from "../../utils/db/view.constants.js";
const { db, ViewFieldTableVise, tokenData } = commonPath // Destructure necessary components from commonPath

const UserActivityDAL = {
    // Method to create a new record in the database
    CreateData: async (data) => {
        try {
            const createdData = await UserActivityModel(db.sequelize).create(data)
            return createdData // Return the created data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, 
    // Method to update an existing record by its ID
    UpdateData: async (user_activity_id, data, transaction = null) => {
        try {
            const options = { where: { user_activity_id: user_activity_id } };
            if (transaction) options.transaction = transaction;
            const updateData = await UserActivityModel(db.sequelize).update(data, options)
            return updateData // Return the result of the update operation
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    },
    // Method to retrieve all records by view
    getAllDataByView: async () => {
        try {
            let getAllData = await db.sequelize.query(` ${ViewFieldTableVise.USER_ACTIVITY_FIELDS} `, { type: db.Sequelize.QueryTypes.SELECT })
            let fullData = []
            if(getAllData && getAllData.length>0){
            fullData = getAllData.map(row => ({
            ...row, // keep all existing columns
            file_path:
                row.file_path &&
                row.file_path !== 'null' &&
                row.file_path.trim() !== ''
                ? `${process.env.GET_LIVE_CURRENT_URL}/resources/${row.file_path}`
                : null
            }));
        }
            return fullData // Return the retrieved data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    },
    // Method to retrieve a specific record by its ID
    getDataByIdByView: async (user_activity_id) => {
        try {
            const getDataById = await db.sequelize.query(` ${ViewFieldTableVise.USER_ACTIVITY_FIELDS} where user_activity_id  = ${user_activity_id} `, { type: db.Sequelize.QueryTypes.SELECT })
            const resultWithImages = getDataById.map(row => ({
            ...row, // keep all existing columns
            file_path:
                row.file_path &&
                row.file_path !== 'null' &&
                row.file_path.trim() !== ''
                ? `${process.env.GET_LIVE_CURRENT_URL}/resources/${row.file_path}`
                : null
            }));
            return resultWithImages[0] ?? [] // Return the retrieved data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, 
    // Method to mark a record as deleted (soft delete)
    deleteDataById: async (user_activity_id, req, res) => {
        try {
            const [deleteDataById] = await UserActivityModel(db.sequelize).update({ is_active: 0, deleted_by: tokenData(req, res), deleted_at: new Date() }, {
                where: {
                    user_activity_id: user_activity_id
                }
            })
            return deleteDataById
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    },getDataByUserId : async(user_id)=>{
        try{
            const getData = await db.sequelize.query(` ${ViewFieldTableVise.USER_ACTIVITY_FIELDS} where user_id = ${user_id} `,{type:db.Sequelize.QueryTypes.SELECT})
            const resultWithImages = getData.map(row => ({
            ...row, // keep all existing columns
            file_path:
                row.file_path &&
                row.file_path !== 'null' &&
                row.file_path.trim() !== ''
                ? `${process.env.GET_LIVE_CURRENT_URL}/resources/${row.file_path}`
                : null
            }));
            return resultWithImages
        }catch(error){
            throw error
        }
    },updateByUserId:async(user_id,data)=>{
        try{
            const updateData = await UserActivityModel(db.sequelize).update(data, { where: { user_id: user_id } })
            return updateData // Return the result of the update operation
        }catch(error){
            throw error
        }
    },UpdateUserDataCount: async (user_id, fieldName, amount) => {
    try {
        // Validation: Ensure amount is a number
        const valueChange = parseInt(amount);
        console.log("user_id",user_id)
        console.log("fieldName",fieldName)
        console.log("amount",amount)
        if (isNaN(valueChange)) {
            throw new Error("Amount must be a valid number");
        }

        // Sequelize .increment() handles negative numbers automatically!
        // If amount is 1, it adds 1.
        // If amount is -1, it subtracts 1.
        const result = await UserActivityModel(db.sequelize).increment(fieldName, { 
            by: valueChange, 
            where: { user_id: user_id } 
        });
        
        return result;
    } catch (error) {
        throw error;
    }
},UpdateGlobalUserDataCount: async (fieldName, amount) => {
    try {
        const valueChange = parseInt(amount);

        if (!fieldName) {
            throw new Error("Field name is required");
        }

        if (isNaN(valueChange)) {
            throw new Error("Amount must be a valid number");
        }

        const result = await UserActivityModel(db.sequelize).increment(
            fieldName,
            { by: valueChange }
        );

        return result;
    } catch (error) {
        throw error;
    }
},

}
export default UserActivityDAL