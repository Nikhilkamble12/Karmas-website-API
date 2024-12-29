import { DataTypes } from "sequelize";

const StateMasterModel = (sequelize)=>{
    return sequelize.define("state_master",{
        state_id:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        }, state_name:{
            type:DataTypes.STRING(200),
            allowNull:false
        }, county_id:{
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
        tableName: "state_master",
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
export default StateMasterModel