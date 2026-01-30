import { DataTypes } from "sequelize";

const OtpTypeMasterModel = (sequelize) => {
    return sequelize.define(
        "otp_type_master",
        {
            otp_type_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            otp_type_name: {
                type: DataTypes.STRING(100),
                allowNull: false
            },
            description: {
                type: DataTypes.STRING(500),
                allowNull: true
            },
            is_active: {
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
        },
        {
            tableName: "otp_type_master",
            paranoid: false,        // ❌ no deleted_at column, so no soft delete
            timestamps: false,      // we handle created_at & modified_at manually

            defaultScope: {
                attributes: {
                    exclude: [
                        "created_by",
                        "created_at",
                        "modified_by",
                        "modified_at",
                        "is_active"
                    ],
                },
            },
        }
    );
};

export default OtpTypeMasterModel;
