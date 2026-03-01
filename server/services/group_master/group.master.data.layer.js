import GroupMasterModel from "./group.master.model.js";
import commonPath from "../../middleware/comman_path/comman.path.js";

const { db, ViewFieldTableVise, tokenData } = commonPath;

const GroupMasterDAL = {

  // Create new group
  CreateData: async (data) => {
    try {
      const createdData = await GroupMasterModel(db.sequelize).create(data);
      return createdData;
    } catch (error) {
      throw error;
    }
  },

  // Update existing group
  UpdateData: async (group_id, data) => {
    try {
      const updateData = await GroupMasterModel(db.sequelize).update(data, {
        where: { group_id: group_id },
      });
      return updateData;
    } catch (error) {
      throw error;
    }
  },

  // Get all groups (via view)
  getAllDataByView: async () => {
    try {
      const getAllData = await db.sequelize.query(
        `${ViewFieldTableVise.GROUP_MASTER_FIELDS}`,
        { type: db.Sequelize.QueryTypes.SELECT }
      );
      return getAllData;
    } catch (error) {
      throw error;
    }
  },

  // Get group by ID (via view)
  getDataByIdByView: async (group_id) => {
    try {
      const getDataById = await db.sequelize.query(
        ` ${ViewFieldTableVise.GROUP_MASTER_FIELDS} where group_id = ${group_id} `,
        { type: db.Sequelize.QueryTypes.SELECT }
      );
      return getDataById[0] ?? [];
    } catch (error) {
      throw error;
    }
  },

  // Soft delete group
  deleteDataById: async (group_id, req, res) => {
    try {
      const [deleteDataById] = await GroupMasterModel(db.sequelize).update(
        {
          is_active: 0,
          deleted_by: tokenData(req, res),
          deleted_at: new Date(),
        },
        {
          where: {
            group_id: group_id,
          },
        }
      );

      return deleteDataById;
    } catch (error) {
      throw error;
    }
  },getDataByCodeByView: async (group_code) => {
    try {
      const getDataById = await db.sequelize.query(
        ` ${ViewFieldTableVise.GROUP_MASTER_FIELDS} where group_code = '${group_code}' `,
        { type: db.Sequelize.QueryTypes.SELECT }
      );
      return getDataById[0] ?? [];
    } catch (error) {
      throw error;
    }
  },

};

export default GroupMasterDAL;