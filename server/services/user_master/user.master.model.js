import { all } from "axios";
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
            defaultValue: true
        },
         email_id: {
            type: DataTypes.STRING(200),
            allowNull: false,
            unique: true
        }, mobile_no: {
            type: DataTypes.STRING(20),
            allowNull: true
        }, gender: {
            type: DataTypes.STRING(100),
            allowNull: true,
        }, bio: {
            type: DataTypes.STRING(1000),
            allowNull: true
        }, enrolling_date: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        ngo_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null
        },first_time_login:{
            type:DataTypes.TINYINT(1),
            allowNull:true,
            defaultValue: true
        },
        file_name:{
            type:DataTypes.STRING(300),
            allowNull:true
        },
        file_path:{
            type:DataTypes.STRING(500), 
           allowNull:true
        }, bg_image : {
            type: DataTypes.STRING(300),
            allowNull: true
        }, bg_image_path : {
            type: DataTypes.STRING(500),    
            allowNull: true
        },  reset_otp:{
            type:DataTypes.STRING(20),
            allowNull:true
        },
        reset_otp_expiry:{
            type:DataTypes.DATE,
            allowNull:true
        },is_blacklisted:{
            type:DataTypes.TINYINT,
            allowNull:true,
            defaultValue:false
        }, ngo_level_id : {
            type: DataTypes.INTEGER,
            allowNull: true
        }, blacklist_reason: {
            type: DataTypes.STRING(500),
            allowNull: true
        }, is_active: {
            type: DataTypes.TINYINT(1),
            allowNull: false,
            defaultValue: true
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