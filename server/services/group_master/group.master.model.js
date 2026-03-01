import { DataTypes } from "sequelize";

const GroupMasterModel = (sequelize) => {
    return sequelize.define(
        "group_master",
        {
            group_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            group_code: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            group_name: {
                type: DataTypes.STRING(500),
                allowNull: true,
            },
            file_path: {
                type: DataTypes.STRING(700),
                allowNull: true,
            },
            s3_url:{
                type: DataTypes.STRING(700),
                allowNull: true,
            },
            file_name: {
                type: DataTypes.STRING(700),
                allowNull: true,
            },
            is_public: {
                type: DataTypes.TINYINT(1),
                allowNull: true,
            },
            is_announcement: {
                type: DataTypes.TINYINT(1),
                allowNull: true,
            },
            admins: {
                type: DataTypes.STRING(1000),
                allowNull: true,
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
                allowNull: true,
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
            tableName: "group_master",
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

export default GroupMasterModel;