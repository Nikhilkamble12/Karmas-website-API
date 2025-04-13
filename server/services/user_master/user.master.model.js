import { DataTypes } from "sequelize";

const UserMasterModel = (sequelize) => {
    return sequelize.define("user_master", {
        user_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: true,
        }, user_name: {
            type: DataTypes.STRING(120),
            allowNull: false,
            unique: true
        }, password: {
            type: DataTypes.STRING(120),
            allowNull: false
        }, full_name: {
            type: DataTypes.STRING(300),
            allowNull: true
        }, role_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },is_account_public:{
            type:DataTypes.TINYINT(1),
            DefaultValue: true
        },
         email_id: {
            type: DataTypes.STRING(200),
            allowNull: false
        }, gender: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        enrolling_date: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        ngo_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            DefaultValue: null
        },first_time_login:{
            type:DataTypes.TINYINT(1),
            allowNull:true,
            DefaultValue: true
        },
        file_name:{
            type:DataTypes.STRING(300),
            allowNull:true
        },
        file_path:{
            type:DataTypes.STRING(500),
            allowNull:true
        },
        is_active: {
            type: DataTypes.TINYINT(1),
            allowNull: false,
            DefaultValue: true
        }, created_by: {
            type: DataTypes.INTEGER,
            allowNull: false
        }, created_at: {
            type: DataTypes.DATE,
        }, modified_by: {
            type: DataTypes.INTEGER,
            allowNull: true
        }, modified_at: {
            type: DataTypes.DATE,
            allowNull: true
        }, deleted_by: {
            type: DataTypes.INTEGER,
            allowNull: true
        }, deleted_at: {
            type: DataTypes.DATE,
            allowNull: true
        }
    }, {
        tableName: "user_master",
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
export default UserMasterModel