import { DataTypes } from "sequelize";

const BonusHistoryModel = (sequelize)=>{
    return sequelize.define("bonus_history",{
        history_id:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        }, bonus_id:{
            type:DataTypes.INTEGER,
            allowNull:false
        }, previous_create_score:{
            type:DataTypes.INTEGER,
            allowNull:true
        }, new_create_score:{
            type:DataTypes.INTEGER,
            allowNull:true
        }, change_date:{
            type:DataTypes.DATE,
            allowNull:true
        }, changed_by:{
            type:DataTypes.DATE,
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
        tableName: "bonus_history",
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

export default BonusHistoryModel