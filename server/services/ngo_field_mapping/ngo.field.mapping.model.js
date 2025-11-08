import { DataTypes } from "sequelize";

const NgoFieldsMappingModel = (sequelize)=>{
    return sequelize.define("ngo_field_mapping",{
        ngo_field_mapping_id:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        }, ngo_id:{
            type:DataTypes.INTEGER,
            allowNull:true
        }, ngo_field_id:{
            type:DataTypes.INTEGER,
            allowNull:true
        },
        
         is_active: {
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
        tableName: "ngo_field_mapping",
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
export default NgoFieldsMappingModel