import { DataTypes } from "sequelize";

const DesignationGroupPagePermissionModel = (sequelize)=>{
    return sequelize.define("designation_group_page_permission",{
        designation_page_permission_id:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        }, designation_id:{
            type: DataTypes.INTEGER,
            allowNull: true
        },page_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        }, permission: {
            type: DataTypes.INTEGER,
            allowNull: true
        }, description: {
            type: DataTypes.STRING(250),
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
    },{
        tableName: "designation_group_page_permission",
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

export default DesignationGroupPagePermissionModel