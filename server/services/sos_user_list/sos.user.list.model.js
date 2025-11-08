import { DataTypes } from "sequelize";

const SosUserListModel = (sequelize)=>{
    return sequelize.define(
        "sos_user_list",{
            sos_user_id:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
            }, user_id:{
            type:DataTypes.INTEGER,
            allowNull:true
            }, contact_user_id:{
            type:DataTypes.INTEGER,
            allowNull:true
            },is_currently_active:{
                type:DataTypes.BOOLEAN,
                allowNull:true
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
        },{
            tableName: "sos_user_list",
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

export default SosUserListModel