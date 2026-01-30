import { DataTypes } from "sequelize";

const TempEmailVerificationModel = (sequelize) => {
    return sequelize.define("temp_email_verification", {
        id: {
            type:DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        email_id: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true
        },
        otp: {
            type: DataTypes.STRING(10),
            allowNull: false
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false
        },
        expires_at: {
            type: DataTypes.DATE,
            allowNull: false
        }
    }, {
        tableName: "temp_email_verification",
        paranoid: true,
        timestamps: false
    });
};

export default TempEmailVerificationModel;
