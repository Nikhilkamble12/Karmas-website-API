import { DataTypes } from "sequelize";

const BugMasterModel = (sequelize) => {
  return sequelize.define(
    "bug_master",
    {
      bug_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      bug_code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      bug_title: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      bug_description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      module_type_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
      },
      bug_type_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
      },
      reported_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      assigned_to: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      severity_status_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      priority_status_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      bug_status_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      resolution_summary: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      steps_to_reproduce: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      expected_behavior: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      actual_behavior: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      environment: {
        type: DataTypes.STRING(150),
        allowNull: true,
      },
      screenshot_url: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      log_reference: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },

      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: 1,
      },
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      modified_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      modified_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      deleted_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "bug_master",
      paranoid: true,
      timestamps: false,
      defaultScope: {
        attributes: {
          exclude: [
            "created_by",
            "modified_by",
            "deleted_by",
            "deleted_at",
            "is_active",
            "created_at",
            "modified_at",
          ],
        },
      },
    }
  );
};

export default BugMasterModel;
