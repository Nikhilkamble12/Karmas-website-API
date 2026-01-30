import { DataTypes } from "sequelize";

const TicketMediaModel = (sequlize) => {
    return sequlize.define(
        "ticket_media",
        {
            ticket_media_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
            },
            ticket_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            sequence: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            media_type: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            media_url: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            s3_url: {
                type: DataTypes.STRING(500),
                allowNull: false,
            },
            expiry_time: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            is_active: {
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
            }
        },
        {
            tableName: "ticket_media",
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

export default TicketMediaModel;