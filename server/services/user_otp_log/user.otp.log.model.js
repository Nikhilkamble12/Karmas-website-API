import { DataTypes } from "sequelize";

const UserOtpLogModel = (sequelize) => {
    return sequelize.define(
        "user_otp_log",
        {
            otp_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },

            user_id: {
                type: DataTypes.INTEGER,
                allowNull: false
            },

            otp_code: {
                type: DataTypes.STRING(10),
                allowNull: false
            },

            otp_type_id: {
                type: DataTypes.INTEGER,
                allowNull: false
            },

            expiry_at: {
                type: DataTypes.DATE,
                allowNull: false
            },

            is_used: {
                type: DataTypes.TINYINT(1),
                allowNull: false,
                defaultValue: 0
            },

            used_at: {
                type: DataTypes.DATE,
                allowNull: true
            },

            attempt_count: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0
            },

            max_attempt_limit: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 5
            },

            is_active: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true
            },

            created_by: {
                type: DataTypes.INTEGER,
                allowNull: true
            },

            created_at: {
                type: DataTypes.DATE,
                allowNull: false,
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
            },

            ip_address: {
                type: DataTypes.STRING(45),
                allowNull: true
            },

            device_info: {
                type: DataTypes.STRING(300),
                allowNull: true
            },
        },

        {
            tableName: "user_otp_log",
            timestamps: false,
            paranoid: true, // enables deleted_at soft delete
            defaultScope: {
                attributes: {
                    exclude: [
                        "created_by",
                        "created_at",
                        "modified_by",
                        "modified_at",
                        "deleted_by",
                        "deleted_at",
                        "is_active"
                    ],
                },
            },
        }
    );
};

export default UserOtpLogModel;
