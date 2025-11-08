import { DataTypes } from "sequelize";

const NotificationHistoryModel = (sequelize)=>{
    return sequelize.define("notification_history",{
        notification_history_id:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        }, token_id:{
            type:DataTypes.STRING(255),
            allowNull:true
        }, user_id:{
            type:DataTypes.INTEGER,
            allowNull:true
        },user_image:{
            type:DataTypes.STRING(1000),
            allowNull:true
        }, ngo_id:{
        type:DataTypes.INTEGER,
            allowNull:true
        }, request_id:{
            type:DataTypes.INTEGER,
            allowNull:true
        }, post_id:{
            type:DataTypes.INTEGER,
            allowNull:true
        }, notification_details:{
            type:DataTypes.TEXT,
            allowNull:true
        }, notification_type:{
            type:DataTypes.STRING(150),
            allowNull:true
        },image_object:{
            type:DataTypes.JSON,
            allowNull:true
        },
         is_viewed:{
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
        tableName: "notification_history",
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

export default NotificationHistoryModel