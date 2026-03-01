import { DataTypes } from "sequelize";

const PostTagModel = (sequelize)=>{
    return sequelize.define("post_tag",{
        post_tag_id:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull:true,
        autoIncrement: true
        }, post_id:{
            type:DataTypes.INTEGER,
            allowNull:true
        }, tagged_user_id:{
            type:DataTypes.INTEGER,
            allowNull:true
        }, user_id:{
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
        tableName: "post_tag",
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

export default PostTagModel