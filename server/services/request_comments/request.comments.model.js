import {DataTypes} from "sequelize"

const RequestCommentsModel = (sequelize)=>{
    return sequelize.define("request_comments",{
        comment_id:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
        }, user_id:{
            type:DataTypes.INTEGER,
            allowNull:true
        }, request_id:{
            type:DataTypes.INTEGER,
            allowNull:true
        }, comment_text:{
            type:DataTypes.TEXT,
            allowNull:false
        }, total_comment:{
            type:DataTypes.INTEGER,
            allowNull:false
        }, parent_id:{
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
        tableName: "request_comments",
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

export default RequestCommentsModel