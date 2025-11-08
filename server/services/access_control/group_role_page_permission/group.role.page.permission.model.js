import { DataTypes } from "sequelize";

const GroupRolePagePermissionModel = (sequelize) => {
    return sequelize.define("group_role_page_permission", {
        role_page_permission_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        }, role_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        }, page_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        }, permission: {
            type: DataTypes.INTEGER,
            allowNull: true
        }, description: {
            type: DataTypes.STRING(150),
            allowNull: true
        }, is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        created_by: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: DataTypes.NOW
        },
        modified_by: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        modified_at: {
            type: DataTypes.DATE,
            allowNull: true
        },
        deleted_by: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        deleted_at: {
            type: DataTypes.DATE,
            allowNull: true
        }
    }, {
        tableName: "group_role_page_permission",
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

export default GroupRolePagePermissionModel