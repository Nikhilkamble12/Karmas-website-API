import { DataTypes } from "sequelize";

const BonusMasterModel = (sequelize)=>{
    return sequelize.define("bonus_master",{
        bonus_id:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        }, create_score:{
            type:DataTypes.INTEGER,
            allowNull:false
        }, start_date:{
            type:DataTypes.DATE,
            allowNull:false
        }, end_date:{
            type:DataTypes.DATE,
            allowNull:false
        }, score_category:{
            type:DataTypes.STRING(255),
            allowNull:false
        }, status_name:{
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
        tableName: "bonus_master",
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

export default BonusMasterModel