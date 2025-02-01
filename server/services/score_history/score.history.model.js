import { DataTypes } from "sequelize";

const ScoreHistoryModel = (sequelize)=>{
    return sequelize.define("score_history",{
        sr_no:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        }, user_id:{
            type:DataTypes.INTEGER,
            allowNull:false
        }, request_name:{
            type:DataTypes.STRING(255),
            allowNull:true
        }, git_score:{
            type:DataTypes.INTEGER,
            allowNull:true
        }, description:{
            type:DataTypes.TEXT,
            allowNull:true
        }, date:{
            type:DataTypes.DATE,
            allowNull:true
        },status_id:{
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
        tableName: "score_history",
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
export default ScoreHistoryModel