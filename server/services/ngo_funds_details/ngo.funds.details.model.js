import { DataTypes } from "sequelize";

const NgoFundsDetailsModel = (sequelize)=>{
    return sequelize.define("ngo_funds_details",{
        ngo_funds_id:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        }, ngo_id:{
            type:DataTypes.INTEGER,
            allowNull:false
        }, department_name:{
            type:DataTypes.STRING(100),
            allowNull:true
        }, source:{
            type:DataTypes.STRING(100),
            allowNull:true
        }, financial_year:{
            type:DataTypes.STRING(20),
            allowNull:true
        }, amount_sanctioned:{
            type:DataTypes.DECIMAL(15,2),
            allowNull:true
        }, purpose:{
            type:DataTypes.TEXT,
            allowNull:false
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
        tableName: "ngo_funds_details",
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

export default NgoFundsDetailsModel