import { DataTypes } from "sequelize";

const UserMasterModel = (sequelize)=>{
    return sequelize.define("user_master",{
        user_id:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: true,
        }, user_name:{
            type:DataTypes.STRING(120),
            allowNull:false,
            unique:true
        }, password:{
            type:DataTypes.STRING(120),
            allowNull:false
        }, full_name:{
            type:DataTypes.STRING(300),
            allowNull:true
        }, email_id:{
            type:DataTypes.STRING(200),
            allowNull:false
        }, is_active:{
            type:DataTypes.TINYINT(1),
            allowNull:false,
            DefaultValue:true
        }, created_by:{
            type:DataTypes.INTEGER,
            allowNull:false
        }, created_at:{
            type:DataTypes.DATE,
        }, modified_by:{
            type:DataTypes.INTEGER,
            allowNull:true
        }, modified_at:{
            type:DataTypes.DATE,
            allowNull:true
        }, deleted_by:{
            type:DataTypes.INTEGER,
            allowNull:true
        }, deleted_at:{
            type:DataTypes.DATE,
            allowNull:true
        }
    },{
        tableName: "user_master",
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
export default UserMasterModel