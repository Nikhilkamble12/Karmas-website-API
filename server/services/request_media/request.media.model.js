import { DataTypes } from "sequelize";

const RequestMediaModel = (sequelize) => {
  return sequelize.define(
    "request_media",
    {
      request_media_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      RequestId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      img_name: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      media_url: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      media_type:{
        type:DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'image'
      },
      sequence: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
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
      tableName: "request_media",
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
  )
}

export default RequestMediaModel;