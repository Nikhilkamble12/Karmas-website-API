import { DataTypes } from "sequelize";

const CountryMasterModel = (sequelize)=>{
    return sequelize.define("country_master",{
        country_id:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: true,
        }, country_name:{
            type:DataTypes.STRING(200)
        }, is_active:{
            type:DataTypes.TINYINT(1),
            allowNull:false,
            defaultValue:true
        },created_by:{
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
        tableName: "country_master",
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
export default CountryMasterModel