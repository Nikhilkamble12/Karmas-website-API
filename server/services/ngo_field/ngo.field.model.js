import { DataTypes } from "sequelize";

const NgoFieldModel = (sequelize) =>{
    return sequelize.define("ngo_field",{
        ngo_field_id:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        }, field_name:{
            type:DataTypes.STRING(100),
            allowNull:false
        }, field_description:{
            type:DataTypes.STRING(400),
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
        deleted_by: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        deleted_at: {
            type: DataTypes.DATE,
            allowNull: true
        }
    },{
        tableName: "ngo_field",
        paranoid: true,
        timestamps: false,
        defaultScope: {
            attributes: {
                exclude: [
                    "created_by",
                    "deleted_by",
                    "deleted_at",
                    "is_active",
                    "created_at",
                ],
            },
        },
    })
}
export default NgoFieldModel