import { DataTypes } from "sequelize";

const UserRequestStatsModel = (sequelize)=>{
    return sequelize.define("user_request_stats",{
        request_stats_id:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
        }, user_id:{
            type:DataTypes.INTEGER,
            allowNull:false
        }, total_request:{
            type:DataTypes.INTEGER,
            allowNull:true
        }, total_draft_request:{
            type:DataTypes.INTEGER,
            allowNull:true
        }, total_insiated_request:{
            type:DataTypes.INTEGER,
            allowNull:true
        }, total_rejected_request:{
            type:DataTypes.INTEGER,
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
        tableName: "user_request_stats",
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

export default UserRequestStatsModel