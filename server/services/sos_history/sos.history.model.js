import { DataTypes } from "sequelize";

const SosHistoryModel = (sequelize)=>{
    return sequelize.define("sos_history",{
        history_id:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
        }, sos_id:{
            type:DataTypes.INTEGER,
            allowNull:false
        }, user_id:{
            type:DataTypes.INTEGER,
            allowNull:true
        }, latitude:{
            type:DataTypes.DECIMAL(10,7),
            allowNull:true
        }, longitude:{
            type:DataTypes.DECIMAL(10,7),
            allowNull:true
        }, captured_time:{
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
        tableName: "sos_history",
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

export default SosHistoryModel