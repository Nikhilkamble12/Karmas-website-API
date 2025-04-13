import { DataTypes } from "sequelize";

const PostMediaModel = (sequelize) => { 
  return sequelize.define("PostMedia", {
    media_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    sequence:{
      type:DataTypes.INTEGER,
      allowNull:true
    },
    post_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    media_type: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    media_url: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: 1,
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
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
    tableName: "PostMedia",
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
  })
}

export default PostMediaModel