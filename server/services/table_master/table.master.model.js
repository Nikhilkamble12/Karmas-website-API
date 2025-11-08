import { DataTypes } from "sequelize";

const TableMasterModel = (sequelize)=>{
    return sequelize.define("table_master",{
        table_id:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        }, table_name:{
            type:DataTypes.STRING(100),
            allowNull:false
        }, is_active:{
            type:DataTypes.BOOLEAN,
            allowNull:true,
            defaultValue:1
        }
    },{
        tableName: "table_master",
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
export default TableMasterModel