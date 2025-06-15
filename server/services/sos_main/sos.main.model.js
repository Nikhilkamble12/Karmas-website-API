import { DataTypes } from "sequelize";

const SosMainModel = (sequelize) => {
    return sequelize.define(
        "sos_main", {
        sos_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        }, user_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        }, is_sos_on: {
            type: DataTypes.BOOLEAN,
            allowNull: true
        }, start_time: {
            type: DataTypes.DATE,
            allowNull: true
        }, end_time: {
            type: DataTypes.DATE,
            allowNull: true
        }, reason: {
            type: DataTypes.STRING(255),
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
        tableName: "sos_main",
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
        }
    }
    )
}
export default SosMainModel