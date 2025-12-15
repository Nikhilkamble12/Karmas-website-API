import { DataTypes } from "sequelize";

const TempUserMasterModel = (sequelize) => {
    return sequelize.define(
        "temp_user_master",
        {
            user_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            user_name: {
                type: DataTypes.STRING(120),
                allowNull: false,
            },
            password: {
                type: DataTypes.STRING(120),
                allowNull: false,
            },
            full_name: {
                type: DataTypes.STRING(300),
                allowNull: true,
            },
            role_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            email_id: {
                type: DataTypes.STRING(200),
                allowNull: true,
            },
            mobile_no: {
                type: DataTypes.STRING(20),
                allowNull: true,
            },
            gender: {
                type: DataTypes.STRING(100),
                allowNull: true,
            },
            bio: {
                type: DataTypes.STRING(1000),
                allowNull: true,
            },
            enrolling_date: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            ngo_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            first_time_login: {
                type: DataTypes.BOOLEAN,
                allowNull: true,
                defaultValue: true,
            },
            file_name: {
                type: DataTypes.STRING(300),
                allowNull: true,
            },
            file_path: {
                type: DataTypes.STRING(500),
                allowNull: true,
            },
            ngo_level_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            otp:{
                type:DataTypes.STRING(6),
                allowNull:true
            },otp_expiry_time:{
                type:DataTypes.DATE,
                allowNull:true
            },
            is_active: {
                type: DataTypes.BOOLEAN,
                allowNull: true,
                defaultValue: true,
            },
            created_by: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            created_at: {
                type: DataTypes.DATE,
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
            tableName: "temp_user_master",
            paranoid: true,          // uses deleted_at
            timestamps: false,       // since you manage dates manually
            defaultScope: {
                attributes: {
                    exclude: [
                        "deleted_by",
                        "deleted_at",
                        "created_by",
                        "modified_by",
                    ],
                },
            },
        }
    );
};

export default TempUserMasterModel;
