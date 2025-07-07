import { DataTypes } from "sequelize";

const PageModel = (sequelize)=>{
    return sequelize.define("page",{
        page_id:{
            ype: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        }, parent_id:{
            type:DataTypes.INTEGER,
            allowNull:true
        }, page_name:{
            type:DataTypes.STRING(100),
            allowNull:true
        }, page_url:{
            type:DataTypes.STRING(150),
            allowNull:true
        }, mobile_url:{
            type:DataTypes.STRING(150),
            allowNull:true
        }, interface:{
            type:DataTypes.STRING(150),
            allowNull:true
        }, module_name:{
            type:DataTypes.STRING(50),
            allowNull:true
        },is_active: {
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
        tableName: "page",
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

export default PageModel