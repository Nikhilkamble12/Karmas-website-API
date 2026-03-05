import { DataTypes } from "sequelize";

const NgoRequestDocumentCategoryModel = (sequelize) => {
    return sequelize.define(
        "ngo_request_document_category", {
        categrory_document_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        }, ngo_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        }, category_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        }, document_type_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        }, is_mandatory: {
            type: DataTypes.TINYINT(1),
            allowNull: true,
        }, is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        created_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: DataTypes.NOW,
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
    }, {
        tableName: "ngo_request_document_category",
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
    }
    )
}

export default NgoRequestDocumentCategoryModel