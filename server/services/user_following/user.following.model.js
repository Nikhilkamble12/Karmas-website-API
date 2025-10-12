import { DataTypes } from "sequelize";

const UserFollowingModel = (sequelize) => {
  return sequelize.define("user_following", {
    follow_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    }, user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    }, following_user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    }, followed_at: {
      type: DataTypes.DATE,
      allowNull: true
    }, is_following: {
      type: DataTypes.TINYINT(1),
      allowNull: true,
      defaultValue: false
    },
    is_private: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 1
    },
    is_rejected: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 1
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
  }, {
    tableName: "user_following",
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
export default UserFollowingModel