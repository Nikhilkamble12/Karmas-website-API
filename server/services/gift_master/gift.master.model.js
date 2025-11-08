import { DataTypes } from "sequelize";

const GiftMasterModel = (sequelize) => {
  return sequelize.define(
    "gift_master",
    {
      gift_master_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      company_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      gift_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      gift_logo:{
        type: DataTypes.STRING(300),
        allowNull: true,
      },
      gift_logo_path:{
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      gift_score_required: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      gift_amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      gift_t_c: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      how_to_redeem: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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
      tableName: "gift_master",
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

export default GiftMasterModel;
