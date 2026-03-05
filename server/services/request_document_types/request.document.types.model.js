import { DataTypes } from "sequelize";

const RequestDocumentsTypesModel = (sequelize) => {
    return sequelize.define("request_document_types", {
        document_type_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        document_type: {
            type: DataTypes.STRING(500),
            allowNull: false,
        },
        is_active: {
            type: DataTypes.TINYINT(1),
            defaultValue: 1,
        },
        created_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        modified_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        modified_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        deleted_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        deleted_at: {
            type: DataTypes.DATE,
            allowNull: true,
        }
    }, {
        tableName: "request_document_types",
        // 'paranoid: true' uses the deleted_at column for soft deletes
        paranoid: true, 
        // We set timestamps to false because you are defining 
        // custom names like modified_at instead of updatedAt
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
    });
};

export default RequestDocumentsTypesModel;