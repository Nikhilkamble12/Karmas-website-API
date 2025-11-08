import { DataTypes } from "sequelize";

const NgoLevelModel = (sequelize) => {
    return sequelize.define("ngo_level", {
        ngo_level_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        }, level_name: {
            type: DataTypes.TEXT,
            allowNull: false
        }, description: {
            type: DataTypes.TEXT,
            allowNull: true
        }, total_modules: {
            type: DataTypes.INTEGER,
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
        tableName: "score_history",
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

export default NgoLevelModel